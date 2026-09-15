import { TANKS, WORLD } from "./config";
import type { BulletDTO, ControlInput, TankDTO } from "./types";
export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
export const normalizeAngle = (a: number) =>
  Math.atan2(Math.sin(a), Math.cos(a));
export function turnToward(
  current: number,
  target: number,
  step: number,
): number {
  return normalizeAngle(
    current + clamp(normalizeAngle(target - current), -step, step),
  );
}
export function accelerationFactor(speed: number, maxSpeed: number): number {
  const n = (Math.abs(speed) / maxSpeed) * 10;
  return (1 + n ** 0.1) / (1 + n ** 0.3);
}
export class Tank {
  state: TankDTO;
  cooldown = 0;
  constructor(dto: TankDTO) {
    this.state = { ...dto };
  }
  static fromDTO(dto: TankDTO): Tank {
    return new Tank(dto);
  }
  toDTO(): TankDTO {
    return { ...this.state };
  }
  updateControl(input: ControlInput, dt: number): number {
    const s = this.state,
      c = TANKS[s.kind];
    s.turretAngle = turnToward(
      s.turretAngle,
      input.angle,
      (dt * c.turretSpeed * Math.PI) / 180,
    );
    const a = c.acceleration * accelerationFactor(s.speed, c.maxSpeed) * dt;
    s.speed = input.move
      ? clamp(
          s.speed + input.move * a * (input.move < 0 ? 0.6 : 1),
          -c.maxSpeed * 0.3,
          c.maxSpeed,
        )
      : Math.sign(s.speed) * Math.max(0, Math.abs(s.speed) - a * 3);
    this.cooldown = Math.max(0, this.cooldown - dt);
    return (
      ((input.rotate * c.chassisSpeed * Math.PI) / 180) *
      accelerationFactor(s.speed, c.maxSpeed)
    );
  }
  predict(input: ControlInput | undefined, dt: number): void {
    const s = this.state;
    if (input)
      s.chassisAngle = normalizeAngle(
        s.chassisAngle + this.updateControl(input, dt) * dt,
      );
    s.x = clamp(
      s.x + s.speed * Math.cos(s.chassisAngle) * dt,
      WORLD.minX + 40,
      WORLD.maxX - 40,
    );
    s.y = clamp(
      s.y + s.speed * Math.sin(s.chassisAngle) * dt,
      WORLD.minY + 40,
      WORLD.maxY - 40,
    );
  }
}
export class Bullet {
  state: BulletDTO;
  constructor(dto: BulletDTO) {
    this.state = { ...dto };
  }
  static fromDTO(dto: BulletDTO): Bullet {
    return new Bullet(dto);
  }
  toDTO(): BulletDTO {
    return { ...this.state };
  }
  move(dt: number): void {
    this.state.x += WORLD.bulletSpeed * Math.cos(this.state.angle) * dt;
    this.state.y += WORLD.bulletSpeed * Math.sin(this.state.angle) * dt;
    this.state.life -= dt;
  }
}
// Transform the projectile into the tank's local coordinates before testing its 80px hit box.
export function hitsTank(tank: TankDTO, x: number, y: number): boolean {
  const dx = x - tank.x,
    dy = y - tank.y,
    c = Math.cos(tank.chassisAngle),
    s = Math.sin(tank.chassisAngle);
  return Math.abs(dx * c + dy * s) <= 40 && Math.abs(-dx * s + dy * c) <= 40;
}
