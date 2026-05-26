import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { createDefaultRegistry, loadHighScore } from '../config/GameRegistry';
import { generateAllSprites } from '../render/Sprites';
import { addStarfield, drawCornerFrame, TEXT_SHADOW } from '../ui/UiHelpers';

const TITLE_LETTERS: Record<string, string[]> = {
  B: ['#####.', '#....#', '#####.', '#....#', '#####.'],
  A: ['.###..', '#...#.', '#####.', '#...#.', '#...#.'],
  T: ['#####.', '..#...', '..#...', '..#...', '..#...'],
  L: ['#.....', '#.....', '#.....', '#.....', '#####.'],
  E: ['#####.', '#.....', '###...', '#.....', '#####.'],
  C: ['.####.', '#.....', '#.....', '#.....', '.####.'],
  I: ['#####.', '..#...', '..#...', '..#...', '#####.'],
  Y: ['#...#.', '.#.#..', '..#...', '..#...', '..#...'],
};

export class MainMenuScene extends Phaser.Scene {
  private selected = 0;
  private options = ['1 PLAYER', '2 PLAYERS', 'CONSTRUCTION'];
  private cursor!: Phaser.GameObjects.Image;
  private labels: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    generateAllSprites(this);
    addStarfield(this);

    const data = createDefaultRegistry();
    data.highScore = loadHighScore();

    this.add.text(20, 12, '1P  000000', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#cccccc',
      shadow: TEXT_SHADOW,
    });
    this.add.text(GAME_WIDTH - 20, 12, `HI  ${String(data.highScore).padStart(6, '0')}`, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#eeb850',
      shadow: TEXT_SHADOW,
    }).setOrigin(1, 0);

    const frame = this.add.graphics();
    frame.lineStyle(1, 0xffffff, 0.12);
    frame.strokeRect(12, 32, GAME_WIDTH - 24, GAME_HEIGHT - 64);
    drawCornerFrame(frame, 12, 32, GAME_WIDTH - 24, GAME_HEIGHT - 64, COLORS.uiAccent, 0.55, 14);

    this.add.text(GAME_WIDTH - 14, 22, 'v1.1', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#555555',
    }).setOrigin(1, 0);

    this.drawTitle();
    this.addDecorTanks();

    const startY = 152;
    this.options.forEach((opt, i) => {
      const t = this.add.text(GAME_WIDTH / 2, startY + i * 20, opt, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#888888',
        shadow: TEXT_SHADOW,
      }).setOrigin(0.5, 0.5);
      this.labels.push(t);
    });

    this.cursor = this.add.image(GAME_WIDTH / 2 - 72, startY, 'tank-p1-right').setOrigin(0, 0.5);
    this.tweens.add({ targets: this.cursor, x: '+=4', duration: 320, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 30, 200, 14, 0x000000, 0.35).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, '↑↓ SELECT   ENTER START', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#bbbbbb',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 12, 'fan tribute · NAMCO 1985', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#555555',
    }).setOrigin(0.5);

    this.refreshMenuLabels();

    this.input.keyboard?.on('keydown-UP', () => this.moveCursor(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveCursor(1));
    this.input.keyboard?.on('keydown-W', () => this.moveCursor(-1));
    this.input.keyboard?.on('keydown-S', () => this.moveCursor(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirm());

    this.cameras.main.fadeIn(450);
  }

  private addDecorTanks(): void {
    const left = this.add.image(36, 118, 'tank-e-basic-right').setAlpha(0.35).setFlipX(true);
    const right = this.add.image(GAME_WIDTH - 36, 118, 'tank-p2-left').setAlpha(0.35);
    this.tweens.add({ targets: [left, right], y: '+=2', duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private drawTitle(): void {
    const lines = ['BATTLE', 'CITY'];
    const cellSize = 4;
    const letterWidth = 6 * cellSize;
    const letterSpacing = 1 * cellSize;
    const lineSpacing = 7 * cellSize;
    const startY = 40;

    lines.forEach((word, li) => {
      const totalWidth = word.length * (letterWidth + letterSpacing) - letterSpacing;
      const startX = (GAME_WIDTH - totalWidth) / 2;
      const y = startY + li * lineSpacing;
      word.split('').forEach((ch, ci) => {
        const pattern = TITLE_LETTERS[ch];
        if (!pattern) return;
        const lx = startX + ci * (letterWidth + letterSpacing);
        this.drawLetter(lx, y, pattern, cellSize);
      });
    });
  }

  private drawLetter(x: number, y: number, pattern: string[], cs: number): void {
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.45);
    for (let r = 0; r < pattern.length; r++) {
      const row = pattern[r]!;
      for (let c = 0; c < row.length; c++) {
        if (row[c] === '#') shadow.fillRect(x + c * cs + 2, y + r * cs + 2, cs, cs);
      }
    }
    const g = this.add.graphics();
    for (let r = 0; r < pattern.length; r++) {
      const row = pattern[r]!;
      for (let c = 0; c < row.length; c++) {
        if (row[c] === '#') {
          g.fillStyle(COLORS.titleBrickLight, 1);
          g.fillRect(x + c * cs, y + r * cs, cs, cs);
          g.fillStyle(COLORS.titleBrick, 1);
          g.fillRect(x + c * cs + 1, y + r * cs + 1, cs - 1, cs - 1);
          g.fillStyle(0x4a1f10, 1);
          g.fillRect(x + c * cs, y + r * cs + cs - 1, cs, 1);
        }
      }
    }
  }

  private moveCursor(dir: number): void {
    this.selected = Phaser.Math.Wrap(this.selected + dir, 0, this.options.length);
    this.cursor.y = 152 + this.selected * 20;
    this.refreshMenuLabels();
  }

  private refreshMenuLabels(): void {
    this.labels.forEach((l, i) => {
      const on = i === this.selected;
      l.setColor(on ? '#eeb850' : '#888888');
      l.setScale(on ? 1.08 : 1);
      l.setText(on ? `▶ ${this.options[i]} ◀` : this.options[i]!);
    });
  }

  private confirm(): void {
    if (this.selected === 0) {
      const reg = createDefaultRegistry();
      reg.highScore = loadHighScore();
      this.cameras.main.fadeOut(300, 0, 0, 0, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
        if (progress >= 1) this.scene.start('GameScene', { stage: 1, gameData: reg });
      });
    } else if (this.selected === 1) {
      this.showSoon('2-player co-op coming soon');
    } else {
      this.showSoon('Construction mode coming soon');
    }
  }

  private showSoon(msg: string): void {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 50, msg, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#eeb850',
      shadow: TEXT_SHADOW,
    }).setOrigin(0.5);
    this.time.delayedCall(1500, () => t.destroy());
  }
}
