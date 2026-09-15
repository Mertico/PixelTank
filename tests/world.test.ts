import { expect, test } from "bun:test";
import { Bullet, neutralInput, TANKS } from "@pixeltank/shared";
import { GameWorld } from "../server/src/world";
function bullet(id: string, x: number, y: number, damage: number, life = 1) {
  return new Bullet({
    id,
    ownerId: "killer",
    x: x - 15,
    y,
    angle: 0,
    damage,
    life,
  });
}
test("exact zero hp kills once, preserves kind and statistics, creates a new body", () => {
  const w = new GameWorld(() => 0.5);
  w.join("killer", "K", "light");
  w.join("victim", "V", "heavy");
  const victim = w.tanks.get("victim")!,
    previousId = victim.state.id;
  w.bullets.set(
    "a",
    bullet("a", victim.state.x, victim.state.y, TANKS.heavy.hp),
  );
  w.bullets.set(
    "b",
    bullet("b", victim.state.x, victim.state.y, TANKS.heavy.hp),
  );
  w.step();
  expect(w.players.get("victim")!.stats.deaths).toBe(1);
  expect(w.players.get("killer")!.stats.kills).toBe(1);
  expect(w.tanks.get("victim")!.state.kind).toBe("heavy");
  expect(w.tanks.get("victim")!.state.hp).toBe(TANKS.heavy.hp);
  expect(w.tanks.get("victim")!.state.id).not.toBe(previousId);
  expect(w.physics.bodies.has(previousId)).toBe(false);
  expect(w.drainDeaths()).toHaveLength(1);
  expect(w.drainDeaths()).toHaveLength(0);
});
test("removes every expired bullet without skipping and cleans player resources", () => {
  const w = new GameWorld();
  w.join("killer", "K", "light");
  for (let i = 0; i < 5; i++)
    w.bullets.set(String(i), bullet(String(i), 0, 0, 1, 0.001));
  w.step();
  expect(w.bullets.size).toBe(0);
  w.leave("killer");
  expect(w.tanks.size).toBe(0);
  expect(w.physics.bodies.size).toBe(0);
  expect(w.inputs.size).toBe(0);
});
test("join is idempotent and snapshots are isolated", () => {
  const w = new GameWorld();
  w.join("a", "A", "light");
  w.join("a", "B", "heavy");
  expect(w.players.size).toBe(1);
  const snapshot = w.snapshot();
  snapshot.players[0].stats.kills = 100;
  expect(w.players.get("a")!.stats.kills).toBe(0);
});
test("p2 moves tanks, stops at border, and cooldown limits firing", () => {
  const w = new GameWorld(() => 0.5);
  w.join("a", "A", "light");
  w.input("a", { ...neutralInput(), move: 1, fire: true, angle: -Math.PI / 2 });
  for (let i = 0; i < 21; i++) w.step();
  expect(w.bullets.size).toBe(1);
  w.step();
  expect(w.bullets.size).toBe(2);
  expect(w.tanks.get("a")!.state.y).toBeLessThan(0);
  for (let i = 0; i < 1800; i++) w.step();
  expect(w.tanks.get("a")!.state.y).toBeGreaterThan(-2561);
});
