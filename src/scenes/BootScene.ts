import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { generateAllSprites } from '../render/Sprites';
import { drawCornerFrame } from '../ui/UiHelpers';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    generateAllSprites(this);

    const frame = this.add.graphics();
    drawCornerFrame(frame, 24, GAME_HEIGHT / 2 - 28, GAME_WIDTH - 48, 56, COLORS.uiAccent, 0.6, 8);

    const load = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, 'LOADING', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#eeb850',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 120, 6, 0x2a2a2a).setOrigin(0.5);
    const barFill = this.add.rectangle(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 10, 0, 4, COLORS.uiAccent).setOrigin(0, 0.5);

    this.tweens.add({
      targets: barFill,
      width: 116,
      duration: 500,
      ease: 'Linear',
    });
    this.tweens.add({ targets: load, alpha: { from: 0.4, to: 1 }, duration: 350, yoyo: true, repeat: -1 });

    this.time.delayedCall(600, () => {
      load.destroy();
      barBg.destroy();
      barFill.destroy();
      frame.destroy();
      this.scene.start('MainMenuScene');
    });
  }
}
