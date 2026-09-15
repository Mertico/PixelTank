import { PROTOCOL_VERSION, TANKS, WORLD } from "./config";
import type {
  ControlInput,
  DeathEvent,
  Player,
  TankKind,
  WorldSnapshot,
} from "./types";
export type ClientMessage =
  | { type: "join"; name: string; tank: TankKind }
  | { type: "input"; input: ControlInput };
export type ServerMessage =
  | {
      type: "welcome";
      playerId: string;
      version: typeof PROTOCOL_VERSION;
      world: typeof WORLD;
      tanks: typeof TANKS;
    }
  | { type: "snapshot"; snapshot: WorldSnapshot }
  | { type: "stats"; players: Player[] }
  | { type: "death"; event: DeathEvent }
  | { type: "error"; message: string };
export function isTankKind(v: unknown): v is TankKind {
  return v === "light" || v === "medium" || v === "heavy";
}
export function parseClientMessage(raw: string): ClientMessage | null {
  try {
    const m = JSON.parse(raw);
    if (!m || typeof m !== "object") return null;
    if (
      m.type === "join" &&
      typeof m.name === "string" &&
      m.name.length <= 32 &&
      isTankKind(m.tank)
    )
      return { type: "join", name: m.name.trim() || "NONAME", tank: m.tank };
    if (m.type === "input") {
      const i = m.input;
      if (
        i &&
        [-1, 0, 1].includes(i.move) &&
        [-1, 0, 1].includes(i.rotate) &&
        typeof i.angle === "number" &&
        Number.isFinite(i.angle) &&
        Math.abs(i.angle) <= Math.PI &&
        typeof i.fire === "boolean"
      )
        return {
          type: "input",
          input: {
            move: i.move,
            rotate: i.rotate,
            angle: i.angle,
            fire: i.fire,
          },
        };
    }
  } catch {
    /* malformed JSON */
  }
  return null;
}
export type WorkerCommand =
  | { type: "connect"; url: string; name: string; tank: TankKind }
  | { type: "control"; input: ControlInput }
  | { type: "stop" };
export type WorkerEvent =
  | ServerMessage
  | { type: "status"; connected: boolean; message: string };
