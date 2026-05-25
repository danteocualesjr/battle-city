import Phaser from 'phaser';
import {
  COLORS,
  ENEMIES_PER_STAGE,
  GAME_HEIGHT,
  PLAYFIELD_SIZE,
  SIDEBAR_WIDTH,
} from '../config/constants';

export class HUD {
  private enemyIcons: Phaser.GameObjects.Rectangle[] = [];
  private livesText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private stageText!: Phaser.GameObjects.Text;
  private starText!: Phaser.GameObjects.Text;
  private panel!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    const x = PLAYFIELD_SIZE;
    this.panel = scene.add
      .rectangle(x + SIDEBAR_WIDTH / 2, GAME_HEIGHT / 2, SIDEBAR_WIDTH, GAME_HEIGHT, COLORS.sidebar)
      .setDepth(20);
    scene.add.rectangle(x + SIDEBAR_WIDTH / 2, GAME_HEIGHT / 2, SIDEBAR_WIDTH - 4, GAME_HEIGHT - 4, COLORS.sidebarDark).setDepth(21);

    for (let i = 0; i < ENEMIES_PER_STAGE; i++) {
      const col = i < 10 ? 0 : 1;
      const row = i % 10;
      const icon = scene.add
        .rectangle(
          x + 10 + col * 14,
          16 + row * 10,
          8,
          6,
          0x303030,
        )
        .setDepth(22);
      this.enemyIcons.push(icon);
    }

    this.livesText = scene.add.text(x + 8, 130, 'IP\n♦ 2', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setDepth(23);

    scene.add.text(x + 8, 165, 'STAGE', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#cccccc',
    }).setDepth(23);

    this.stageText = scene.add.text(x + 14, 182, '1', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#f08030',
    }).setDepth(23);

    this.starText = scene.add.text(x + 8, 200, '★0', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#ffd700',
    }).setDepth(23);

    this.scoreText = scene.add.text(4, 4, '0', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setDepth(23);
  }

  update(enemiesRemaining: number, lives: number, stage: number, score: number, starLevel: number): void {
    const defeated = ENEMIES_PER_STAGE - enemiesRemaining;
    this.enemyIcons.forEach((icon, i) => {
      icon.setVisible(i >= defeated);
    });
    this.livesText.setText(`IP\n♦ ${lives}`);
    this.stageText.setText(String(stage));
    this.scoreText.setText(String(score).padStart(6, '0'));
    this.starText.setText(`★${starLevel}`);
  }

  destroy(): void {
    this.panel.destroy();
    this.enemyIcons.forEach((i) => i.destroy());
    this.livesText.destroy();
    this.stageText.destroy();
    this.starText.destroy();
    this.scoreText.destroy();
  }
}
