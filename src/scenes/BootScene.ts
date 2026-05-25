import Phaser from 'phaser';
import { generateAllSprites } from '../render/Sprites';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    generateAllSprites(this);
    this.scene.start('MainMenuScene');
  }
}
