import { PROTOCOL_VERSION } from "./config";
import type { ClientMessage, ServerMessage } from "./protocol";
import type { TankKind } from "./types";
// The small transport interface keeps browser and Bun dependencies out of shared code.
export interface SocketLike {
  readyState: number;
  onopen: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
  send(data: string): void;
  close(): void;
}
export interface Scheduler {
  set(fn: () => void, ms: number): unknown;
  clear(handle: unknown): void;
}
export class GameConnection {
  private socket?: SocketLike;
  private retry?: unknown;
  private delay = 250;
  private stopped = true;
  ready = false;
  constructor(
    private factory: () => SocketLike,
    private clock: Scheduler,
    private identity: { name: string; tank: TankKind },
    private receive: (m: ServerMessage) => void,
    private status: (connected: boolean, message: string) => void,
  ) {}
  start(): void {
    this.stop();
    this.stopped = false;
    this.connect();
  }
  private connect(): void {
    if (this.stopped) return;
    const s = (this.socket = this.factory());
    s.onopen = () =>
      s.send(
        JSON.stringify({
          type: "join",
          ...this.identity,
        } satisfies ClientMessage),
      );
    s.onmessage = (event) => {
      try {
        const m = JSON.parse(String(event.data)) as ServerMessage;
        if (m.type === "welcome") {
          if (m.version !== PROTOCOL_VERSION) {
            this.stop();
            this.status(false, "Несовместимая версия протокола");
            return;
          }
          this.ready = true;
          this.delay = 250;
          this.status(true, "");
        }
        this.receive(m);
      } catch {
        this.status(false, "Ошибка сообщения сервера");
      }
    };
    s.onerror = () => s.close();
    s.onclose = () => {
      this.ready = false;
      if (!this.stopped) {
        this.status(false, "Соединение потеряно. Переподключение…");
        this.retry = this.clock.set(() => this.connect(), this.delay);
        this.delay = Math.min(5000, this.delay * 2);
      }
    };
  }
  send(message: ClientMessage): void {
    if (this.ready && this.socket?.readyState === 1)
      this.socket.send(JSON.stringify(message));
  }
  stop(): void {
    this.stopped = true;
    this.ready = false;
    if (this.retry !== undefined) this.clock.clear(this.retry);
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
    }
  }
}
