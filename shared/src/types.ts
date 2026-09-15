export type TankKind = "light" | "medium" | "heavy";
export interface TankConfig {
  hp: number;
  maxSpeed: number;
  acceleration: number;
  reload: number;
  damage: number;
  chassisSpeed: number;
  turretSpeed: number;
}
export interface ControlInput {
  move: -1 | 0 | 1;
  rotate: -1 | 0 | 1;
  angle: number;
  fire: boolean;
}
export const neutralInput = (): ControlInput => ({
  move: 0,
  rotate: 0,
  angle: 0,
  fire: false,
});
export interface PlayerStats {
  kills: number;
  deaths: number;
}
export interface Player {
  id: string;
  name: string;
  tankKind: TankKind;
  stats: PlayerStats;
}
export interface TankDTO {
  id: string;
  playerId: string;
  kind: TankKind;
  x: number;
  y: number;
  speed: number;
  chassisAngle: number;
  turretAngle: number;
  hp: number;
}
export interface BulletDTO {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  angle: number;
  damage: number;
  life: number;
}
export interface WorldSnapshot {
  tick: number;
  players: Player[];
  tanks: TankDTO[];
  bullets: BulletDTO[];
}
export interface DeathEvent {
  killerId: string;
  victimId: string;
  killerName: string;
  victimName: string;
}
