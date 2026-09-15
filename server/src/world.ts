import {
  Bullet,
  Tank,
  TANKS,
  WORLD,
  hitsTank,
  neutralInput,
  type ControlInput,
  type DeathEvent,
  type Player,
  type TankKind,
  type WorldSnapshot,
} from "@pixeltank/shared";
import { PhysicsWorld } from "./physics";
export class GameWorld {
  readonly players = new Map<string, Player>();
  readonly tanks = new Map<string, Tank>();
  readonly bullets = new Map<string, Bullet>();
  readonly inputs = new Map<string, ControlInput>();
  readonly physics = new PhysicsWorld();
  tick = 0;
  private sequence = 0;
  private deaths: DeathEvent[] = [];
  constructor(private random: () => number = Math.random) {}
  join(id: string, name: string, kind: TankKind): void {
    if (this.players.has(id)) return;
    const p: Player = {
      id,
      name,
      tankKind: kind,
      stats: { kills: 0, deaths: 0 },
    };
    this.players.set(id, p);
    this.inputs.set(id, neutralInput());
    this.spawn(p);
  }
  private spawn(p: Player): void {
    const coordinate = () =>
      WORLD.spawnMin + this.random() * (WORLD.spawnMax - WORLD.spawnMin);
    const t = new Tank({
      id: `tank-${++this.sequence}`,
      playerId: p.id,
      kind: p.tankKind,
      x: coordinate(),
      y: coordinate(),
      speed: 0,
      chassisAngle: -Math.PI / 2,
      turretAngle: -Math.PI / 2,
      hp: TANKS[p.tankKind].hp,
    });
    this.tanks.set(p.id, t);
    this.physics.add(t.state);
  }
  leave(id: string): void {
    const t = this.tanks.get(id);
    if (t) this.physics.remove(t.state.id);
    this.tanks.delete(id);
    this.players.delete(id);
    this.inputs.delete(id);
    for (const [key, bullet] of this.bullets)
      if (bullet.state.ownerId === id) this.bullets.delete(key);
  }
  input(id: string, input: ControlInput): void {
    if (this.players.has(id)) this.inputs.set(id, { ...input });
  }
  step(dt = 1 / WORLD.tickRate): void {
    this.tick++;
    const killed = new Set<string>();
    for (const [id, b] of this.bullets) {
      b.move(dt);
      if (b.state.life <= 0) {
        this.bullets.delete(id);
        continue;
      }
      for (const [playerId, t] of this.tanks) {
        if (
          playerId === b.state.ownerId ||
          killed.has(playerId) ||
          !hitsTank(t.state, b.state.x, b.state.y)
        )
          continue;
        t.state.hp -= b.state.damage;
        this.bullets.delete(id);
        if (t.state.hp <= 0) {
          const victim = this.players.get(playerId)!,
            killer = this.players.get(b.state.ownerId);
          victim.stats.deaths++;
          if (killer) killer.stats.kills++;
          this.deaths.push({
            killerId: b.state.ownerId,
            victimId: playerId,
            killerName: killer?.name ?? "NONAME",
            victimName: victim.name,
          });
          killed.add(playerId);
        }
        break;
      }
    }
    for (const id of killed) {
      this.physics.remove(this.tanks.get(id)!.state.id);
      this.tanks.delete(id);
      this.inputs.set(id, neutralInput());
      this.spawn(this.players.get(id)!);
    }
    for (const [id, t] of this.tanks)
      this.physics.control(t.state, t.updateControl(this.inputs.get(id)!, dt));
    this.physics.step(dt);
    for (const [id, t] of this.tanks) {
      this.physics.sync(t.state);
      if (this.inputs.get(id)!.fire && t.cooldown <= 1e-9) {
        const s = t.state,
          c = TANKS[s.kind];
        t.cooldown = c.reload;
        const bulletId = `bullet-${++this.sequence}`;
        this.bullets.set(
          bulletId,
          new Bullet({
            id: bulletId,
            ownerId: id,
            x: s.x + 36 * Math.cos(s.turretAngle),
            y: s.y + 36 * Math.sin(s.turretAngle),
            angle: s.turretAngle,
            damage: c.damage,
            life: WORLD.bulletLife,
          }),
        );
      }
    }
  }
  drainDeaths(): DeathEvent[] {
    const result = this.deaths;
    this.deaths = [];
    return result;
  }
  playerList(): Player[] {
    return [...this.players.values()].map((p) => ({
      ...p,
      stats: { ...p.stats },
    }));
  }
  snapshot(): WorldSnapshot {
    return {
      tick: this.tick,
      players: this.playerList(),
      tanks: [...this.tanks.values()].map((t) => t.toDTO()),
      bullets: [...this.bullets.values()].map((b) => b.toDTO()),
    };
  }
}
