import Phaser from 'phaser';
import {
  COLORS,
  ENEMIES_PER_STAGE,
  UI_FONT,
  PLAYFIELD_OFFSET_X,
  PLAYFIELD_OFFSET_Y,
  PLAYFIELD_SIZE,
  SIDEBAR_WIDTH,
} from '../config/constants';
import { drawCornerFrame, TEXT_SHADOW } from './UiHelpers';

export class HUD {
  private enemyIcons: Phaser.GameObjects.Image[] = [];
  private livesValue!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private stageText!: Phaser.GameObjects.Text;
  private starText!: Phaser.GameObjects.Text;
  private bg!: Phaser.GameObjects.Rectangle;
  private bgInner!: Phaser.GameObjects.Rectangle;
  private flagBody!: Phaser.GameObjects.Graphics;
  private sidebarBorder!: Phaser.GameObjects.Graphics;
  private cornerFrame!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    const sx = PLAYFIELD_OFFSET_X + PLAYFIELD_SIZE + 8;

    // Sidebar plate
    this.bg = scene.add
      .rectangle(sx, PLAYFIELD_OFFSET_Y, SIDEBAR_WIDTH - 8, PLAYFIELD_SIZE, COLORS.sidebar)
      .setOrigin(0)
      .setDepth(20);
    this.bgInner = scene.add
      .rectangle(sx + 2, PLAYFIELD_OFFSET_Y + 2, SIDEBAR_WIDTH - 12, PLAYFIELD_SIZE - 4, COLORS.sidebarShadow)
      .setOrigin(0)
      .setDepth(21);

    this.sidebarBorder = scene.add.graphics().setDepth(22);
    this.sidebarBorder.lineStyle(1, 0xffffff, 0.4);
    this.sidebarBorder.strokeRect(sx, PLAYFIELD_OFFSET_Y, SIDEBAR_WIDTH - 8, PLAYFIELD_SIZE);
    this.sidebarBorder.lineStyle(1, 0x2a2a2a, 1);
    this.sidebarBorder.strokeRect(sx + 1, PLAYFIELD_OFFSET_Y + 1, SIDEBAR_WIDTH - 10, PLAYFIELD_SIZE - 2);

    this.cornerFrame = scene.add.graphics().setDepth(22);
    drawCornerFrame(this.cornerFrame, sx + 2, PLAYFIELD_OFFSET_Y + 2, SIDEBAR_WIDTH - 12, PLAYFIELD_SIZE - 4, 0xffffff, 0.25, 6);

    // High score (top bar above playfield)
    this.highScoreText = scene.add
      .text(PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y - 6, 'HI 20000', {
        fontFamily: UI_FONT,
        fontSize: '7px',
        color: '#eeb850',
        shadow: TEXT_SHADOW,
      })
      .setOrigin(0, 1)
      .setDepth(23);

    this.scoreText = scene.add
      .text(PLAYFIELD_OFFSET_X + PLAYFIELD_SIZE, PLAYFIELD_OFFSET_Y - 6, 'IP 000000', {
        fontFamily: UI_FONT,
        fontSize: '7px',
        color: '#ffffff',
        shadow: TEXT_SHADOW,
      })
      .setOrigin(1, 1)
      .setDepth(23);

    scene.add
      .text(sx + 6, PLAYFIELD_OFFSET_Y + 4, 'REST', {
        fontFamily: UI_FONT,
        fontSize: '6px',
        color: '#e0e0e0',
        shadow: TEXT_SHADOW,
      })
      .setOrigin(0.5, 0)
      .setDepth(23);

    // Enemy reserve grid: 2 columns × 10 rows of mini tank icons
    const iconStartX = sx + 8;
    const iconStartY = PLAYFIELD_OFFSET_Y + 14;
    for (let i = 0; i < ENEMIES_PER_STAGE; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const icon = scene.add
        .image(iconStartX + col * 16, iconStartY + row * 10, 'enemy-icon')
        .setOrigin(0)
        .setDepth(22);
      this.enemyIcons.push(icon);
    }

