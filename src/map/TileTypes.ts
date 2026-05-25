export enum TileType {
  Empty = 0,
  Brick = 1,
  Steel = 2,
  Forest = 3,
  Water = 4,
  Ice = 5,
  Base = 6,
}

export const TILE_CHARS: Record<string, TileType> = {
  '.': TileType.Empty,
  B: TileType.Brick,
  S: TileType.Steel,
  F: TileType.Forest,
  W: TileType.Water,
  I: TileType.Ice,
  H: TileType.Base,
};

export interface BrickQuadrants {
  tl: boolean;
  tr: boolean;
  bl: boolean;
  br: boolean;
}

export function fullBrick(): BrickQuadrants {
  return { tl: true, tr: true, bl: true, br: true };
}

export function emptyBrick(): BrickQuadrants {
  return { tl: false, tr: false, bl: false, br: false };
}
