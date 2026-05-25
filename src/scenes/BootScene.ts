import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const { width, height } = this.scale;
    const bar = this.add.rectangle(width / 2, height / 2, 200, 16, 0x333333);
    const fill = this.add.rectangle(width / 2 - 98, height / 2, 4, 12, 0xf0a020).setOrigin(0, 0.5);

    this.load.on('progress', (v: number) => {
      fill.width = 196 * v;
    });
    bar.setVisible(true);
  }

  create(): void {
    this.scene.start('MainMenuScene');
  }
}