    const dividerY = iconStartY + 10 * 10 + 4;
    scene.add
      .rectangle(sx + 4, dividerY, SIDEBAR_WIDTH - 16, 1, 0x707070)
      .setOrigin(0)
      .setDepth(22);
    scene.add
      .rectangle(sx + 4, dividerY + 1, SIDEBAR_WIDTH - 16, 1, 0x3a3a3a)
      .setOrigin(0)
      .setDepth(22);

    // Lives label
    const livesY = iconStartY + 10 * 10 + 10;
    scene.add
      .text(sx + 6, livesY, 'IP', {
        fontFamily: UI_FONT,
        fontSize: '8px',
        color: '#ffffff',
      })
      .setDepth(23);
    scene.add.image(sx + 6, livesY + 11, 'life-icon').setOrigin(0).setDepth(23);
    this.livesValue = scene.add
      .text(sx + 22, livesY + 13, '3', {
        fontFamily: UI_FONT,
        fontSize: '10px',
        color: '#ffffff',
        shadow: TEXT_SHADOW,
      })
      .setDepth(23);

    // Stage flag
    const flagY = livesY + 32;
    scene.add
      .text(sx + 6, flagY - 2, 'STAGE', {
        fontFamily: 'monospace',
        fontSize: '6px',
        color: '#cccccc',
      })
      .setDepth(23);
    this.flagBody = scene.add.graphics().setDepth(23);
    this.drawFlag(sx + 6, flagY + 6);
    this.stageText = scene.add
      .text(sx + 22, flagY + 8, '1', {
        fontFamily: UI_FONT,
        fontSize: '12px',
        color: '#ffffff',
        shadow: TEXT_SHADOW,
      })
      .setDepth(23);

    // Star tier
    this.starText = scene.add
      .text(sx + 6, flagY + 26, '★0', {
        fontFamily: UI_FONT,
        fontSize: '9px',
        color: '#ffd040',
        shadow: { offsetX: 0, offsetY: 0, color: '#806000', blur: 2, fill: true },
      })
      .setDepth(23);
  }

  private drawFlag(x: number, y: number): void {
    const g = this.flagBody;
    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(x, y + 14, 6, 2);
    g.fillStyle(0xffffff, 1);
    g.fillRect(x + 2, y, 1, 16);
    g.fillStyle(COLORS.hudFlag, 1);
    g.fillTriangle(x + 3, y + 1, x + 14, y + 4, x + 3, y + 8);
  }

  update(enemiesRemaining: number, lives: number, stage: number, score: number, starLevel: number, highScore: number): void {
    const defeated = ENEMIES_PER_STAGE - enemiesRemaining;
    this.enemyIcons.forEach((icon, i) => {
      icon.setVisible(i >= defeated);
      icon.setAlpha(i >= defeated ? 1 : 0.35);
    });
    this.livesValue.setText(String(lives));
    this.stageText.setText(String(stage));
    this.scoreText.setText(`1P ${String(score).padStart(6, '0')}`);
    this.highScoreText.setText(`HI ${String(highScore).padStart(5, '0')}`);
    this.highScoreText.setColor(score >= highScore && score > 0 ? '#ffec80' : '#eeb850');
    this.starText.setText(`★${starLevel}`);
    this.starText.setColor(starLevel > 0 ? '#ffec80' : '#ffd040');
  }

  destroy(): void {
    this.bg.destroy();
    this.bgInner.destroy();
    this.sidebarBorder.destroy();
    this.cornerFrame.destroy();
    this.flagBody.destroy();
    this.enemyIcons.forEach((i) => i.destroy());
    this.livesValue.destroy();
    this.stageText.destroy();
    this.starText.destroy();
    this.scoreText.destroy();
    this.highScoreText.destroy();
  }
}
