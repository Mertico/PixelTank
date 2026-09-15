import { resolve, sep } from "node:path";
import {
  PROTOCOL_VERSION,
  TANKS,
  WORLD,
  parseClientMessage,
  type ServerMessage,
} from "@pixeltank/shared";
import { GameWorld } from "./world";
interface Connection {
  id: string;
  joined: boolean;
}
export class GameServer {
  readonly world = new GameWorld();
  private server?: Bun.Server<Connection>;
  private timers: ReturnType<typeof setInterval>[] = [];
  constructor(
    private options: {
      hostname?: string;
      port?: number;
      staticDir?: string;
    } = {},
  ) {}
  get port(): number {
    return this.server!.port!;
  }
  start(): void {
    const root = resolve(this.options.staticDir ?? "dist");
    this.server = Bun.serve<Connection>({
      hostname: this.options.hostname ?? "127.0.0.1",
      port: this.options.port ?? 9080,
      fetch: async (req, server) => {
        const url = new URL(req.url);
        if (url.pathname === "/health") return Response.json({ ok: true });
        if (url.pathname === "/ws") {
          if (
            server.upgrade(req, {
              data: { id: crypto.randomUUID(), joined: false },
            })
          )
            return;
          return new Response("WebSocket required", { status: 400 });
        }
        let path: string;
        try {
          path = resolve(
            root,
            "." +
              decodeURIComponent(
                url.pathname === "/" ? "/index.html" : url.pathname,
              ),
          );
        } catch {
          return new Response("Bad path", { status: 400 });
        }
        if (!path.startsWith(root + sep))
          return new Response("Not found", { status: 404 });
        const file = Bun.file(path);
        return (await file.exists())
          ? new Response(file, { headers: { "Cache-Control": "no-store" } })
          : new Response("Not found", { status: 404 });
      },
      websocket: {
        maxPayloadLength: 4096,
        idleTimeout: 60,
        sendPings: true,
        message: (ws, raw) => {
          const m = parseClientMessage(
            typeof raw === "string" ? raw : raw.toString(),
          );
          const send = (message: ServerMessage) =>
            ws.send(JSON.stringify(message));
          if (!m) {
            send({ type: "error", message: "Некорректное сообщение" });
            return;
          }
          if (m.type === "join") {
            if (ws.data.joined) {
              send({ type: "error", message: "Вход уже выполнен" });
              return;
            }
            ws.data.joined = true;
            this.world.join(ws.data.id, m.name, m.tank);
            send({
              type: "welcome",
              playerId: ws.data.id,
              version: PROTOCOL_VERSION,
              tanks: TANKS,
              world: WORLD,
            });
            ws.subscribe("game");
            send({ type: "snapshot", snapshot: this.world.snapshot() });
          } else if (ws.data.joined) this.world.input(ws.data.id, m.input);
          else send({ type: "error", message: "Сначала выполните вход" });
        },
        close: (ws) => this.world.leave(ws.data.id),
      },
    });
    let last = performance.now(),
      accumulator = 0;
    this.timers.push(
      setInterval(() => {
        const now = performance.now();
        accumulator += Math.min((now - last) / 1000, 0.25);
        last = now;
        while (accumulator >= 1 / WORLD.tickRate) {
          this.world.step();
          accumulator -= 1 / WORLD.tickRate;
        }
        for (const event of this.world.drainDeaths())
          this.broadcast({ type: "death", event });
      }, 1000 / WORLD.tickRate),
    );
    this.timers.push(
      setInterval(
        () =>
          this.broadcast({ type: "snapshot", snapshot: this.world.snapshot() }),
        1000 / WORLD.sendRate,
      ),
    );
    this.timers.push(
      setInterval(
        () =>
          this.broadcast({ type: "stats", players: this.world.playerList() }),
        WORLD.statsInterval,
      ),
    );
  }
  private broadcast(m: ServerMessage): void {
    this.server?.publish("game", JSON.stringify(m));
  }
  stop(): void {
    this.timers.forEach(clearInterval);
    this.timers = [];
    this.server?.stop(true);
    for (const id of this.world.players.keys()) this.world.leave(id);
  }
}
