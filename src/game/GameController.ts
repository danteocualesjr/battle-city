import {
  BULLET_SPEED,
  DIR_VECTORS,
  ENEMIES_PER_STAGE,
  ENEMY_SPEED,
  EXTRA_LIFE_SCORE,
  FLASHING_SPAWN_INDICES,
  GRID_SIZE,
  MAX_ACTIVE_ENEMIES,
  PLAYER_SPEED,
  POWERUP_POSITIONS,
  POWERUP_SCORE,
  SPAWN_POINTS,
  TILE_SIZE,
  type Direction,
} from '../config/constants';
import type { GameRegistryData } from '../config/GameRegistry';
import { TileMap } from '../map/TileMap';
import type { BulletState, EnemyKind, EnemyState, PowerUpKind } from '../entities/types';

const TANK_SIZE = 14;
const HALF = TANK_SIZE / 2;

export interface PowerUpEntity {
  kind: PowerUpKind;
  x: number;
  y: number;
  active: boolean;
}

export class GameController {
  player = { x: 4 * TILE_SIZE + 1, y: 9 * TILE_SIZE + 1, direction: 'up' as Direction, alive: true, invincible: true, frozen: false };
  enemies: EnemyState[] = [];
  bullets: BulletState[] = [];
  powerUp: PowerUpEntity | null = null;

  enemiesSpawned = 0;
  enemiesKilled = 0;
  stageFrozen = false;
  freezeTimer = 0;
  helmetTimer = 0;
  stageIntroTimer = 2;
  spawnTimer = 0;
  playerBulletsOnScreen = 0;

  shovelActive = false;

  constructor(
    public map: TileMap,
    public registry: GameRegistryData,
  ) {}

  resetStage(): void {
    this.player = { x: 4 * TILE_SIZE + 1, y: 9 * TILE_SIZE + 1, direction: 'up', alive: true, invincible: true, frozen: false };
    this.enemies = [];
    this.bullets = [];
    this.powerUp = null;
    this.enemiesSpawned = 0;
    this.enemiesKilled = 0;
    this.stageFrozen = false;
    this.freezeTimer = 0;
    this.helmetTimer = 0;
    this.stageIntroTimer = 2;
    this.spawnTimer = 0;
    this.playerBulletsOnScreen = 0;
    this.shovelActive = false;
  }

  get enemiesRemaining(): number {
    return ENEMIES_PER_STAGE - this.enemiesKilled;
  }

  get stageComplete(): boolean {
    return this.enemiesKilled >= ENEMIES_PER_STAGE;
  }

  get gameOver(): boolean {
    return this.map.baseDestroyed || this.registry.lives <= 0;
  }

  update(dt: number, moveDir: Direction | null, fire: boolean): void {
    if (this.stageIntroTimer > 0) {
      this.stageIntroTimer -= dt;
      return;
    }

    if (this.stageIntroTimer > 0) {
      this.player.invincible = true;
    } else if (this.helmetTimer > 0) {
      this.helmetTimer -= dt;
      this.player.invincible = this.helmetTimer > 0;
    } else {
      this.player.invincible = false;
    }

    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      this.stageFrozen = this.freezeTimer > 0;
    } else {
      this.stageFrozen = false;
    }

    if (moveDir) this.moveTank(this.player, moveDir, PLAYER_SPEED, dt, false);
    if (fire) this.fireBullet('player');

