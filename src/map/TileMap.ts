import Phaser from 'phaser';
import { GRID_SIZE, PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y, TILE_SIZE } from '../config/constants';
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
  private bgLayer: Phaser.GameObjects.Container;
  private fgLayer: Phaser.GameObjects.Container;
  private cellNodes: Phaser.GameObjects.GameObject[][] = [];
  baseDestroyed = false;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.bgLayer = scene.add.container(PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y).setDepth(1);
    this.fgLayer = scene.add.container(PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y).setDepth(5);
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
    this.bgLayer.removeAll(true);
    this.fgLayer.removeAll(true);
    this.cellNodes = Array.from({ length: GRID_SIZE }, () => []);

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = this.cells[row][col];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        switch (cell.type) {
          case TileType.Brick:
            this.placeBrick(x, y, cell.brick, col, row);
            break;
          case TileType.Steel: {
            const img = this.scene.add.image(x, y, 'steel').setOrigin(0);
            this.bgLayer.add(img);
            this.cellNodes[row][col] = img;
            break;
          }
          case TileType.Water: {
            const img = this.scene.add.image(x, y, 'water').setOrigin(0);
            this.bgLayer.add(img);
            this.cellNodes[row][col] = img;
            break;
          }
          case TileType.Ice: {
            const img = this.scene.add.image(x, y, 'ice').setOrigin(0);
            this.bgLayer.add(img);
            this.cellNodes[row][col] = img;
            break;
          }
          case TileType.Base: {
            if (!this.baseDestroyed) {
              const img = this.scene.add.image(x, y, 'base').setOrigin(0);
              this.bgLayer.add(img);
              this.cellNodes[row][col] = img;
            } else {
              const img = this.scene.add.image(x, y, 'base-destroyed').setOrigin(0);
              this.bgLayer.add(img);
              this.cellNodes[row][col] = img;
            }
            break;
          }
          case TileType.Forest: {
            const img = this.scene.add.image(x, y, 'forest').setOrigin(0);
            this.fgLayer.add(img);
            this.cellNodes[row][col] = img;
            break;
          }
        }
      }
    }
  }

  private placeBrick(x: number, y: number, b: BrickQuadrants, col: number, row: number): void {
    const half = TILE_SIZE / 2;
    const container = this.scene.add.container(x, y);
    if (b.tl) container.add(this.scene.add.image(0, 0, 'brick-q').setOrigin(0));
    if (b.tr) container.add(this.scene.add.image(half, 0, 'brick-q').setOrigin(0));
    if (b.bl) container.add(this.scene.add.image(0, half, 'brick-q').setOrigin(0));
    if (b.br) container.add(this.scene.add.image(half, half, 'brick-q').setOrigin(0));
    this.bgLayer.add(container);
    this.cellNodes[row][col] = container;
  }

  fortifyBase(): void {
    const targets = [
      { col: 5, row: 12 }, { col: 6, row: 12 }, { col: 7, row: 12 },
      { col: 5, row: 11 }, { col: 7, row: 11 },
    ];
    for (const { col, row } of targets) {
      const cell = this.cells[row]?.[col];
      if (cell && (cell.type === TileType.Brick || cell.type === TileType.Empty || cell.type === TileType.Steel)) {
        cell.type = TileType.Steel;
        cell.brick = emptyBrick();
        cell.steelHits = 0;
        cell.fortified = true;
      }
    }
    this.redraw();
  }

  unfortifyBase(): void {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = this.cells[row][col];
        if (cell.fortified) {
          cell.type = TileType.Brick;
          cell.brick = fullBrick();
          cell.fortified = false;
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
