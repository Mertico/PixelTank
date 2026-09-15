import {
  normalizeAngle,
  neutralInput,
  WORLD,
  type ControlInput,
  type WorldSnapshot,
} from "@pixeltank/shared";
export interface BotStrategy {
  decide(snapshot: WorldSnapshot, playerId: string): ControlInput;
}
export class NearestTargetStrategy implements BotStrategy {
  decide(snapshot: WorldSnapshot, playerId: string): ControlInput {
    const own = snapshot.tanks.find((t) => t.playerId === playerId);
    if (!own) return neutralInput();
    const target = snapshot.tanks
      .filter((t) => t.playerId !== playerId)
      .sort(
        (a, b) =>
          Math.hypot(a.x - own.x, a.y - own.y) -
          Math.hypot(b.x - own.x, b.y - own.y),
      )[0];
    if (!target)
      return { ...neutralInput(), angle: normalizeAngle(own.turretAngle) };
    const distance = Math.hypot(target.x - own.x, target.y - own.y);
    const direction = Math.atan2(target.y - own.y, target.x - own.x);
    const aim = normalizeAngle(
      direction +
        (target.speed * Math.sin(target.chassisAngle - own.turretAngle)) /
          WORLD.bulletSpeed,
    );
    const difference = normalizeAngle(direction - own.chassisAngle);
    return {
      move: distance >= 300 ? 1 : 0,
      rotate:
        Math.abs(difference) <= Math.PI / 18 ? 0 : difference > 0 ? 1 : -1,
      angle: distance < 2000 ? aim : normalizeAngle(own.turretAngle),
      fire:
        distance < 1500 &&
        Math.abs(normalizeAngle(own.turretAngle - aim)) < 0.1,
    };
  }
}
