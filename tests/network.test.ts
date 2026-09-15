import { afterEach, expect, test } from "bun:test";
import { Bullet, TANKS, type ServerMessage } from "@pixeltank/shared";
import { GameServer } from "../server/src/server";
import { BotRunner } from "../bots/src/bot";
const servers: GameServer[] = [],
  sockets: WebSocket[] = [];
afterEach(() => {
  sockets.splice(0).forEach((s) => s.close());
  servers.splice(0).forEach((s) => s.stop());
});
function start() {
  const server = new GameServer({ port: 0 });
  server.start();
  servers.push(server);
  return server;
}
async function connect(server: GameServer) {
  const socket = new WebSocket(`ws://127.0.0.1:${server.port}/ws`);
  sockets.push(socket);
  const messages: ServerMessage[] = [];
  socket.onmessage = (e) => messages.push(JSON.parse(String(e.data)));
  await new Promise<void>((resolve, reject) => {
    socket.onopen = () => resolve();
    socket.onerror = () => reject(new Error("connection failed"));
  });
  return {
    socket,
    messages,
    send: (value: unknown) => socket.send(JSON.stringify(value)),
  };
}
async function until(predicate: () => boolean) {
  const deadline = Date.now() + 3000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error("Timed out");
    await Bun.sleep(10);
  }
}
test("real WebSockets: join, input, invalid messages, snapshots, death, respawn, disconnect and new session", async () => {
  const server = start(),
    a = await connect(server),
    b = await connect(server);
  a.send({
    type: "input",
    input: { move: 0, rotate: 0, angle: 0, fire: false },
  });
  await until(() => a.messages.some((m) => m.type === "error"));
  a.send({ type: "join", name: "Alice", tank: "light" });
  b.send({ type: "join", name: "Bob", tank: "heavy" });
  await until(() => server.world.players.size === 2);
  await until(
    () =>
      a.messages.some((m) => m.type === "welcome") &&
      b.messages.some((m) => m.type === "welcome"),
  );
  const aid = a.messages.find((m) => m.type === "welcome")!.playerId,
    bid = b.messages.find((m) => m.type === "welcome")!.playerId;
  a.send({ type: "join", name: "Duplicate", tank: "heavy" });
  a.send({
    type: "input",
    input: { move: 1, rotate: 0, angle: 0, fire: false },
  });
  await until(() => server.world.inputs.get(aid)?.move === 1);
  a.socket.send("{");
  await until(() => a.messages.filter((m) => m.type === "error").length >= 3);
  expect(server.world.players.size).toBe(2);
  const t = server.world.tanks.get(bid)!.state;
  server.world.bullets.set(
    "test",
    new Bullet({
      id: "test",
      ownerId: aid,
      x: t.x - 15,
      y: t.y,
      angle: 0,
      damage: TANKS.heavy.hp,
      life: 1,
    }),
  );
  await until(() => b.messages.some((m) => m.type === "death"));
  expect(server.world.players.get(bid)!.stats.deaths).toBe(1);
  expect(server.world.tanks.get(bid)!.state.hp).toBe(TANKS.heavy.hp);
  await until(() =>
    a.messages.some(
      (m) =>
        m.type === "stats" &&
        m.players.some((p) => p.id === aid && p.stats.kills === 1),
    ),
  );
  expect(
    a.messages.some((m) => m.type === "snapshot" && m.snapshot.tick > 0),
  ).toBe(true);
  b.socket.close();
  await until(() => !server.world.players.has(bid));
  expect(server.world.physics.bodies.size).toBe(1);
  const c = await connect(server);
  c.send({ type: "join", name: "Bob", tank: "heavy" });
  await until(() => c.messages.some((m) => m.type === "welcome"));
  const cid = c.messages.find((m) => m.type === "welcome")!.playerId;
  expect(cid).not.toBe(bid);
  expect(server.world.players.get(cid)!.stats).toEqual({ kills: 0, deaths: 0 });
}, 10000);
test("two autonomous bots join and zero-bot mode creates no connections", async () => {
  const server = start();
  const empty = new BotRunner(`ws://127.0.0.1:${server.port}/ws`, 0);
  empty.start();
  expect(server.world.players.size).toBe(0);
  empty.stop();
  const bots = new BotRunner(`ws://127.0.0.1:${server.port}/ws`, 2);
  try {
    bots.start();
    await until(() => server.world.players.size === 2);
    await until(() =>
      [...server.world.inputs.values()].some(
        (i) => i.move !== 0 || i.rotate !== 0,
      ),
    );
  } finally {
    bots.stop();
  }
  await until(() => server.world.players.size === 0);
});

test("bots rejoin with fresh sessions after a real server restart", async () => {
  const original = start();
  const port = original.port;
  const bots = new BotRunner(`ws://127.0.0.1:${port}/ws`, 2);
  try {
    bots.start();
    await until(() => original.world.players.size === 2);
    const oldIds = new Set(original.world.players.keys());
    original.stop();
    const replacement = new GameServer({ port });
    replacement.start();
    servers.push(replacement);
    await until(() => replacement.world.players.size === 2);
    expect(
      [...replacement.world.players.keys()].every((id) => !oldIds.has(id)),
    ).toBe(true);
  } finally {
    bots.stop();
  }
});
