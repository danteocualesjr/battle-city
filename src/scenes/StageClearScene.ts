import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import type { GameRegistryData } from '../config/GameRegistry';
import { saveHighScore } from '../config/GameRegistry';

export class StageClearScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StageClearScene' });
  }

  create(data: { gameData: GameRegistryData }): void {
    const gd = data.gameData;
    if (gd.score > gd.highScore) {
      gd.highScore = gd.score;
      saveHighScore(gd.score);
    }

    this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.fadeIn(400);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 36, `STAGE  ${gd.stage}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#cccccc',
    }).setOrigin(0.5);

    const clearTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 12, 'CLEAR', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#eeb850',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScale(0.5);
    this.tweens.add({ targets: clearTxt, scale: 1, duration: 500, ease: 'Back.easeOut' });

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 8, 120, 1, 0x444444).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, 'TOTAL', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#888888',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 32, String(gd.score).padStart(7, '0'), {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    if (gd.score >= gd.highScore) {
      const hi = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'NEW HI-SCORE!', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: COLORS.hudFlag === 0xe85020 ? '#e85020' : '#ff5020',
      }).setOrigin(0.5);
      this.tweens.add({ targets: hi, alpha: { from: 1, to: 0.3 }, duration: 400, yoyo: true, repeat: -1 });
    }

    gd.stage++;
    this.time.delayedCall(2400, () => {
      this.cameras.main.fadeOut(250, 0, 0, 0, (_c: Phaser.Cameras.Scene2D.Camera, p: number) => {
        if (p >= 1) this.scene.start('GameScene', { stage: gd.stage, gameData: gd });
      });
    });
  }
}
