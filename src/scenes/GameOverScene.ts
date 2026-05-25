import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import type { GameRegistryData } from '../config/GameRegistry';
import { saveHighScore } from '../config/GameRegistry';

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
    this.cameras.main.fadeIn(300);

    // GAME OVER rises into view (classic feel)
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT + 40, 'GAME\nOVER', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#d63020',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: GAME_HEIGHT / 2 - 24,
      duration: 1100,
      ease: 'Sine.easeOut',
    });

    if (data.baseDestroyed) {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 22, 'BASE DESTROYED', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#888888',
      }).setOrigin(0.5);
    }

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, `SCORE  ${String(gd.score).padStart(6, '0')}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 54, `HI     ${String(gd.highScore).padStart(6, '0')}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: newHigh ? '#eeb850' : '#888888',
    }).setOrigin(0.5);

    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 24, 'PRESS ENTER', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#eeb850',
    }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: { from: 1, to: 0.3 }, duration: 500, yoyo: true, repeat: -1 });

    this.time.delayedCall(1100, () => {
      this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('MainMenuScene'));
      this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('MainMenuScene'));
    });
  }
}
