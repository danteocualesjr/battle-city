import Phaser from 'phaser';
import { COLORS, TILE_SIZE } from '../config/constants';

const hex = (n: number) =>
  `#${n.toString(16).padStart(6, '0')}`;

function texture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): void {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  draw(ctx);
  tex.refresh();
}

function drawBrickQuadrant(ctx: CanvasRenderingContext2D, ox: number, oy: number): void {
  const size = TILE_SIZE / 2; // 8
  ctx.fillStyle = hex(COLORS.brickMortar);
  ctx.fillRect(ox, oy, size, size);
  ctx.fillStyle = hex(COLORS.brick);
  // 2 rows of bricks per quadrant, staggered
  // row 0 (y 0..3): 2 bricks (offset 0)
  ctx.fillRect(ox + 0, oy + 0, 3, 3);
  ctx.fillRect(ox + 4, oy + 0, 4, 3);
  // row 1 (y 4..7): 3 staggered bricks
  ctx.fillRect(ox + 0, oy + 4, 2, 3);
  ctx.fillRect(ox + 3, oy + 4, 4, 3);
  // top highlight
  ctx.fillStyle = hex(COLORS.brickLight);
  ctx.fillRect(ox + 0, oy + 0, 3, 1);
  ctx.fillRect(ox + 4, oy + 0, 4, 1);
  ctx.fillRect(ox + 0, oy + 4, 2, 1);
  ctx.fillRect(ox + 3, oy + 4, 4, 1);
}

