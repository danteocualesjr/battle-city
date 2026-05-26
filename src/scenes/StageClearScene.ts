import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import type { GameRegistryData } from '../config/GameRegistry';
import { saveHighScore } from '../config/GameRegistry';
import { drawCornerFrame, TEXT_SHADOW } from '../ui/UiHelpers';

export class StageClearScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StageClearScene' });
  }

  create(data: { gameData: GameRegistryData }): void {
    const gd = data.gameData;
    const newHigh = gd.score > gd.highScore;
    if (newHigh) {
      gd.highScore = gd.score;
      saveHighScore(gd.score);
    }

    this.cameras.main.setBackgroundColor(0x0a0a0a);
    this.cameras.main.fadeIn(400);

    const frame = this.add.graphics();
    drawCornerFrame(frame, 20, 24, GAME_WIDTH - 40, GAME_HEIGHT - 48, COLORS.uiAccent, 0.5, 10);

    const burst = this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'particle', {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 600,
      quantity: 16,
      tint: [COLORS.uiAccent, COLORS.hudFlag, 0xffffff],
      emitting: false,
    });
    burst.explode(24);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `STAGE  ${gd.stage}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#999999',
      shadow: TEXT_SHADOW,
    }).setOrigin(0.5);

    const clearTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 14, 'STAGE CLEAR', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#eeb850',
      fontStyle: 'bold',
      shadow: TEXT_SHADOW,
    }).setOrigin(0.5).setScale(0.4);
    this.tweens.add({ targets: clearTxt, scale: 1, duration: 550, ease: 'Back.easeOut' });

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 6, 140, 1, COLORS.uiAccent, 0.5).setOrigin(0.5);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 7, 100, 1, 0x444444).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 16, 'TOTAL SCORE', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#777777',
    }).setOrigin(0.5);

    const scoreTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 32, String(gd.score).padStart(7, '0'), {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      shadow: TEXT_SHADOW,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: scoreTxt, alpha: 1, delay: 300, duration: 400 });

    if (newHigh) {
      const hi = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 52, '★ NEW HI-SCORE ★', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#ff5020',
        shadow: TEXT_SHADOW,
      }).setOrigin(0.5);
      this.tweens.add({ targets: hi, alpha: { from: 1, to: 0.35 }, duration: 400, yoyo: true, repeat: -1 });
    }

    const next = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, `NEXT: STAGE ${gd.stage + 1}`, {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#666666',
    }).setOrigin(0.5);

    this.tweens.add({ targets: next, alpha: { from: 0.4, to: 1 }, duration: 600, yoyo: true, repeat: -1 });

    gd.stage++;
    this.time.delayedCall(2600, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0, (_c: Phaser.Cameras.Scene2D.Camera, p: number) => {
        if (p >= 1) this.scene.start('GameScene', { stage: gd.stage, gameData: gd });
      });
    });
  }
}
