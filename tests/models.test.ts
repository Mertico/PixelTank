import { describe, expect, test } from "bun:test";
import {
  Tank,
  TANKS,
  turnToward,
  hitsTank,
  neutralInput,
  parseClientMessage,
  type TankKind,
} from "@pixeltank/shared";
function tank(kind: TankKind = "light") {
  return new Tank({
    id: "t",
    playerId: "p",
    kind,
    x: 0,
    y: 0,
    speed: 0,
    chassisAngle: 0,
    turretAngle: 0,
    hp: TANKS[kind].hp,
  });
}
describe("shared models", () => {
  for (const kind of ["light", "medium", "heavy"] as const)
    test(`${kind}: speed limits and braking`, () => {
      const t = tank(kind);
      for (let i = 0; i < 1200; i++)
        t.updateControl({ ...neutralInput(), move: 1 }, 1 / 60);
      expect(t.state.speed).toBe(TANKS[kind].maxSpeed);
      for (let i = 0; i < 1200; i++) t.updateControl(neutralInput(), 1 / 60);
      expect(t.state.speed).toBe(0);
      for (let i = 0; i < 1200; i++)
        t.updateControl({ ...neutralInput(), move: -1 }, 1 / 60);
      expect(t.state.speed).toBeCloseTo(-TANKS[kind].maxSpeed * 0.3);
    });
  test("turret follows shortest path across pi", () => {
    expect(turnToward(Math.PI - 0.05, -Math.PI + 0.05, 0.2)).toBeCloseTo(
      -Math.PI + 0.05,
    );
  });
  test("rotated tank collision uses both coordinates", () => {
    const t = tank().state;
    t.chassisAngle = Math.PI / 4;
    expect(hitsTank(t, 50, 0)).toBe(true);
    expect(hitsTank(t, 39, 39)).toBe(false);
  });
  test("DTO copies cannot mutate entity", () => {
    const t = tank();
    t.toDTO().hp = 0;
    expect(t.state.hp).toBe(180);
  });
  test("protocol validates malformed and hostile payloads", () => {
    for (const raw of [
      "{",
      "null",
      "[]",
      JSON.stringify({ type: "join", name: "a", tank: "invalid" }),
      JSON.stringify({
        type: "input",
        input: { move: 2, rotate: 0, angle: 0, fire: false },
      }),
      '{"type":"input","input":{"move":0,"rotate":0,"angle":1e999,"fire":false}}',
    ])
      expect(parseClientMessage(raw)).toBeNull();
    expect(
      parseClientMessage('{"type":"join","name":"  ","tank":"heavy"}'),
    ).toEqual({ type: "join", name: "NONAME", tank: "heavy" });
  });
});
