import Phaser from 'phaser';
import { COLORS } from '../config/constants';

/** Draw a retro corner-bracket frame around a rectangle. */
export function drawCornerFrame(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number = COLORS.uiAccent,
  alpha = 0.85,
  len = 10,
): void {
  g.lineStyle(2, color, alpha);
  // top-left
  g.beginPath();
  g.moveTo(x, y + len);
  g.lineTo(x, y);
  g.lineTo(x + len, y);
  g.strokePath();
  // top-right
  g.beginPath();
  g.moveTo(x + w - len, y);
  g.lineTo(x + w, y);
  g.lineTo(x + w, y + len);
  g.strokePath();
  // bottom-right
  g.beginPath();
  g.moveTo(x + w, y + h - len);
  g.lineTo(x + w, y + h);
  g.lineTo(x + w - len, y + h);
  g.strokePath();
  // bottom-left
  g.beginPath();
  g.moveTo(x + len, y + h);
  g.lineTo(x, y + h);
  g.lineTo(x, y + h - len);
  g.strokePath();
}

/** Spawn twinkling background stars for menu scenes. */
export function addStarfield(scene: Phaser.Scene, count = 48): Phaser.GameObjects.Graphics[] {
  const stars: Phaser.GameObjects.Graphics[] = [];
  const { width, height } = scene.cameras.main;
  for (let i = 0; i < count; i++) {
    const dot = scene.add.graphics().setDepth(-1);
    const px = Phaser.Math.Between(4, width - 4);
    const py = Phaser.Math.Between(4, height - 4);
    const size = Phaser.Math.FloatBetween(0.5, 1.5);
    const bright = Phaser.Math.Between(0, 1) === 1;
    dot.fillStyle(bright ? 0xffffff : 0x666666, Phaser.Math.FloatBetween(0.15, 0.55));
    dot.fillRect(px, py, size, size);
    scene.tweens.add({
      targets: dot,
      alpha: { from: dot.alpha, to: Phaser.Math.FloatBetween(0.05, 0.2) },
      duration: Phaser.Math.Between(800, 2200),
      yoyo: true,
      repeat: -1,
      delay: Phaser.Math.Between(0, 1200),
    });
    stars.push(dot);
  }
  return stars;
}

export const TEXT_SHADOW = {
  offsetX: 1,
  offsetY: 1,
  color: '#000000',
  blur: 0,
  fill: true,
} as const;
