import Phaser from 'phaser';
import { COLORS, colorHex, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import type { GameRegistryData } from '../config/GameRegistry';
import { saveHighScore } from '../config/GameRegistry';
import { uiText } from '../ui/textStyle';

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

    this.add.rectangle(0, 0, GAME_WIDTH, 24, COLORS.background, 0.85).setOrigin(0);
    this.add.rectangle(0, GAME_HEIGHT - 24, GAME_WIDTH, 24, COLORS.background, 0.85).setOrigin(0);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 36, `STAGE ${gd.stage}`, uiText('10px', '#cccccc')).setOrigin(0.5);

    const clearTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 12, 'CLEAR', uiText('18px', colorHex(COLORS.uiAccent))).setOrigin(0.5).setScale(0.5);
    this.tweens.add({ targets: clearTxt, scale: 1, duration: 500, ease: 'Back.easeOut' });

    const spark = this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 12, 'particle', {
      speed: { min: 20, max: 80 },
      scale: { start: 1.2, end: 0 },
      lifespan: 600,
      quantity: 0,
      tint: [COLORS.uiAccent, COLORS.hudStar, 0xffffff],
      emitting: false,
    });
    this.time.delayedCall(200, () => spark.explode(16));

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 8, 120, 1, 0x444444).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, 'TOTAL', uiText('7px', colorHex(COLORS.uiMuted))).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 32, String(gd.score).padStart(7, '0'), uiText('12px', '#ffffff')).setOrigin(0.5);

    if (gd.score >= gd.highScore) {
      const hi = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, 'NEW HI-SCORE!', uiText('7px', colorHex(COLORS.hudFlag))).setOrigin(0.5);
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
