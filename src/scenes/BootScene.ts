import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { generateAllSprites } from '../render/Sprites';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a0a);
    generateAllSprites(this);
    const load = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'LOADING...', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#eeb850',
    }).setOrigin(0.5);
    this.tweens.add({ targets: load, alpha: { from: 0.3, to: 1 }, duration: 400, yoyo: true, repeat: -1 });
    this.time.delayedCall(600, () => {
      load.destroy();
      this.scene.start('MainMenuScene');
    });
  }
}
