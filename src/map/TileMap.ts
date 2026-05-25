import Phaser from 'phaser';
import { COLORS, GRID_SIZE, TILE_SIZE } from '../config/constants';
import {
  type BrickQuadrants,
  emptyBrick,
  fullBrick,
  TileType,
  TILE_CHARS,
} from './TileTypes';

interface CellState {
  type: TileType;
  brick: BrickQuadrants;
  steelHits: number;
  fortified: boolean;
}

export class TileMap {
  private cells: CellState[][] = [];
  private graphics: Phaser.GameObjects.Graphics;
  private forestGraphics: Phaser.GameObjects.Graphics;
  baseDestroyed = false;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(1);
    this.forestGraphics = scene.add.graphics().setDepth(5);
  }

  loadFromStrings(rows: string[]): void {
    this.cells = rows.map((row) =>
      row.split('').map((ch) => {
        const type = TILE_CHARS[ch] ?? TileType.Empty;
        return {
          type,
          brick: type === TileType.Brick ? fullBrick() : emptyBrick(),
          steelHits: 0,
          fortified: false,
        };
      }),
    );
    this.baseDestroyed = false;
    this.redraw();
  }

  redraw(): void {
    this.graphics.clear();
    this.forestGraphics.clear();

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = this.cells[row][col];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        switch (cell.type) {
          case TileType.Brick:
            this.drawBrickCell(x, y, cell.brick);
            break;
          case TileType.Steel:
            this.drawSteel(x, y);
            break;
          case TileType.Water:
            this.graphics.fillStyle(COLORS.water, 1);
            this.graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            break;
          case TileType.Ice:
            this.graphics.fillStyle(COLORS.ice, 1);
            this.graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            break;
          case TileType.Base:
            if (!this.baseDestroyed) {
              this.graphics.fillStyle(COLORS.base, 1);
              this.graphics.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
              this.graphics.fillStyle(0xffffff, 1);
              this.graphics.fillTriangle(x + 8, y + 4, x + 4, y + 12, x + 12, y + 12);
            }
            break;
          case TileType.Forest:
            this.forestGraphics.fillStyle(COLORS.forest, 0.85);
            this.forestGraphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            break;
        }
      }
    }
  }

  private drawBrickCell(x: number, y: number, b: BrickQuadrants): void {
    const half = TILE_SIZE / 2;
    const drawQ = (qx: number, qy: number, on: boolean) => {
      if (!on) return;
      this.graphics.fillStyle(COLORS.brick, 1);
      this.graphics.fillRect(x + qx, y + qy, half, half);
      this.graphics.lineStyle(1, COLORS.brickDark, 1);
      this.graphics.strokeRect(x + qx, y + qy, half, half);
    };
    drawQ(0, 0, b.tl);
    drawQ(half, 0, b.tr);
    drawQ(0, half, b.bl);
    drawQ(half, half, b.br);
  }

  private drawSteel(x: number, y: number): void {
    this.graphics.fillStyle(COLORS.steel, 1);
    this.graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    this.graphics.lineStyle(1, COLORS.steelDark, 1);
    this.graphics.lineBetween(x + 4, y + 4, x + 12, y + 12);
    this.graphics.lineBetween(x + 12, y + 4, x + 4, y + 12);
  }

  fortifyBase(): void {
    for (let row = GRID_SIZE - 3; row < GRID_SIZE; row++) {
      for (let col = 4; col <= 8; col++) {
        const cell = this.cells[row]?.[col];
        if (cell && (cell.type === TileType.Brick || cell.type === TileType.Steel)) {
          cell.type = TileType.Steel;
          cell.brick = emptyBrick();
          cell.steelHits = 0;
          cell.fortified = true;
        }
      }
    }
    this.redraw();
  }

  damageAt(px: number, py: number, power: number): boolean {
    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false;

    const cell = this.cells[row][col];
    const lx = px - col * TILE_SIZE;
    const ly = py - row * TILE_SIZE;

    if (cell.type === TileType.Base) {
      this.baseDestroyed = true;
      this.redraw();
      return true;
    }

    if (cell.type === TileType.Brick) {
      const hits = power >= 3 ? 2 : 1;
      for (let i = 0; i < hits; i++) this.damageBrickQuadrant(cell, lx, ly);
      if (!cell.brick.tl && !cell.brick.tr && !cell.brick.bl && !cell.brick.br) {
        cell.type = TileType.Empty;
      }
      this.redraw();
      return true;
    }

    if (cell.type === TileType.Steel && power >= 3) {
      cell.steelHits++;
      if (cell.steelHits >= 2 && !cell.fortified) {
        cell.type = TileType.Empty;
      }
      this.redraw();
      return true;
    }

    return false;
  }

  private damageBrickQuadrant(cell: CellState, lx: number, ly: number): void {
    const half = TILE_SIZE / 2;
    if (lx < half && ly < half) cell.brick.tl = false;
    else if (lx >= half && ly < half) cell.brick.tr = false;
    else if (lx < half && ly >= half) cell.brick.bl = false;
    else cell.brick.br = false;
  }

  blocksTank(col: number, row: number): boolean {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return true;
    const t = this.cells[row][col].type;
    return t === TileType.Brick || t === TileType.Steel || t === TileType.Water || t === TileType.Base;
  }

  blocksBullet(col: number, row: number): boolean {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return true;
    const t = this.cells[row][col].type;
    return t === TileType.Brick || t === TileType.Steel || t === TileType.Base;
  }

  isForest(col: number, row: number): boolean {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false;
    return this.cells[row][col].type === TileType.Forest;
  }

  isIce(col: number, row: number): boolean {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false;
    return this.cells[row][col].type === TileType.Ice;
  }
}
