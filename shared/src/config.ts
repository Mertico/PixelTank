import type { TankConfig, TankKind } from "./types";
export const PROTOCOL_VERSION = 1;
export const WORLD = {
  minX: -2560,
  minY: -2560,
  maxX: 2530,
  maxY: 2530,
  spawnMin: -2000,
  spawnMax: 2000,
  tickRate: 60,
  sendRate: 21,
  statsInterval: 750,
  bulletSpeed: 900,
  bulletLife: 1.5,
} as const;
export const TANKS: Record<TankKind, TankConfig> = {
  light: {
    hp: 180,
    maxSpeed: 400,
    acceleration: 185,
    reload: 0.35,
    damage: 55,
    chassisSpeed: 96,
    turretSpeed: 180,
  },
  medium: {
    hp: 275,
    maxSpeed: 310,
    acceleration: 160,
    reload: 0.68,
    damage: 85,
    chassisSpeed: 68,
    turretSpeed: 150,
  },
  heavy: {
    hp: 640,
    maxSpeed: 235,
    acceleration: 110,
    reload: 1.12,
    damage: 125,
    chassisSpeed: 48,
    turretSpeed: 120,
  },
};
