import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { createDefaultRegistry, loadHighScore } from '../config/GameRegistry';
import { generateAllSprites } from '../render/Sprites';

const TITLE_LETTERS: Record<string, string[]> = {
  B: [
    '#####.',
    '#....#',
    '#####.',
    '#....#',
    '#####.',
  ],
  A: [
    '.###..',
    '#...#.',
    '#####.',
    '#...#.',
    '#...#.',
  ],
  T: [
    '#####.',
    '..#...',
    '..#...',
    '..#...',
    '..#...',
  ],
  L: [
    '#.....',
    '#.....',
    '#.....',
    '#.....',
    '#####.',
  ],
  E: [
    '#####.',
    '#.....',
    '###...',
    '#.....',
    '#####.',
  ],
  C: [
    '.####.',
    '#.....',
    '#.....',
    '#.....',
    '.####.',
  ],
  I: [
    '#####.',
    '..#...',
    '..#...',
    '..#...',
    '#####.',
  ],
  Y: [
    '#...#.',
    '.#.#..',
    '..#...',
    '..#...',
    '..#...',
  ],
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

    const data = createDefaultRegistry();
    data.highScore = loadHighScore();

    // Top scores bar
    this.add.text(20, 12, 'I-      00', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    });
    this.add.text(GAME_WIDTH - 20, 12, `HI- ${data.highScore}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    const frame = this.add.graphics();
    frame.lineStyle(2, COLORS.uiAccent, 0.5);
    frame.strokeRect(12, 32, GAME_WIDTH - 24, GAME_HEIGHT - 64);
    frame.lineStyle(1, 0xffffff, 0.15);
    frame.strokeRect(14, 34, GAME_WIDTH - 28, GAME_HEIGHT - 68);

    this.drawTitle();

    const startY = 150;
    this.options.forEach((opt, i) => {
      const t = this.add.text(GAME_WIDTH / 2 + 6, startY + i * 18, opt, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#ffffff',
      }).setOrigin(0, 0.5);
      this.labels.push(t);
    });

    this.cursor = this.add.image(GAME_WIDTH / 2 - 40, startY, 'tank-p1-right').setOrigin(0, 0.5);
    this.tweens.add({ targets: this.cursor, x: '+=3', duration: 350, yoyo: true, repeat: -1 });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 28, '↑ ↓  SELECT     ENTER  CONFIRM', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#888888',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, 'fan tribute · NAMCO 1985', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#666666',
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown-UP', () => this.moveCursor(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveCursor(1));
    this.input.keyboard?.on('keydown-W', () => this.moveCursor(-1));
    this.input.keyboard?.on('keydown-S', () => this.moveCursor(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirm());

    this.cameras.main.fadeIn(300);
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
          // brick fill with highlight
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
    this.cursor.y = 150 + this.selected * 18;
    this.labels.forEach((l, i) => l.setColor(i === this.selected ? '#eeb850' : '#ffffff'));
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
    }).setOrigin(0.5);
    this.time.delayedCall(1500, () => t.destroy());
  }
}