    if (!this.stageFrozen) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.enemies.length < MAX_ACTIVE_ENEMIES && this.enemiesSpawned < ENEMIES_PER_STAGE) {
        this.spawnEnemy();
        this.spawnTimer = 1.2;
      }
      for (const e of this.enemies) {
        if (!e.alive) continue;
        this.updateEnemyAI(e, dt);
      }
    }

    this.updateBullets(dt);

    if (this.powerUp?.active && this.rectOverlap(this.player.x, this.player.y, TANK_SIZE, this.powerUp.x, this.powerUp.y, TILE_SIZE)) {
      this.collectPowerUp(this.powerUp.kind);
      this.powerUp.active = false;
      this.powerUp = null;
    }
  }

  private spawnEnemy(): void {
    const idx = this.enemiesSpawned;
    this.enemiesSpawned++;
    const sp = SPAWN_POINTS[idx % SPAWN_POINTS.length];
    const kinds: EnemyKind[] = ['basic', 'fast', 'power', 'armor'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const hp = kind === 'armor' ? 4 : 1;
    const flashing = (FLASHING_SPAWN_INDICES as readonly number[]).includes(idx + 1);

    if (this.powerUp?.active) {
      this.powerUp.active = false;
      this.powerUp = null;
    }

    this.enemies.push({
      x: sp.col * TILE_SIZE + 1,
      y: sp.row * TILE_SIZE + 1,
      direction: 'down',
      alive: true,
      invincible: false,
      frozen: false,
      kind,
      hp,
      maxHp: hp,
      flashing,
      shootCooldown: 0.5 + Math.random(),
      moveCooldown: 0,
      aiTimer: 0.5 + Math.random() * 1.5,
    });
  }

  private updateEnemyAI(e: EnemyState, dt: number): void {
    e.aiTimer -= dt;
    e.shootCooldown -= dt;
    if (e.aiTimer <= 0) {
      const dirs: Direction[] = ['up', 'down', 'left', 'right'];
      e.direction = dirs[Math.floor(Math.random() * dirs.length)]!;
      e.aiTimer = 0.8 + Math.random() * 1.2;
    }
    const speed = ENEMY_SPEED[e.kind];
    this.moveTank(e, e.direction, speed, dt, true);
    if (e.shootCooldown <= 0) {
      this.fireBullet('enemy', e);
      e.shootCooldown = e.kind === 'power' ? 0.8 : 1.5 + Math.random();
    }
  }

  private moveTank(
    tank: { x: number; y: number; direction: Direction; alive: boolean },
    dir: Direction,
    speed: number,
    dt: number,
    isEnemy: boolean,
  ): void {
    if (!tank.alive) return;
    tank.direction = dir;
    const v = DIR_VECTORS[dir];
    const dist = speed * dt;
    const nx = tank.x + v.x * dist;
    const ny = tank.y + v.y * dist;

    if (!this.collidesTank(nx, tank.y, isEnemy ? tank : undefined)) tank.x = nx;
    if (!this.collidesTank(tank.x, ny, isEnemy ? tank : undefined)) tank.y = ny;

    if (this.map.isIce(Math.floor((tank.x + HALF) / TILE_SIZE), Math.floor((tank.y + HALF) / TILE_SIZE)) && dist > 0) {
      tank.x += v.x * dist * 0.3;
      tank.y += v.y * dist * 0.3;
    }
  }

  private collidesTank(x: number, y: number, ignore?: object): boolean {
    const cols = [Math.floor(x / TILE_SIZE), Math.floor((x + TANK_SIZE - 1) / TILE_SIZE)];
    const rows = [Math.floor(y / TILE_SIZE), Math.floor((y + TANK_SIZE - 1) / TILE_SIZE)];
    for (const row of rows) {
      for (const col of cols) {
        if (this.map.blocksTank(col, row)) return true;
      }
    }
    for (const e of this.enemies) {
      if (e === ignore || !e.alive) continue;
      if (this.rectOverlap(x, y, TANK_SIZE, e.x, e.y, TANK_SIZE)) return true;
    }
    if (!ignore) {
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (this.rectOverlap(x, y, TANK_SIZE, e.x, e.y, TANK_SIZE)) return true;
      }
    }
    return false;
  }

  fireBullet(owner: 'player' | 'enemy', enemy?: EnemyState): void {
    const maxPlayerBullets = this.registry.starLevel >= 2 ? 2 : 1;
    if (owner === 'player') {
      if (!this.player.alive || this.playerBulletsOnScreen >= maxPlayerBullets) return;
      const tank = this.player;
      const speed = this.registry.starLevel >= 1 ? BULLET_SPEED.fast : BULLET_SPEED.normal;
      const power = Math.min(this.registry.starLevel, 3);
      this.bullets.push(this.createBullet(tank, owner, speed, power));
      this.playerBulletsOnScreen++;
    } else if (enemy) {
      const speed = enemy.kind === 'power' ? BULLET_SPEED.fast : BULLET_SPEED.slow;
      this.bullets.push(this.createBullet(enemy, owner, speed, 0));
    }
  }

  private createBullet(
    tank: { x: number; y: number; direction: Direction },
    owner: 'player' | 'enemy',
    speed: number,
    power: number,
  ): BulletState {
    const v = DIR_VECTORS[tank.direction];
    const cx = tank.x + HALF;
    const cy = tank.y + HALF;
    return {
      x: cx + v.x * 8,
      y: cy + v.y * 8,
      direction: tank.direction,
      owner,
      active: true,
      power,
      speed,
    };
  }

  private updateBullets(dt: number): void {
    for (const b of this.bullets) {
      if (!b.active) continue;
      const v = DIR_VECTORS[b.direction];
      b.x += v.x * b.speed * dt;
      b.y += v.y * b.speed * dt;

      if (b.x < 0 || b.y < 0 || b.x > GRID_SIZE * TILE_SIZE || b.y > GRID_SIZE * TILE_SIZE) {
        b.active = false;
        if (b.owner === 'player') this.playerBulletsOnScreen = Math.max(0, this.playerBulletsOnScreen - 1);
        continue;
      }

      const col = Math.floor(b.x / TILE_SIZE);
      const row = Math.floor(b.y / TILE_SIZE);

      if (this.map.blocksBullet(col, row) || this.map.damageAt(b.x, b.y, b.power)) {
        b.active = false;
        if (b.owner === 'player') this.playerBulletsOnScreen = Math.max(0, this.playerBulletsOnScreen - 1);
        continue;
      }

      if (b.owner === 'player') {
        for (const e of this.enemies) {
          if (!e.alive) continue;
          if (this.rectOverlap(b.x - 2, b.y - 2, 4, e.x, e.y, TANK_SIZE)) {
            b.active = false;
            this.playerBulletsOnScreen = Math.max(0, this.playerBulletsOnScreen - 1);
            this.damageEnemy(e);
            break;
          }
        }
      } else if (this.player.alive && !this.player.invincible) {
        if (this.rectOverlap(b.x - 2, b.y - 2, 4, this.player.x, this.player.y, TANK_SIZE)) {
          b.active = false;
          this.killPlayer();
        }
      }

    }
    this.bullets = this.bullets.filter((b) => b.active);
  }

  private damageEnemy(e: EnemyState): void {
    e.hp--;
    if (e.hp <= 0) {
      e.alive = false;
      this.enemiesKilled++;
      const points = { basic: 100, fast: 200, power: 300, armor: 400 }[e.kind];
      this.registry.score += points;
      if (this.registry.score >= EXTRA_LIFE_SCORE && this.registry.score - points < EXTRA_LIFE_SCORE) {
        this.registry.lives++;
      }
      if (e.flashing) this.dropPowerUp();
    }
  }

  private killPlayer(): void {
    this.player.alive = false;
    this.registry.lives--;
    this.registry.starLevel = 0;
    if (this.registry.lives > 0) {
      this.player = { x: 4 * TILE_SIZE + 1, y: 9 * TILE_SIZE + 1, direction: 'up', alive: true, invincible: true, frozen: false };
      this.helmetTimer = 2;
    }
  }

  private dropPowerUp(): void {
    const kinds: PowerUpKind[] = ['grenade', 'helmet', 'shovel', 'star', 'tank', 'timer'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)]!;
    const pos = POWERUP_POSITIONS[Math.floor(Math.random() * POWERUP_POSITIONS.length)]!;
    this.powerUp = { kind, x: pos.col * TILE_SIZE, y: pos.row * TILE_SIZE, active: true };
  }

  private collectPowerUp(kind: PowerUpKind): void {
    this.registry.score += POWERUP_SCORE;
    switch (kind) {
      case 'grenade':
        for (const e of this.enemies) {
          if (e.alive) {
            e.alive = false;
            this.enemiesKilled++;
          }
        }
        break;
      case 'helmet':
        this.helmetTimer = 5;
        this.player.invincible = true;
        break;
      case 'shovel':
        this.map.fortifyBase();
        this.shovelActive = true;
        this.sceneTimerShovel();
        break;
      case 'star':
        this.registry.starLevel = Math.min(3, this.registry.starLevel + 1);
        break;
      case 'tank':
        this.registry.lives++;
        break;
      case 'timer':
        this.freezeTimer = 5;
        this.stageFrozen = true;
        break;
    }
  }

  private sceneTimerShovel(): void {
    // shovel reverts handled in GameScene via timer callback
  }

  private rectOverlap(ax: number, ay: number, as: number, bx: number, by: number, bs: number): boolean {
    return ax < bx + bs && ax + as > bx && ay < by + bs && ay + as > by;
  }
}
