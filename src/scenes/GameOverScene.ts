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
    if (gd.score > gd.highScore) {
      gd.highScore = gd.score;
      saveHighScore(gd.score);
    }

    this.cameras.main.setBackgroundColor(0x000000);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#c04030',
    }).setOrigin(0.5);

    if (data.baseDestroyed) {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'BASE DESTROYED', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#888888',
      }).setOrigin(0.5);
    }

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24, `FINAL SCORE ${gd.score}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 48, 'PRESS ENTER', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#f0a020',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.children.list,
      alpha: { from: 1, to: 0.4 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('MainMenuScene'));
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('MainMenuScene'));
  }
}
