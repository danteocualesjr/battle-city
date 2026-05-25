import Phaser from 'phaser';
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYFIELD_SIZE,
  TILE_SIZE,
  type Direction,
} from '../config/constants';
import type { GameRegistryData } from '../config/GameRegistry';
import { createDefaultRegistry } from '../config/GameRegistry';
import { GameController } from '../game/GameController';
import { LEVELS } from '../map/levels';
import { TileMap } from '../map/TileMap';
import { HUD } from '../ui/HUD';
import type { EnemyState } from '../entities/types';

const TANK_SIZE = 14;

export class GameScene extends Phaser.Scene {
  private map!: TileMap;
  private controller!: GameController;
  private hud!: HUD;
  private gameData!: GameRegistryData;
  private tankGfx!: Phaser.GameObjects.Graphics;
  private bulletGfx!: Phaser.GameObjects.Graphics;
  private powerGfx!: Phaser.GameObjects.Graphics;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey!: Phaser.Input.Keyboard.Key;
  private pauseKey!: Phaser.Input.Keyboard.Key;
  private paused = false;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private stageBanner!: Phaser.GameObjects.Text;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private lastEnemyCount = 0;
  private shovelTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { stage?: number; gameData?: GameRegistryData }): void {
    this.gameData = data.gameData ?? createDefaultRegistry();
    if (data.stage) this.gameData.stage = data.stage;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.black);
    this.cameras.main.fadeIn(300);

    const stageIdx = Math.min(this.gameData.stage - 1, LEVELS.length - 1);
    this.map = new TileMap(this);
    this.map.loadFromStrings(LEVELS[stageIdx]!);

    this.controller = new GameController(this.map, this.gameData);
    this.controller.resetStage();

    this.tankGfx = this.add.graphics().setDepth(10);
    this.bulletGfx = this.add.graphics().setDepth(11);
    this.powerGfx = this.add.graphics().setDepth(9);
    this.hud = new HUD(this);

    this.stageBanner = this.add
      .text(PLAYFIELD_SIZE / 2, GAME_HEIGHT / 2, `STAGE ${this.gameData.stage}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);

    this.tweens.add({
      targets: this.stageBanner,
      alpha: 1,
      y: GAME_HEIGHT / 2 - 10,
      duration: 400,
      yoyo: true,
      hold: 600,
      onComplete: () => this.stageBanner.destroy(),
    });

    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 40, max: 120 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 8,
      emitting: false,
    }).setDepth(15);

    const particleTex = this.textures.createCanvas('particle', 4, 4);
    if (particleTex) {
      const ctx = particleTex.getContext();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 4, 4);
      particleTex.refresh();
    }

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.buildPauseOverlay();
    this.lastEnemyCount = this.controller.enemies.length;

    this.cameras.main.fadeIn(300);
  }

  private buildPauseOverlay(): void {
    this.pauseOverlay = this.add.container(0, 0).setDepth(50).setVisible(false);
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'PAUSED', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);
    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'ESC resume · R restart · Q quit', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#cccccc',
    }).setOrigin(0.5);
    this.pauseOverlay.add([bg, txt, hint]);
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.paused = !this.paused;
      this.pauseOverlay.setVisible(this.paused);
    }
    if (this.paused) return;

    if (this.input.keyboard?.checkDown(this.input.keyboard.addKey('R'), 500)) {
      this.scene.restart({ stage: this.gameData.stage, gameData: this.gameData });
      return;
    }
    if (this.input.keyboard?.checkDown(this.input.keyboard.addKey('Q'), 500)) {
      this.scene.start('MainMenuScene');
      return;
    }

    let moveDir: Direction | null = null;
    if (this.cursors.left?.isDown) moveDir = 'left';
    else if (this.cursors.right?.isDown) moveDir = 'right';
    else if (this.cursors.up?.isDown) moveDir = 'up';
    else if (this.cursors.down?.isDown) moveDir = 'down';

    const fire = Phaser.Input.Keyboard.JustDown(this.fireKey);

    this.controller.update(dt, moveDir, fire);

    if (this.map.baseDestroyed || (this.gameData.lives <= 0 && !this.controller.player.alive)) {
      this.cameras.main.shake(200, 0.01);
      this.time.delayedCall(800, () => {
        this.scene.start('GameOverScene', {
          gameData: this.gameData,
          baseDestroyed: this.map.baseDestroyed,
        });
      });
      this.paused = true;
      return;
    }

    if (this.controller.stageComplete) {
      this.time.delayedCall(500, () => {
        this.scene.start('StageClearScene', { gameData: this.gameData });
      });
      this.paused = true;
      return;
    }

    this.trackExplosions();
    this.render();
    this.hud.update(
      this.controller.enemiesRemaining,
      this.gameData.lives,
      this.gameData.stage,
      this.gameData.score,
      this.gameData.starLevel,
    );
  }

  private trackExplosions(): void {
    const count = this.controller.enemies.filter((e) => e.alive).length;
    if (count < this.lastEnemyCount) {
      const dead = this.controller.enemies.find((e) => !e.alive);
      if (dead) this.burst(dead.x + 7, dead.y + 7, COLORS.enemyBasic);
    }
    this.lastEnemyCount = count;
  }

  private burst(x: number, y: number, color: number): void {
    this.particles.setParticleTint(color);
    this.particles.explode(10, x, y);
  }

  private render(): void {
    this.tankGfx.clear();
    this.bulletGfx.clear();
    this.powerGfx.clear();

    if (this.controller.player.alive) {
      this.drawTank(
        this.controller.player.x,
        this.controller.player.y,
        this.controller.player.direction,
        COLORS.player1,
        this.controller.player.invincible,
      );
    }

    for (const e of this.controller.enemies) {
      if (!e.alive) continue;
      const color = this.enemyColor(e);
      this.drawTank(e.x, e.y, e.direction, color, false, e.flashing);
    }

    for (const b of this.controller.bullets) {
      this.bulletGfx.fillStyle(COLORS.bullet, 1);
      this.bulletGfx.fillRect(b.x - 2, b.y - 2, 4, 4);
    }

    if (this.controller.powerUp?.active) {
      const p = this.controller.powerUp;
      const blink = Math.sin(this.time.now / 120) > 0;
      this.powerGfx.fillStyle(0xf0f040, blink ? 1 : 0.4);
      this.powerGfx.fillRect(p.x + 4, p.y + 4, 8, 8);
    }

    const px = this.controller.player.x + 7;
    const py = this.controller.player.y + 7;
    const pCol = Math.floor(px / TILE_SIZE);
    const pRow = Math.floor(py / TILE_SIZE);
    this.tankGfx.setAlpha(this.map.isForest(pCol, pRow) ? 0.3 : 1);
  }

  private enemyColor(e: EnemyState): number {
    if (e.kind === 'armor') {
      const dmg = e.maxHp - e.hp;
      return [COLORS.enemyArmor, 0x508050, 0x707070, 0x909090][dmg] ?? COLORS.enemyArmor;
    }
    return { basic: COLORS.enemyBasic, fast: COLORS.enemyFast, power: COLORS.enemyPower, armor: COLORS.enemyArmor }[e.kind];
  }

  private drawTank(
    x: number,
    y: number,
    dir: Direction,
    color: number,
    invincible: boolean,
    flashing = false,
  ): void {
    if (invincible || flashing) {
      this.tankGfx.lineStyle(1, 0xffffff, Math.sin(this.time.now / 80) * 0.5 + 0.5);
      this.tankGfx.strokeRect(x - 1, y - 1, TANK_SIZE + 2, TANK_SIZE + 2);
    }
    this.tankGfx.fillStyle(color, 1);
    this.tankGfx.fillRect(x + 2, y + 2, TANK_SIZE - 4, TANK_SIZE - 4);
    this.tankGfx.fillStyle(0x333333, 1);
    const barrel = 5;
    const cx = x + TANK_SIZE / 2;
    const cy = y + TANK_SIZE / 2;
    switch (dir) {
      case 'up':
        this.tankGfx.fillRect(cx - 1, y, 2, barrel);
        break;
      case 'down':
        this.tankGfx.fillRect(cx - 1, y + TANK_SIZE - barrel, 2, barrel);
        break;
      case 'left':
        this.tankGfx.fillRect(x, cy - 1, barrel, 2);
        break;
      case 'right':
        this.tankGfx.fillRect(x + TANK_SIZE - barrel, cy - 1, barrel, 2);
        break;
    }
  }

  shutdown(): void {
    this.hud?.destroy();
    this.shovelTimer?.destroy();
  }
}
