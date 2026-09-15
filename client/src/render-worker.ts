import {
  Bullet,
  Tank,
  neutralInput,
  type Player,
  type WorkerEvent,
} from "@pixeltank/shared";
import { Renderer, type LogEntry } from "./renderer";
import type { RenderCommand, RenderEvent } from "./render-protocol";
let renderer: Renderer | undefined;
let tanks: Tank[] = [],
  bullets: Bullet[] = [],
  players: Player[] = [],
  log: LogEntry[] = [];
let playerId = "",
  ready = false,
  lastTick = -1,
  receivedAt = 0,
  last = 0,
  frame = 0;
let input = neutralInput(),
  scale = 1,
  showStats = false;
const emit = (event: RenderEvent) => postMessage(event);
function network(m: WorkerEvent): void {
  if (m.type === "status" && !m.connected) {
    ready = false;
    input = neutralInput();
  } else if (m.type === "welcome") {
    playerId = m.playerId;
    ready = false;
    lastTick = -1;
    tanks = [];
    bullets = [];
    players = [];
    log = [];
  } else if (m.type === "snapshot") {
    if (m.snapshot.tick < lastTick) return;
    lastTick = m.snapshot.tick;
    receivedAt = performance.now();
    tanks = m.snapshot.tanks.map(Tank.fromDTO);
    bullets = m.snapshot.bullets.map(Bullet.fromDTO);
    players = m.snapshot.players;
    ready = !!playerId;
  } else if (m.type === "stats") players = m.players;
  else if (m.type === "death")
    log = [{ ...m.event, expires: performance.now() + 3000 }, ...log].slice(
      0,
      5,
    );
}
function draw(now: number): void {
  try {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (ready && renderer) {
      if (now - receivedAt < 250) {
        for (const tank of tanks)
          tank.predict(
            tank.state.playerId === playerId ? input : undefined,
            dt,
          );
        for (const bullet of bullets) bullet.move(dt);
      }
      log = log.filter((event) => event.expires > now);
      renderer.draw(
        tanks,
        bullets.filter((b) => b.state.life > 0),
        players,
        playerId,
        scale,
        showStats,
        log,
      );
    }
    frame = requestAnimationFrame(draw);
  } catch (error) {
    emit({ type: "error", message: String(error) });
  }
}
self.onmessage = (event: MessageEvent<RenderCommand>) => {
  try {
    const m = event.data;
    if (m.type === "init") {
      cancelAnimationFrame(frame);
      renderer?.dispose();
      renderer = new Renderer(m.canvas, m.assets, m.viewport);
      last = performance.now();
      frame = requestAnimationFrame(draw);
      emit({ type: "ready" });
    } else if (m.type === "resize") {
      renderer?.resize(m.viewport);
      if (m.assets) renderer?.replaceAssets(m.assets);
    } else if (m.type === "network") network(m.event);
    else if (m.type === "controls") {
      input = m.input;
      scale = m.scale;
      showStats = m.showStats;
    } else {
      cancelAnimationFrame(frame);
      renderer?.dispose();
      self.close();
    }
  } catch (error) {
    emit({ type: "error", message: String(error) });
  }
};
