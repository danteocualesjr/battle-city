import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, UI_FONT } from '../config/constants';
import { generateAllSprites } from '../render/Sprites';
import { drawCornerFrame } from '../ui/UiHelpers';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    generateAllSprites(this);

    const barBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 8, 120, 8, 0x222222).setOrigin(0.5);
    const barFill = this.add.rectangle(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 8, 0, 6, COLORS.uiAccent).setOrigin(0, 0.5);
    const load = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 14, 'LOADING', {
      fontFamily: UI_FONT,
      fontSize: '8px',
      color: '#eeb850',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);
    this.tweens.add({ targets: load, alpha: { from: 0.3, to: 1 }, duration: 400, yoyo: true, repeat: -1 });
    this.tweens.add({
      targets: barFill,
      width: 116,
      duration: 500,
      ease: 'Sine.easeOut',
      onComplete: () => {
        load.destroy();
        barBg.destroy();
        barFill.destroy();
        this.scene.start('MainMenuScene');
      },
    });
  }
}
