import type { Direction } from '../config/constants';

export type EnemyKind = 'basic' | 'fast' | 'power' | 'armor';

export type PowerUpKind = 'grenade' | 'helmet' | 'shovel' | 'star' | 'tank' | 'timer';

export interface TankState {
  x: number;
  y: number;
  direction: Direction;
  alive: boolean;
  invincible: boolean;
  frozen: boolean;
}

export interface BulletState {
  x: number;
  y: number;
  direction: Direction;
  owner: 'player' | 'enemy';
  active: boolean;
  power: number;
  speed: number;
}

export interface EnemyState extends TankState {
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  flashing: boolean;
  shootCooldown: number;
  moveCooldown: number;
  aiTimer: number;
}
