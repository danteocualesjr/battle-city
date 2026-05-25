export const TILE_SIZE = 16;
export const GRID_SIZE = 13;
export const PLAYFIELD_SIZE = TILE_SIZE * GRID_SIZE;
export const SIDEBAR_WIDTH = 48;
export const GAME_WIDTH = PLAYFIELD_SIZE + SIDEBAR_WIDTH;
export const GAME_HEIGHT = 240;
export const SCALE = 2;

export const ENEMIES_PER_STAGE = 20;
export const MAX_ACTIVE_ENEMIES = 4;
export const STARTING_LIVES = 3;
export const EXTRA_LIFE_SCORE = 20_000;
export const POWERUP_SCORE = 500;
export const FLASHING_SPAWN_INDICES = [4, 11, 18] as const;

export const SPAWN_POINTS = [
  { col: 0, row: 0 },
  { col: 6, row: 0 },
  { col: 12, row: 0 },
] as const;

export const POWERUP_POSITIONS = [
  { col: 0, row: 0 }, { col: 6, row: 0 }, { col: 12, row: 0 },
  { col: 0, row: 6 }, { col: 6, row: 6 }, { col: 12, row: 6 },
  { col: 0, row: 12 }, { col: 6, row: 12 }, { col: 12, row: 12 },
  { col: 3, row: 3 }, { col: 9, row: 3 }, { col: 3, row: 9 }, { col: 9, row: 9 },
  { col: 3, row: 6 }, { col: 9, row: 6 }, { col: 6, row: 3 },
] as const;

export const COLORS = {
  black: 0x000000,
  sidebar: 0x6b6b6b,
  sidebarDark: 0x4a4a4a,
  brick: 0xc05830,
  brickDark: 0x903820,
  steel: 0xd0d0d0,
  steelDark: 0x909090,
  water: 0x2060c0,
  forest: 0x208020,
  ice: 0xe0e8f0,
  player1: 0xf0a020,
  player2: 0x40c040,
  enemyBasic: 0xe0e0e0,
  enemyFast: 0xc0c0c0,
  enemyPower: 0xa0a0a0,
  enemyArmor: 0x60a060,
  bullet: 0xffffff,
  base: 0x808080,
  hudText: 0xffffff,
  titleBrick: 0xc04030,
} as const;

export const PLAYER_SPEED = 60;
export const ENEMY_SPEED = { basic: 40, fast: 80, power: 55, armor: 55 } as const;
export const BULLET_SPEED = { slow: 120, normal: 160, fast: 220 } as const;

export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIR_VECTORS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