export function generateAllSprites(scene: Phaser.Scene): void {
  // Brick quadrant (8x8) — used to draw partial bricks
  texture(scene, 'brick-q', 8, 8, (ctx) => {
    drawBrickQuadrant(ctx, 0, 0);
  });

  // Steel tile (16x16) — solid metallic with rivets and bevel
  texture(scene, 'steel', 16, 16, (ctx) => {
    ctx.fillStyle = hex(COLORS.steel);
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = hex(COLORS.steelLight);
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 0, 1, 16);
    ctx.fillRect(8, 0, 1, 8);
    ctx.fillRect(0, 8, 8, 1);
    ctx.fillStyle = hex(COLORS.steelDark);
    ctx.fillRect(0, 15, 16, 1);
    ctx.fillRect(15, 0, 1, 16);
    ctx.fillRect(7, 8, 1, 8);
    ctx.fillRect(8, 7, 8, 1);
    ctx.fillRect(7, 0, 1, 8);
    ctx.fillRect(0, 7, 8, 1);
  });

  // Water tile (16x16) — two-tone with wave hint
  texture(scene, 'water', 16, 16, (ctx) => {
    ctx.fillStyle = hex(COLORS.water1);
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = hex(COLORS.water2);
    ctx.fillRect(2, 4, 5, 1);
    ctx.fillRect(9, 4, 5, 1);
    ctx.fillRect(2, 12, 5, 1);
    ctx.fillRect(9, 12, 5, 1);
    ctx.fillRect(0, 8, 4, 1);
    ctx.fillRect(6, 8, 4, 1);
    ctx.fillRect(12, 8, 4, 1);
  });

  // Forest tile (16x16) — leafy texture
  texture(scene, 'forest', 16, 16, (ctx) => {
    ctx.fillStyle = hex(COLORS.forest);
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = hex(COLORS.forestLight);
    const dots = [[2, 2], [6, 1], [11, 3], [14, 6], [3, 7], [8, 5], [13, 10], [5, 11], [10, 12], [2, 14], [7, 14], [12, 14]];
    for (const [x, y] of dots) ctx.fillRect(x, y, 2, 2);
  });

  // Ice tile (16x16)
  texture(scene, 'ice', 16, 16, (ctx) => {
    ctx.fillStyle = hex(COLORS.ice);
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#c0d8e8';
    ctx.fillRect(2, 2, 4, 1);
    ctx.fillRect(10, 4, 4, 1);
    ctx.fillRect(4, 9, 6, 1);
    ctx.fillRect(11, 11, 3, 1);
    ctx.fillRect(2, 13, 4, 1);
  });

  // Eagle base (16x16)
  texture(scene, 'base', 16, 16, (ctx) => {
    ctx.fillStyle = hex(COLORS.baseGray);
    ctx.fillRect(1, 14, 14, 2);
    ctx.fillStyle = hex(COLORS.baseEagle);
    // simple eagle silhouette
    ctx.fillRect(7, 2, 2, 2); // head
    ctx.fillRect(6, 4, 4, 2); // neck
    ctx.fillRect(4, 6, 8, 2); // upper body
    ctx.fillRect(3, 8, 10, 3); // wings
    ctx.fillRect(5, 11, 6, 2); // lower body
    ctx.fillRect(6, 13, 4, 1); // tail
    ctx.fillStyle = hex(COLORS.baseEagleDark);
    ctx.fillRect(7, 3, 2, 1); // beak shadow
    ctx.fillRect(7, 7, 2, 1);
    ctx.fillRect(7, 10, 2, 1);
  });

  // Base destroyed (broken eagle)
  texture(scene, 'base-destroyed', 16, 16, (ctx) => {
    ctx.fillStyle = '#3a2828';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#c04020';
    ctx.fillRect(3, 3, 2, 2);
    ctx.fillRect(11, 5, 2, 2);
    ctx.fillRect(6, 9, 3, 2);
    ctx.fillRect(2, 12, 2, 2);
    ctx.fillRect(12, 12, 2, 2);
  });

  // Tank sprites: 16x16, 4 directions per color
  const tanks: Array<[string, number, number, number]> = [
    ['p1', COLORS.player1Body, COLORS.player1Light, COLORS.player1Dark],
    ['p2', COLORS.player2Body, COLORS.player2Light, COLORS.player2Dark],
    ['e-basic', COLORS.enemyBasic, 0xffffff, COLORS.enemyBasicDark],
    ['e-fast', COLORS.enemyFast, 0xe0f0f8, COLORS.enemyFastDark],
    ['e-power', COLORS.enemyPower, 0xffc060, COLORS.enemyPowerDark],
    ['e-armor', COLORS.enemyArmor, 0xa0e090, COLORS.enemyArmorDark],
    ['e-armor-3', 0x6a8060, 0x90b080, 0x304018],
    ['e-armor-2', 0x808080, 0xa0a0a0, 0x404040],
    ['e-armor-1', 0xc0c0c0, 0xe0e0e0, 0x606060],
  ];

  for (const [key, body, light, dark] of tanks) {
    for (const dir of ['up', 'down', 'left', 'right'] as const) {
      texture(scene, `tank-${key}-${dir}`, 16, 16, (ctx) => drawTank(ctx, body, light, dark, dir));
    }
  }

  // Tank icon (small) for HUD
  texture(scene, 'enemy-icon', 8, 8, (ctx) => {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 1, 2, 6);
    ctx.fillRect(6, 1, 2, 6);
    ctx.fillRect(1, 2, 6, 4);
    ctx.fillRect(3, 0, 2, 2);
  });

  // Player life icon (small)
  texture(scene, 'life-icon', 10, 10, (ctx) => {
    ctx.fillStyle = hex(COLORS.player1Dark);
    ctx.fillRect(0, 2, 2, 6);
    ctx.fillRect(8, 2, 2, 6);
    ctx.fillStyle = hex(COLORS.player1Body);
    ctx.fillRect(2, 3, 6, 4);
    ctx.fillStyle = hex(COLORS.player1Light);
    ctx.fillRect(4, 1, 2, 4);
  });

  // Bullets
  texture(scene, 'bullet-up', 4, 6, (ctx) => {
    ctx.fillStyle = hex(COLORS.bullet);
    ctx.fillRect(1, 0, 2, 6);
    ctx.fillRect(0, 1, 4, 4);
  });
  texture(scene, 'bullet-down', 4, 6, (ctx) => {
    ctx.fillStyle = hex(COLORS.bullet);
    ctx.fillRect(1, 0, 2, 6);
    ctx.fillRect(0, 1, 4, 4);
  });
  texture(scene, 'bullet-h', 6, 4, (ctx) => {
    ctx.fillStyle = hex(COLORS.bullet);
    ctx.fillRect(0, 1, 6, 2);
    ctx.fillRect(1, 0, 4, 4);
  });

  // Power-ups (16x16)
  const powerSpec: Array<[string, (ctx: CanvasRenderingContext2D) => void]> = [
    ['pu-bg', (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#000000';
      ctx.fillRect(1, 1, 14, 14);
    }],
    ['pu-grenade', (ctx) => {
      ctx.fillStyle = '#404040';
      ctx.fillRect(5, 4, 6, 8);
      ctx.fillRect(4, 6, 8, 4);
      ctx.fillStyle = '#a00000';
      ctx.fillRect(7, 2, 2, 3);
    }],
    ['pu-helmet', (ctx) => {
      ctx.fillStyle = '#a8a8a8';
      ctx.fillRect(3, 6, 10, 5);
      ctx.fillRect(4, 4, 8, 3);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(4, 4, 8, 1);
    }],
    ['pu-shovel', (ctx) => {
      ctx.fillStyle = '#a8a8a8';
      ctx.fillRect(4, 9, 8, 3);
      ctx.fillStyle = '#a05010';
      ctx.fillRect(7, 3, 2, 7);
    }],
    ['pu-star', (ctx) => {
      ctx.fillStyle = hex(COLORS.hudStar);
      ctx.fillRect(7, 2, 2, 12);
      ctx.fillRect(2, 7, 12, 2);
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillRect(3, 3, 10, 1);
      ctx.fillRect(3, 12, 10, 1);
    }],
    ['pu-tank', (ctx) => {
      ctx.fillStyle = hex(COLORS.player1Body);
      ctx.fillRect(2, 5, 12, 7);
      ctx.fillRect(6, 3, 4, 4);
      ctx.fillStyle = hex(COLORS.player1Dark);
      ctx.fillRect(7, 1, 2, 4);
    }],
    ['pu-timer', (ctx) => {
      ctx.fillStyle = '#a8a8a8';
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillStyle = '#000000';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 5, 2, 4);
      ctx.fillRect(7, 7, 4, 2);
    }],
  ];
  for (const [key, fn] of powerSpec) texture(scene, key, 16, 16, fn);

  // Generic particle
  texture(scene, 'particle', 3, 3, (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 3, 3);
  });

  // Brick tile (full)
  texture(scene, 'brick-full', 16, 16, (ctx) => {
    drawBrickQuadrant(ctx, 0, 0);
    drawBrickQuadrant(ctx, 8, 0);
    drawBrickQuadrant(ctx, 0, 8);
    drawBrickQuadrant(ctx, 8, 8);
  });

  // Spawn indicator (rotating star)
  for (let f = 0; f < 4; f++) {
    texture(scene, `spawn-${f}`, 16, 16, (ctx) => {
      ctx.fillStyle = '#ffffff';
      // simple pinwheel
      const cx = 8, cy = 8;
      const r = 6 - f;
      ctx.fillRect(cx - 1, cy - r, 2, r * 2);
      ctx.fillRect(cx - r, cy - 1, r * 2, 2);
      if (f % 2 === 0) {
        ctx.fillRect(cx - r + 2, cy - r + 2, 2, 2);
        ctx.fillRect(cx + r - 4, cy + r - 4, 2, 2);
        ctx.fillRect(cx + r - 4, cy - r + 2, 2, 2);
        ctx.fillRect(cx - r + 2, cy + r - 4, 2, 2);
      }
    });
  }
}

