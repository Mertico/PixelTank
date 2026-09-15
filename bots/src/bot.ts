import {
  GameConnection,
  type SocketLike,
  type TankKind,
} from "@pixeltank/shared";
import { NearestTargetStrategy, type BotStrategy } from "./strategy";
export class BotClient {
  readonly connection: GameConnection;
  private playerId = "";
  constructor(
    url: string,
    name: string,
    kind: TankKind,
    strategy: BotStrategy = new NearestTargetStrategy(),
  ) {
    this.connection = new GameConnection(
      () => new WebSocket(url) as unknown as SocketLike,
      {
        set: (fn, ms) => setTimeout(fn, ms),
        clear: (handle) =>
          clearTimeout(handle as ReturnType<typeof setTimeout>),
      },
      { name, tank: kind },
      (m) => {
        if (m.type === "welcome") this.playerId = m.playerId;
        else if (m.type === "snapshot")
          this.connection.send({
            type: "input",
            input: strategy.decide(m.snapshot, this.playerId),
          });
      },
      (connected, message) =>
        console.log(`${name}: ${connected ? "connected" : message}`),
    );
  }
  start(): void {
    this.connection.start();
  }
  stop(): void {
    this.connection.stop();
  }
}
export class BotRunner {
  private bots: BotClient[] = [];
  constructor(
    private url: string,
    private count: number,
  ) {}
  start(): void {
    this.stop();
    for (let i = 0; i < this.count; i++) {
      const kind = (["light", "medium", "heavy"] as const)[
        Math.floor(Math.random() * 3)
      ];
      const bot = new BotClient(this.url, `[Bot ${i + 1}]`, kind);
      this.bots.push(bot);
      bot.start();
    }
  }
  stop(): void {
    for (const bot of this.bots) bot.stop();
    this.bots = [];
  }
}
