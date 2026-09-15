import { expect, test } from "bun:test";
import { NearestTargetStrategy } from "../bots/src/strategy";
import { GameWorld } from "../server/src/world";
import { GameConnection, type SocketLike } from "@pixeltank/shared";
test("bot handles absent self and absent targets", () => {
  const w = new GameWorld(),
    s = new NearestTargetStrategy();
  expect(s.decide(w.snapshot(), "a").fire).toBe(false);
  w.join("a", "A", "light");
  expect(s.decide(w.snapshot(), "a").move).toBe(0);
});
test("bot chooses closest target, aims, fires, and stops at 300px", () => {
  const w = new GameWorld(() => 0.5);
  w.join("a", "A", "light");
  w.join("b", "B", "light");
  w.join("c", "C", "light");
  const snapshot = w.snapshot();
  snapshot.tanks[0].turretAngle = 0;
  snapshot.tanks[0].chassisAngle = 0;
  snapshot.tanks[1].x = 200;
  snapshot.tanks[2].x = -1000;
  const input = new NearestTargetStrategy().decide(snapshot, "a");
  expect(input.angle).toBe(0);
  expect(input.fire).toBe(true);
  expect(input.move).toBe(0);
});
test("reconnect backoff is bounded, repeats join and cancels retries on stop", () => {
  const sockets: SocketLike[] = [],
    delays: number[] = [],
    callbacks: (() => void)[] = [],
    sent: string[] = [];
  let cleared = false;
  const c = new GameConnection(
    () => {
      const s: SocketLike = {
        readyState: 1,
        onopen: null,
        onmessage: null,
        onclose: null,
        onerror: null,
        send: (data) => sent.push(data),
        close() {},
      };
      sockets.push(s);
      return s;
    },
    {
      set: (fn, ms) => {
        callbacks.push(fn);
        delays.push(ms);
        return ms;
      },
      clear: () => {
        cleared = true;
      },
    },
    { name: "Bot", tank: "heavy" },
    () => {},
    () => {},
  );
  c.start();
  sockets[0].onopen!();
  for (let i = 0; i < 8; i++) {
    sockets.at(-1)!.onclose!();
    callbacks.at(-1)!();
    sockets.at(-1)!.onopen!();
  }
  expect(delays).toEqual([250, 500, 1000, 2000, 4000, 5000, 5000, 5000]);
  expect(sent).toHaveLength(9);
  expect(JSON.parse(sent[8]).tank).toBe("heavy");
  c.stop();
  expect(cleared).toBe(true);
});
