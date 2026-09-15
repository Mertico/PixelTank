import {
  isTankKind,
  type ControlInput,
  type WorkerCommand,
  type WorkerEvent,
} from "@pixeltank/shared";
import { AssetLoader } from "./assets";
import { InputController } from "./input";
import type { RenderCommand, RenderEvent, Viewport } from "./render-protocol";
export class GameClient {
  private worker = new Worker("/worker.js", { type: "module" });
  private renderWorker?: Worker;
  private input = new InputController((input) => this.controls(input));
  private assets = new AssetLoader();
  private canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  private status = document.getElementById("connection-status")!;
  private form = document.getElementById("select") as HTMLFormElement;
  private button = document.getElementById("button") as HTMLButtonElement;
  private playerId = "";
  private interval?: ReturnType<typeof setInterval>;
  private events = new AbortController();
  private resolution?: MediaQueryList;
  private dpr = 1;
  private disposed = false;
  async start(): Promise<void> {
    this.button.disabled = true;
    window.addEventListener("pagehide", () => this.dispose(), { once: true });
    if (
      !this.canvas.transferControlToOffscreen ||
      typeof OffscreenCanvas === "undefined"
    ) {
      this.fail("Для игры требуется браузер с поддержкой OffscreenCanvas.");
      return;
    }
    this.worker.onerror = () =>
      this.fail("Ошибка сетевого Worker. Обновите страницу.");
    this.worker.onmessage = (event: MessageEvent<WorkerEvent>) =>
      this.receive(event.data);
    try {
      await this.assets.load((fraction) => {
        document.getElementById("progress--after")!.style.width =
          `${fraction * 100}%`;
      });
      if (this.disposed) return;
      this.renderWorker = new Worker("/render-worker.js", { type: "module" });
      this.renderWorker.onerror = () =>
        this.fail("Ошибка Worker отрисовки. Обновите страницу.");
      this.renderWorker.onmessage = (event: MessageEvent<RenderEvent>) => {
        if (event.data.type === "error") this.fail(event.data.message);
        else {
          document.body.classList.add("active");
          this.button.disabled = false;
        }
      };
      const viewport = this.viewport();
      this.dpr = viewport.dpr;
      const assets = this.assets.bitmaps(this.dpr);
      const canvas = this.canvas.transferControlToOffscreen();
      this.render({ type: "init", canvas, assets, viewport }, [
        canvas,
        ...assets.map(([, bitmap]) => bitmap),
      ]);
      this.observeDpr();
      window.addEventListener("resize", this.resize, {
        signal: this.events.signal,
      });
      this.form.addEventListener(
        "submit",
        (e) => {
          e.preventDefault();
          this.join();
        },
        { signal: this.events.signal },
      );
      this.button.addEventListener("click", () => this.join(), {
        signal: this.events.signal,
      });
      this.interval = setInterval(() => {
        if (this.input.active) this.controls(this.input.read());
      }, 1000 / 30);
    } catch (error) {
      this.fail(String(error));
    }
  }
  private viewport(): Viewport {
    return {
      width: innerWidth,
      height: innerHeight,
      dpr: window.devicePixelRatio || 1,
    };
  }
  private observeDpr(): void {
    this.resolution?.removeEventListener("change", this.resize);
    this.resolution = matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`,
    );
    this.resolution.addEventListener("change", this.resize);
  }
  private resize = (): void => {
    try {
      const viewport = this.viewport();
      const assets =
        viewport.dpr !== this.dpr
          ? this.assets.bitmaps(viewport.dpr)
          : undefined;
      this.dpr = viewport.dpr;
      this.render(
        { type: "resize", viewport, assets },
        assets?.map(([, bitmap]) => bitmap),
      );
      this.observeDpr();
    } catch (error) {
      this.fail(String(error));
    }
  };
  private controls(input: ControlInput): void {
    this.worker.postMessage({ type: "control", input } satisfies WorkerCommand);
    this.render({
      type: "controls",
      input,
      scale: this.input.scale,
      showStats: this.input.showStats,
    });
  }
  private join(): void {
    if (this.button.disabled) return;
    const fields = new FormData(this.form),
      tank = fields.get("select-tank");
    if (!isTankKind(tank)) return;
    this.button.disabled = true;
    this.status.textContent = "Подключение…";
    const url = new URL("/ws", location.href);
    url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
    this.worker.postMessage({
      type: "connect",
      url: url.href,
      name: String(fields.get("select-name") ?? "")
        .trim()
        .slice(0, 32),
      tank,
    } satisfies WorkerCommand);
  }
  private receive(event: WorkerEvent): void {
    this.render({ type: "network", event });
    if (event.type === "status") {
      this.status.textContent = event.message;
      if (!event.connected) {
        this.input.active = false;
        this.input.reset();
      }
    } else if (event.type === "welcome") {
      this.playerId = event.playerId;
      this.form.classList.remove("select-active");
      this.status.textContent = "";
    } else if (event.type === "snapshot") {
      this.input.active = !!this.playerId;
      const name =
        event.snapshot.players.find((p) => p.id === this.playerId)?.name ??
        "connecting";
      this.canvas.setAttribute(
        "aria-label",
        `PixelTank: ${event.snapshot.players.length} players. Player: ${name}`,
      );
    } else if (event.type === "error") this.status.textContent = event.message;
  }
  private render(message: RenderCommand, transfer: Transferable[] = []): void {
    this.renderWorker?.postMessage(message, transfer);
  }
  private fail(message: string): void {
    this.status.textContent = message;
    this.dispose();
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    clearInterval(this.interval);
    this.events.abort();
    this.resolution?.removeEventListener("change", this.resize);
    this.input.dispose();
    this.worker.postMessage({ type: "stop" } satisfies WorkerCommand);
    this.worker.terminate();
    this.render({ type: "stop" });
    this.renderWorker?.terminate();
  }
}
void new GameClient().start();
// Development builds expose a revision file; production has no polling.
if (typeof PIXELTANK_DEV !== "undefined" && PIXELTANK_DEV) {
  let revision: string | undefined;
  setInterval(async () => {
    try {
      const r = await fetch("/revision.txt", { cache: "no-store" });
      if (!r.ok) return;
      const next = await r.text();
      if (revision !== undefined && next !== revision) location.reload();
      revision = next;
    } catch {
      /* server restarting */
    }
  }, 1000);
}
declare const PIXELTANK_DEV: boolean;
