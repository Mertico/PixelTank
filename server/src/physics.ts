import p2 from "p2";
import { WORLD, type TankDTO } from "@pixeltank/shared";
export class PhysicsWorld {
  private world = new p2.World({ gravity: [0, 0] });
  readonly bodies = new Map<string, p2.Body>();
  constructor() {
    for (const [x, y, angle] of [
      [0, WORLD.maxY, Math.PI],
      [WORLD.minX, 0, -Math.PI / 2],
      [WORLD.maxX, 0, Math.PI / 2],
      [0, WORLD.minY, 0],
    ]) {
      const b = new p2.Body({ position: [x, y], angle });
      b.addShape(new p2.Plane());
      this.world.addBody(b);
    }
  }
  add(t: TankDTO): void {
    const mass = { light: 15.5, medium: 36, heavy: 188.9 }[t.kind];
    const b = new p2.Body({
      mass,
      position: [t.x, t.y],
      angle: t.chassisAngle,
      damping: 0.1,
      angularDamping: 0.95,
    });
    if (t.kind === "heavy") b.addShape(new p2.Box({ width: 54, height: 57.6 }));
    else
      b.fromPolygon(
        t.kind === "light"
          ? [
              [22, 26],
              [22, 19.6],
              [34, 19.6],
              [34, -19.6],
              [22, -19.6],
              [22, -26],
              [-30, -26],
              [-30, -19.6],
              [-34, -19.6],
              [-34, 19.6],
              [-30, 19.6],
              [-30, 26],
            ]
          : [
              [32.5, 32.5],
              [32.5, 20],
              [25, 20],
              [25, -20],
              [32.5, -20],
              [32.5, -32.5],
              [-32.5, -32.5],
              [-32.5, -20],
              [-25, -20],
              [-25, 20],
              [-32.5, 20],
              [-32.5, 32.5],
            ],
      );
    this.bodies.set(t.id, b);
    this.world.addBody(b);
  }
  remove(id: string): void {
    const b = this.bodies.get(id);
    if (b) this.world.removeBody(b);
    this.bodies.delete(id);
  }
  control(t: TankDTO, rotation: number): void {
    const b = this.bodies.get(t.id)!;
    b.velocity[0] = t.speed * Math.cos(b.angle);
    b.velocity[1] = t.speed * Math.sin(b.angle);
    b.angularVelocity = rotation;
  }
  step(dt: number): void {
    this.world.step(dt);
  }
  sync(t: TankDTO): void {
    const b = this.bodies.get(t.id)!;
    t.x = b.position[0];
    t.y = b.position[1];
    t.chassisAngle = b.angle;
    t.speed =
      b.velocity[0] * Math.cos(b.angle) + b.velocity[1] * Math.sin(b.angle);
  }
}
