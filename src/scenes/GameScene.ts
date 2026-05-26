import Phaser from 'phaser';
import {
  COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  UI_FONT,
  PLAYFIELD_OFFSET_X,
  PLAYFIELD_OFFSET_Y,
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
import { drawCornerFrame, TEXT_SHADOW } from '../ui/UiHelpers';
import { generateAllSprites } from '../render/Sprites';
import type { EnemyState } from '../entities/types';

const TANK_OFFSET = -1; // tank sprite is 16x16, tank logical pos sits at +1 inside a 16px tile

export class GameScene extends Phaser.Scene {
  private map!: TileMap;
  private controller!: GameController;
  private hud!: HUD;
  private gameData!: GameRegistryData;

  private playfield!: Phaser.GameObjects.Container;
  private playerSprite?: Phaser.GameObjects.Image;
  private enemySprites: Phaser.GameObjects.Image[] = [];
  private bulletSprites: Phaser.GameObjects.Image[] = [];
  private powerSprite?: Phaser.GameObjects.Image;
  private powerBg?: Phaser.GameObjects.Image;
  private invincibleRing?: Phaser.GameObjects.Graphics;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey!: Phaser.Input.Keyboard.Key;
  private pauseKey!: Phaser.Input.Keyboard.Key;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private quitKey!: Phaser.Input.Keyboard.Key;

  private paused = false;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private stageIntroOverlay!: Phaser.GameObjects.Container;
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
    this.cameras.main.setBackgroundColor(COLORS.background);
    generateAllSprites(this);

    // Reset stale references between scene restarts.
    this.playerSprite = undefined;
    this.enemySprites = [];
    this.bulletSprites = [];
    this.powerSprite = undefined;
    this.powerBg = undefined;
    this.invincibleRing = undefined;
    this.paused = false;
    this.shovelTimer = undefined;

    // Playfield frame: dark border + black inner area
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.background).setOrigin(0).setDepth(0);
    this.add.rectangle(PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y, PLAYFIELD_SIZE, PLAYFIELD_SIZE, COLORS.playfield).setOrigin(0).setDepth(0.5);
    const pfFrame = this.add.graphics().setDepth(0.7);
    pfFrame.lineStyle(2, COLORS.uiAccent, 0.35);
    pfFrame.strokeRect(PLAYFIELD_OFFSET_X - 1, PLAYFIELD_OFFSET_Y - 1, PLAYFIELD_SIZE + 2, PLAYFIELD_SIZE + 2);
    pfFrame.lineStyle(1, 0x444444, 1);
    pfFrame.strokeRect(PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y, PLAYFIELD_SIZE, PLAYFIELD_SIZE);
    drawCornerFrame(pfFrame, PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y, PLAYFIELD_SIZE, PLAYFIELD_SIZE, 0xffffff, 0.2, 8);

    // Playfield container (everything inside the play area)
    this.playfield = this.add.container(PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y).setDepth(8);

    const stageIdx = Math.min(this.gameData.stage - 1, LEVELS.length - 1);
    this.map = new TileMap(this);
    this.map.loadFromStrings(LEVELS[stageIdx]!);

    this.controller = new GameController(this.map, this.gameData);
    this.controller.resetStage();

    this.hud = new HUD(this);

    this.invincibleRing = this.add.graphics().setDepth(15);

    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 30, max: 100 },
      scale: { start: 1.5, end: 0 },
      lifespan: 350,
      quantity: 0,
      emitting: false,
    }).setDepth(16);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.fireKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.quitKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

    this.buildPauseOverlay();
    this.buildStageIntro();
    this.lastEnemyCount = this.controller.enemies.length;

    this.cameras.main.fadeIn(400);
  }

  private buildStageIntro(): void {
    this.stageIntroOverlay = this.add.container(0, 0).setDepth(60);
    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x7d7d7d).setOrigin(0);
    const label = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, 'STAGE', {
      fontFamily: UI_FONT,
      fontSize: '8px',
      color: '#333333',
    }).setOrigin(0.5);
    const num = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 8, String(this.gameData.stage), {
      fontFamily: UI_FONT,
      fontSize: '16px',
      color: '#000000',
    }).setOrigin(0.5);
    const txt = this.add.container(0, 0, [stripes, label, numShadow, num]);
    this.stageIntroOverlay.add([bg, txt]);
    this.tweens.add({ targets: [num, numShadow], scale: { from: 1.35, to: 1 }, duration: 450, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: this.stageIntroOverlay,
      alpha: 0,
      delay: 1600,
      duration: 400,
      onComplete: () => this.stageIntroOverlay.setVisible(false),
    });
  }

  private buildPauseOverlay(): void {
    this.pauseOverlay = this.add.container(0, 0).setDepth(50).setVisible(false);
    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.pauseOverlay, COLORS.pauseDim).setOrigin(0);
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 136, 68, 0x1a1a1a, 0.92).setOrigin(0.5);
    const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 14, 'PAUSE', {
      fontFamily: UI_FONT,
      fontSize: '12px',
      color: '#e85020',
      shadow: TEXT_SHADOW,
    }).setOrigin(0.5);
    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 14, 'ESC resume · R restart · Q quit', {
      fontFamily: UI_FONT,
      fontSize: '6px',
      color: '#ffffff',
    }).setOrigin(0.5);
    const frame = this.add.graphics();
    frame.lineStyle(2, COLORS.uiAccent, 0.8);
    frame.strokeRect(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 - 36, 140, 72);
    this.pauseOverlay.add([bg, panel, frame, txt, hint]);
    this.tweens.add({ targets: txt, alpha: { from: 1, to: 0.45 }, duration: 600, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: icon, y: '-=2', duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.paused = !this.paused;
      this.pauseOverlay.setVisible(this.paused);
    }
    if (this.paused) return;

    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart({ stage: this.gameData.stage, gameData: this.gameData });
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.quitKey)) {
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

    if (this.controller.shovelActive && !this.shovelTimer) {
      this.shovelTimer = this.time.delayedCall(15_000, () => {
        this.map.unfortifyBase();
        this.controller.shovelActive = false;
        this.shovelTimer = undefined;
      });
    }

    this.trackExplosions();
    this.render();
    this.hud.update(
      this.controller.enemiesRemaining,
      this.gameData.lives,
      this.gameData.stage,
      this.gameData.score,
      this.gameData.starLevel,
      this.gameData.highScore,
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
    this.particles.explode(12, PLAYFIELD_OFFSET_X + x, PLAYFIELD_OFFSET_Y + y);
  }

  private render(): void {
    this.invincibleRing!.clear();

    // Player
    if (this.controller.player.alive) {
      if (!this.playerSprite) {
        this.playerSprite = this.add.image(0, 0, 'tank-p1-up').setOrigin(0).setDepth(10);
        this.playfield.add(this.playerSprite);
      }
      this.playerSprite.setVisible(true);
      this.playerSprite.setTexture(`tank-p1-${this.controller.player.direction}`);
      this.playerSprite.setPosition(this.controller.player.x + TANK_OFFSET, this.controller.player.y + TANK_OFFSET);

      const pCol = Math.floor((this.controller.player.x + 7) / TILE_SIZE);
      const pRow = Math.floor((this.controller.player.y + 7) / TILE_SIZE);
      this.playerSprite.setAlpha(this.map.isForest(pCol, pRow) ? 0.25 : 1);

      if (this.controller.player.invincible) {
        this.drawInvincibleRing(this.controller.player.x, this.controller.player.y);
      }
    } else if (this.playerSprite) {
      this.playerSprite.setVisible(false);
    }

    // Enemies
    let i = 0;
    for (const e of this.controller.enemies) {
      if (!e.alive) continue;
      if (!this.enemySprites[i]) {
        const img = this.add.image(0, 0, 'tank-e-basic-down').setOrigin(0).setDepth(10);
        this.playfield.add(img);
        this.enemySprites[i] = img;
      }
      const sprite = this.enemySprites[i]!;
      const tex = this.enemyTexture(e);
      sprite.setTexture(tex);
      sprite.setPosition(e.x + TANK_OFFSET, e.y + TANK_OFFSET);
      sprite.setVisible(true);

      const eCol = Math.floor((e.x + 7) / TILE_SIZE);
      const eRow = Math.floor((e.y + 7) / TILE_SIZE);
      sprite.setAlpha(this.map.isForest(eCol, eRow) ? 0.25 : 1);

      if (e.flashing) {
        const flick = Math.floor(this.time.now / 80) % 2 === 0;
        sprite.setTint(flick ? 0xff8080 : 0xffffff);
      } else {
        sprite.clearTint();
      }
      i++;
    }
    for (let j = i; j < this.enemySprites.length; j++) {
      this.enemySprites[j]!.setVisible(false);
    }

    // Bullets
    let bi = 0;
    for (const b of this.controller.bullets) {
      if (!b.active) continue;
      if (!this.bulletSprites[bi]) {
        const img = this.add.image(0, 0, 'bullet-up').setOrigin(0.5).setDepth(11);
        this.playfield.add(img);
        this.bulletSprites[bi] = img;
      }
      const s = this.bulletSprites[bi]!;
      const tex = b.direction === 'up' || b.direction === 'down' ? 'bullet-up' : 'bullet-h';
      s.setTexture(tex);
      s.setRotation(b.direction === 'down' ? Math.PI : b.direction === 'left' ? Math.PI : 0);
      s.setPosition(b.x, b.y);
      s.setVisible(true);
      bi++;
    }
    for (let j = bi; j < this.bulletSprites.length; j++) {
      this.bulletSprites[j]!.setVisible(false);
    }

    // Power-up
    if (this.controller.powerUp?.active) {
      const p = this.controller.powerUp;
      if (!this.powerBg) {
        this.powerBg = this.add.image(0, 0, 'pu-bg').setOrigin(0).setDepth(9);
        this.playfield.add(this.powerBg);
      }
      if (!this.powerSprite) {
        this.powerSprite = this.add.image(0, 0, 'pu-star').setOrigin(0).setDepth(9.5);
        this.playfield.add(this.powerSprite);
      }
      this.powerBg.setPosition(p.x, p.y).setVisible(true);
      this.powerSprite.setTexture(`pu-${p.kind}`).setPosition(p.x, p.y).setVisible(true);
      const blink = Math.sin(this.time.now / 140) > 0;
      this.powerBg.setAlpha(blink ? 1 : 0.2);
      this.powerSprite.setAlpha(blink ? 1 : 0.2);
    } else {
      this.powerBg?.setVisible(false);
      this.powerSprite?.setVisible(false);
    }
  }

  private drawInvincibleRing(x: number, y: number): void {
    const t = this.time.now / 60;
    const r = this.invincibleRing!;
    r.lineStyle(1, 0xffffff, 1);
    const ox = PLAYFIELD_OFFSET_X + x - 1;
    const oy = PLAYFIELD_OFFSET_Y + y - 1;
    if (Math.floor(t) % 2 === 0) {
      r.strokeRect(ox, oy, 16, 16);
      r.lineStyle(1, 0x80c0ff, 1);
      r.strokeRect(ox + 2, oy + 2, 12, 12);
    } else {
      r.strokeRect(ox + 2, oy + 2, 12, 12);
      r.lineStyle(1, 0x80c0ff, 1);
      r.strokeRect(ox, oy, 16, 16);
    }
  }

  private enemyTexture(e: EnemyState): string {
    const dir = e.direction;
    if (e.kind === 'armor') {
      const dmg = e.maxHp - e.hp;
      const variants = ['e-armor', 'e-armor-1', 'e-armor-2', 'e-armor-3'];
      const v = variants[Math.min(dmg, 3)];
      return `tank-${v}-${dir}`;
    }
    return `tank-e-${e.kind}-${dir}`;
  }

  shutdown(): void {
    this.hud?.destroy();
    this.shovelTimer?.destroy();
  }
}
