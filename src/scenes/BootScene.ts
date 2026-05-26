import Phaser from 'phaser';
import { COLORS, colorHex, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { generateAllSprites } from '../render/Sprites';
import { uiText } from '../ui/textStyle';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    generateAllSprites(this);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 22, 'BATTLE CITY', uiText('12px', colorHex(COLORS.uiAccent))).setOrigin(0.5);
    const load = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 6, 'LOADING', uiText('8px', '#aaaaaa')).setOrigin(0.5);
    const barBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 22, 100, 6, 0x222222).setOrigin(0.5);
    const bar = this.add.rectangle(GAME_WIDTH / 2 - 50, GAME_HEIGHT / 2 + 22, 0, 4, COLORS.uiAccent).setOrigin(0, 0.5);
    this.tweens.add({ targets: bar, width: 96, duration: 500, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: load, alpha: { from: 0.35, to: 1 }, duration: 400, yoyo: true, repeat: -1 });

    this.time.delayedCall(700, () => {
      load.destroy();
      bar.destroy();
      barBg.destroy();
      this.scene.start('MainMenuScene');
    });
  }
}
