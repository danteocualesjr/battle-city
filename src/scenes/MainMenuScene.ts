import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { createDefaultRegistry, loadHighScore } from '../config/GameRegistry';

export class MainMenuScene extends Phaser.Scene {
  private selected = 0;
  private options = ['1 PLAYER', '2 PLAYERS', 'CONSTRUCTION'];
  private cursor!: Phaser.GameObjects.Rectangle;
  private labels: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.black);
    const data = createDefaultRegistry();
    data.highScore = loadHighScore();

    this.add.text(GAME_WIDTH / 2, 24, `I- ${String(data.score).padStart(2, '0')}     HI- ${data.highScore}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);

    this.drawTitle();
    const startY = 130;
    this.options.forEach((opt, i) => {
      const t = this.add.text(GAME_WIDTH / 2, startY + i * 22, opt, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
      }).setOrigin(0.5);
      this.labels.push(t);
    });

    this.cursor = this.add.rectangle(GAME_WIDTH / 2 - 72, startY, 12, 10, COLORS.player1);
    this.tweens.add({ targets: this.cursor, x: '+=4', duration: 400, yoyo: true, repeat: -1 });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 36, 'namco tribute', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#c05830',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, '© 1985 NAMCO — fan recreation', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#888888',
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown-UP', () => this.moveCursor(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveCursor(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirm());

    this.cameras.main.fadeIn(400);
  }

  private drawTitle(): void {
    const g = this.add.graphics();
    const letters = ['BATTLE', 'CITY'];
    letters.forEach((word, wi) => {
      const y = 52 + wi * 28;
      word.split('').forEach((ch, ci) => {
        const x = GAME_WIDTH / 2 - word.length * 10 + ci * 20;
        g.fillStyle(COLORS.titleBrick, 1);
        g.fillRect(x, y, 16, 20);
        g.lineStyle(1, 0xffffff, 0.6);
        g.strokeRect(x, y, 16, 20);
        this.add.text(x + 8, y + 10, ch, { fontFamily: 'monospace', fontSize: '14px', color: '#fff' }).setOrigin(0.5);
      });
    });
  }

  private moveCursor(dir: number): void {
    this.selected = Phaser.Math.Wrap(this.selected + dir, 0, this.options.length);
    this.cursor.y = 130 + this.selected * 22;
    this.labels.forEach((l, i) => l.setColor(i === this.selected ? '#f0a020' : '#ffffff'));
  }

  private confirm(): void {
    if (this.selected === 0) {
      const reg = createDefaultRegistry();
      this.registry.set('gameData', reg);
      this.cameras.main.fadeOut(300, 0, 0, 0, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
        if (progress >= 1) this.scene.start('GameScene', { stage: 1 });
      });
    } else if (this.selected === 1) {
      this.showSoon('2-player co-op coming soon');
    } else {
      this.showSoon('Construction mode coming soon');
    }
  }

  private showSoon(msg: string): void {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 56, msg, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#f0a020',
    }).setOrigin(0.5);
    this.time.delayedCall(1500, () => t.destroy());
  }
}