function drawTank(
  ctx: CanvasRenderingContext2D,
  body: number,
  light: number,
  dark: number,
  dir: 'up' | 'down' | 'left' | 'right',
): void {
  const B = hex(body);
  const L = hex(light);
  const D = hex(dark);
  // base 16x16, treads on either side, body center, turret + barrel
  // We'll draw "up" then rotate via separate textures (easier to author each direction)

  if (dir === 'up') {
    // Treads
    ctx.fillStyle = D;
    ctx.fillRect(0, 1, 3, 14);
    ctx.fillRect(13, 1, 3, 14);
    ctx.fillStyle = '#000';
    for (let y = 2; y < 14; y += 2) {
      ctx.fillRect(0, y, 3, 1);
      ctx.fillRect(13, y, 3, 1);
    }
    // Body
    ctx.fillStyle = B;
    ctx.fillRect(3, 3, 10, 10);
    ctx.fillStyle = L;
    ctx.fillRect(3, 3, 10, 1);
    ctx.fillRect(3, 3, 1, 10);
    ctx.fillStyle = D;
    ctx.fillRect(3, 12, 10, 1);
    ctx.fillRect(12, 3, 1, 10);
    // Turret
    ctx.fillStyle = D;
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillStyle = B;
    ctx.fillRect(6, 6, 4, 1);
    ctx.fillRect(6, 6, 1, 4);
    // Barrel
    ctx.fillStyle = D;
    ctx.fillRect(7, 0, 2, 7);
    ctx.fillStyle = '#000';
    ctx.fillRect(7, 0, 2, 1);
  } else if (dir === 'down') {
    ctx.fillStyle = D;
    ctx.fillRect(0, 1, 3, 14);
    ctx.fillRect(13, 1, 3, 14);
    ctx.fillStyle = '#000';
    for (let y = 2; y < 14; y += 2) {
      ctx.fillRect(0, y, 3, 1);
      ctx.fillRect(13, y, 3, 1);
    }
    ctx.fillStyle = B;
    ctx.fillRect(3, 3, 10, 10);
    ctx.fillStyle = L;
    ctx.fillRect(3, 3, 10, 1);
    ctx.fillRect(3, 3, 1, 10);
    ctx.fillStyle = D;
    ctx.fillRect(3, 12, 10, 1);
    ctx.fillRect(12, 3, 1, 10);
    ctx.fillStyle = D;
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillStyle = B;
    ctx.fillRect(6, 6, 4, 1);
    ctx.fillRect(6, 6, 1, 4);
    ctx.fillStyle = D;
    ctx.fillRect(7, 9, 2, 7);
    ctx.fillStyle = '#000';
    ctx.fillRect(7, 15, 2, 1);
  } else if (dir === 'left') {
    ctx.fillStyle = D;
    ctx.fillRect(1, 0, 14, 3);
    ctx.fillRect(1, 13, 14, 3);
    ctx.fillStyle = '#000';
    for (let x = 2; x < 14; x += 2) {
      ctx.fillRect(x, 0, 1, 3);
      ctx.fillRect(x, 13, 1, 3);
    }
    ctx.fillStyle = B;
    ctx.fillRect(3, 3, 10, 10);
    ctx.fillStyle = L;
    ctx.fillRect(3, 3, 10, 1);
    ctx.fillRect(3, 3, 1, 10);
    ctx.fillStyle = D;
    ctx.fillRect(3, 12, 10, 1);
    ctx.fillRect(12, 3, 1, 10);
    ctx.fillStyle = D;
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillStyle = B;
    ctx.fillRect(6, 6, 4, 1);
    ctx.fillRect(6, 6, 1, 4);
    ctx.fillStyle = D;
    ctx.fillRect(0, 7, 7, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 7, 1, 2);
  } else {
    ctx.fillStyle = D;
    ctx.fillRect(1, 0, 14, 3);
    ctx.fillRect(1, 13, 14, 3);
    ctx.fillStyle = '#000';
    for (let x = 2; x < 14; x += 2) {
      ctx.fillRect(x, 0, 1, 3);
      ctx.fillRect(x, 13, 1, 3);
    }
    ctx.fillStyle = B;
    ctx.fillRect(3, 3, 10, 10);
    ctx.fillStyle = L;
    ctx.fillRect(3, 3, 10, 1);
    ctx.fillRect(3, 3, 1, 10);
    ctx.fillStyle = D;
    ctx.fillRect(3, 12, 10, 1);
    ctx.fillRect(12, 3, 1, 10);
    ctx.fillStyle = D;
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillStyle = B;
    ctx.fillRect(6, 6, 4, 1);
    ctx.fillRect(6, 6, 1, 4);
    ctx.fillStyle = D;
    ctx.fillRect(9, 7, 7, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(15, 7, 1, 2);
  }
}
