import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
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
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'STAGE CLEAR', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#f0a020',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, `SCORE ${gd.score}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);

    gd.stage++;
    this.time.delayedCall(2000, () => {
      this.scene.start('GameScene', { stage: gd.stage, gameData: gd });
    });
  }
}
