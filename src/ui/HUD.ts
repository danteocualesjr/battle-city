import Phaser from 'phaser';
import {
  COLORS,
  ENEMIES_PER_STAGE,
  PLAYFIELD_OFFSET_X,
  PLAYFIELD_OFFSET_Y,
  PLAYFIELD_SIZE,
  SIDEBAR_WIDTH,
} from '../config/constants';

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
    this.sidebarBorder.lineStyle(1, 0xffffff, 0.35);
    this.sidebarBorder.strokeRect(sx, PLAYFIELD_OFFSET_Y, SIDEBAR_WIDTH - 8, PLAYFIELD_SIZE);
    this.sidebarBorder.lineStyle(1, 0x3a3a3a, 1);
    this.sidebarBorder.strokeRect(sx + 1, PLAYFIELD_OFFSET_Y + 1, SIDEBAR_WIDTH - 10, PLAYFIELD_SIZE - 2);

    // High score (top)
    this.highScoreText = scene.add
      .text(PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y - 6, 'HI 20000', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#ffffff',
      })
      .setOrigin(0, 1)
      .setDepth(23);

    this.scoreText = scene.add
      .text(PLAYFIELD_OFFSET_X + PLAYFIELD_SIZE, PLAYFIELD_OFFSET_Y - 6, 'IP 000000', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#ffffff',
      })
      .setOrigin(1, 1)
      .setDepth(23);

    // Enemy reserve grid: 2 columns × 10 rows of mini tank icons
    const iconStartX = sx + 8;
    const iconStartY = PLAYFIELD_OFFSET_Y + 12;
    for (let i = 0; i < ENEMIES_PER_STAGE; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const icon = scene.add
        .image(iconStartX + col * 16, iconStartY + row * 10, 'enemy-icon')
        .setOrigin(0)
        .setDepth(22);
      this.enemyIcons.push(icon);
    }

    // Lives label
    const livesY = iconStartY + 10 * 10 + 8;
    scene.add
      .text(sx + 6, livesY, 'IP', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#ffffff',
      })
      .setDepth(23);
    scene.add.image(sx + 6, livesY + 12, 'life-icon').setOrigin(0).setDepth(23);
    this.livesValue = scene.add
      .text(sx + 22, livesY + 13, '3', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffffff',
      })
      .setDepth(23);

    // Stage flag
    const flagY = livesY + 30;
    this.flagBody = scene.add.graphics().setDepth(23);
    this.drawFlag(sx + 6, flagY);
    this.stageText = scene.add
      .text(sx + 22, flagY + 8, '1', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffffff',
      })
      .setDepth(23);

    // Star tier
    this.starText = scene.add
      .text(sx + 6, flagY + 26, '★0', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#ffd040',
      })
      .setDepth(23);
  }

  private drawFlag(x: number, y: number): void {
    const g = this.flagBody;
    // pole
    g.fillStyle(0xffffff, 1);
    g.fillRect(x + 2, y, 1, 16);
    // flag (red triangle pennant)
    g.fillStyle(COLORS.hudFlag, 1);
    g.fillTriangle(x + 3, y + 1, x + 14, y + 4, x + 3, y + 8);
  }

  update(enemiesRemaining: number, lives: number, stage: number, score: number, starLevel: number, highScore: number): void {
    const defeated = ENEMIES_PER_STAGE - enemiesRemaining;
    this.enemyIcons.forEach((icon, i) => {
      icon.setVisible(i >= defeated);
    });
    this.livesValue.setText(String(lives));
    this.stageText.setText(String(stage));
    this.scoreText.setText(`IP ${String(score).padStart(6, '0')}`);
    this.highScoreText.setText(`HI ${String(highScore).padStart(5, '0')}`);
    this.starText.setText(`★${starLevel}`);
  }

  destroy(): void {
    this.bg.destroy();
    this.bgInner.destroy();
    this.sidebarBorder.destroy();
    this.flagBody.destroy();
    this.enemyIcons.forEach((i) => i.destroy());
    this.livesValue.destroy();
    this.stageText.destroy();
    this.starText.destroy();
    this.scoreText.destroy();
    this.highScoreText.destroy();
  }
}
