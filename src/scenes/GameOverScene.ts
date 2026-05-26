import Phaser from 'phaser';
import { COLORS, colorHex, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import type { GameRegistryData } from '../config/GameRegistry';
import { saveHighScore } from '../config/GameRegistry';
import { uiText } from '../ui/textStyle';

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

    this.add.rectangle(0, 0, GAME_WIDTH, 28, COLORS.background, 0.9).setOrigin(0);
    this.add.rectangle(0, GAME_HEIGHT - 28, GAME_WIDTH, 28, COLORS.background, 0.9).setOrigin(0);

    this.add.text(GAME_WIDTH / 2 + 2, GAME_HEIGHT + 42, 'GAME\nOVER', uiText('16px', '#000000', { align: 'center' })).setOrigin(0.5);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT + 40, 'GAME\nOVER', uiText('16px', '#d63020', { align: 'center' })).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: GAME_HEIGHT / 2 - 24,
      duration: 1100,
      ease: 'Sine.easeOut',
    });

    if (data.baseDestroyed) {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 22, 'BASE DESTROYED', uiText('7px', colorHex(COLORS.uiMuted))).setOrigin(0.5);
    }

    const rank = gd.score >= 100000 ? 'ACE' : gd.score >= 50000 ? 'VETERAN' : gd.score >= 20000 ? 'SOLDIER' : 'RECRUIT';
    const rankTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 28, rank, uiText('8px', colorHex(COLORS.uiAccent))).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: rankTxt, alpha: 1, delay: 900, duration: 400 });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, `SCORE ${String(gd.score).padStart(6, '0')}`, uiText('8px', '#ffffff')).setOrigin(0.5);

    const hiTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 54, `HI ${String(gd.highScore).padStart(6, '0')}`, uiText('8px', newHigh ? colorHex(COLORS.uiAccent) : colorHex(COLORS.uiMuted))).setOrigin(0.5);
    if (newHigh) this.tweens.add({ targets: hiTxt, scale: { from: 1, to: 1.08 }, duration: 350, yoyo: true, repeat: 3 });

    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 24, 'PRESS ENTER', uiText('8px', colorHex(COLORS.uiAccent), {
      backgroundColor: '#1a1a1a',
      padding: { x: 6, y: 4 },
    })).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: { from: 1, to: 0.3 }, duration: 500, yoyo: true, repeat: -1 });

    this.time.delayedCall(1100, () => {
      this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('MainMenuScene'));
      this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('MainMenuScene'));
    });
  }
}
