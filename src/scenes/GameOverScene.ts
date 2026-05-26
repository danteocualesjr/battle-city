import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import type { GameRegistryData } from '../config/GameRegistry';
import { saveHighScore } from '../config/GameRegistry';
import { addStarfield, drawCornerFrame, TEXT_SHADOW } from '../ui/UiHelpers';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { gameData: GameRegistryData; baseDestroyed?: boolean }): void {
    const gd = data.gameData;
    const newHigh = gd.score > gd.highScore;
    if (newHigh) {
      gd.highScore = gd.score;
      saveHighScore(gd.score);
    }

    this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.fadeIn(450);
    addStarfield(this, 24);

    const frame = this.add.graphics();
    drawCornerFrame(frame, 16, 16, GAME_WIDTH - 32, GAME_HEIGHT - 32, COLORS.uiAccent, 0.4, 12);

    this.add.text(GAME_WIDTH / 2 + 2, GAME_HEIGHT + 42, 'GAME\nOVER', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#000000',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT + 40, 'GAME\nOVER', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#d63020',
      align: 'center',
      fontStyle: 'bold',
      shadow: TEXT_SHADOW,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: GAME_HEIGHT / 2 - 30,
      duration: 1100,
      ease: 'Sine.easeOut',
    });

    const panelY = GAME_HEIGHT / 2 + 8;
    const panel = this.add.rectangle(GAME_WIDTH / 2, panelY + 20, 160, 72, 0x111111, 0.85).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, delay: 900, duration: 300 });

    if (data.baseDestroyed) {
      this.time.delayedCall(1000, () => {
        this.add.text(GAME_WIDTH / 2, panelY - 6, 'BASE DESTROYED', {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#cc4444',
          shadow: TEXT_SHADOW,
        }).setOrigin(0.5);
      });
    }

    const rank = gd.score >= 100000 ? 'ACE' : gd.score >= 50000 ? 'VETERAN' : gd.score >= 20000 ? 'SOLDIER' : 'RECRUIT';

    this.time.delayedCall(1000, () => {
      this.add.text(GAME_WIDTH / 2, panelY + 4, rank, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#eeb850',
        shadow: TEXT_SHADOW,
      }).setOrigin(0.5);

      this.add.text(GAME_WIDTH / 2, panelY + 20, `SCORE  ${String(gd.score).padStart(6, '0')}`, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffffff',
        shadow: TEXT_SHADOW,
      }).setOrigin(0.5);

      this.add.text(GAME_WIDTH / 2, panelY + 36, `HI     ${String(gd.highScore).padStart(6, '0')}`, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: newHigh ? '#ffec80' : '#888888',
        shadow: TEXT_SHADOW,
      }).setOrigin(0.5);
    });

    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'PRESS ENTER', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#eeb850',
      backgroundColor: '#1a1a1a',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: hint, alpha: { from: 0, to: 1 }, delay: 1100, duration: 300 });
    this.tweens.add({ targets: hint, alpha: { from: 1, to: 0.35 }, delay: 1400, duration: 500, yoyo: true, repeat: -1 });

    this.time.delayedCall(1100, () => {
      this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('MainMenuScene'));
      this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('MainMenuScene'));
    });
  }
}
