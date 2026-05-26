export const TILE_SIZE = 16;
export const GRID_SIZE = 13;
export const PLAYFIELD_SIZE = TILE_SIZE * GRID_SIZE; // 208
export const SIDEBAR_WIDTH = 64;
export const PLAYFIELD_OFFSET_X = 8;
export const PLAYFIELD_OFFSET_Y = 8;
export const GAME_WIDTH = PLAYFIELD_OFFSET_X * 2 + PLAYFIELD_SIZE + SIDEBAR_WIDTH; // 8+208+64+8=288
export const GAME_HEIGHT = PLAYFIELD_OFFSET_Y * 2 + PLAYFIELD_SIZE; // 224

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

/** Arcade UI typography — matches Press Start 2P loaded in index.html */
export const UI_FONT = '"Press Start 2P", monospace';

export function colorHex(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}

export const COLORS = {
  background: 0x0a0a0a,
  playfield: 0x000000,
  sidebar: 0x8a8a8a,
  sidebarShadow: 0x5a5a5a,

  brick: 0xb05028,
  brickLight: 0xd66838,
  brickMortar: 0x4a1f10,

  steel: 0xc8c8c8,
  steelLight: 0xeaeaea,
  steelDark: 0x6c6c6c,

  water1: 0x2a5fb8,
  water2: 0x4080d0,
  forest: 0x2a8030,
  forestLight: 0x55b048,
  ice: 0xe8eef4,

  player1Body: 0xeeb850,
  player1Light: 0xfbe28a,
  player1Dark: 0x8c5a08,

  player2Body: 0x4cba4c,
  player2Light: 0xa8e07a,
  player2Dark: 0x186018,

  enemyBasic: 0xe8e8e8,
  enemyBasicDark: 0x808080,
  enemyFast: 0xb0d8e0,
  enemyFastDark: 0x508088,
  enemyPower: 0xe89030,
  enemyPowerDark: 0x804010,
  enemyArmor: 0x60b060,
  enemyArmorDark: 0x205020,

  bullet: 0xffffff,
  bulletShadow: 0xa8a8a8,

  baseGray: 0xa8a8a8,
  baseEagle: 0xe8e0a8,
  baseEagleDark: 0x806000,

  hudText: 0xffffff,
  hudFlag: 0xe85020,
  hudStar: 0xffd040,
  uiAccent: 0xeeb850,
  uiMuted: 0x888888,
  pauseOverlay: 0x000000,
  pauseDim: 0.75,

  titleBrick: 0xc24a26,
  titleBrickLight: 0xe07050,
} as const;

export const PLAYER_SPEED = 64;
export const ENEMY_SPEED = { basic: 36, fast: 76, power: 50, armor: 50 } as const;
export const BULLET_SPEED = { slow: 130, normal: 170, fast: 240 } as const;

export type Direction = 'up' | 'down' | 'left' | 'right';

export const DIR_VECTORS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
