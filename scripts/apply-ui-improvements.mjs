#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}
function write(rel, content) {
  fs.writeFileSync(path.join(root, rel), content);
}
function replace(rel, from, to) {
  const c = read(rel);
  if (!c.includes(from)) throw new Error(`[${rel}] pattern not found: ${from.slice(0, 60)}...`);
  write(rel, c.replace(from, to));
}
function commitPush(msg) {
  execSync('git add -A', { cwd: root, stdio: 'inherit' });
  execSync(`git commit -m "${msg}"`, { cwd: root, stdio: 'inherit' });
  execSync('git push -u origin cursor/ui-improvements-33x-ca99', { cwd: root, stdio: 'inherit' });
}

const steps = [
  {
    msg: 'ui(1): load Press Start 2P web font in index.html',
    run() {
      replace(
        'index.html',
        '<meta name="viewport"',
        '<link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />\n    <meta name="viewport"',
      );
    },
  },
  {
    msg: 'ui(2): add CRT scanline overlay on page shell',
    run() {
      replace(
        'index.html',
        'canvas {',
        `body::before {
        content: '';
        pointer-events: none;
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.12) 0px,
          rgba(0, 0, 0, 0.12) 1px,
          transparent 1px,
          transparent 3px
        );
        opacity: 0.35;
      }
      canvas {`,
      );
    },
  },
  {
    msg: 'ui(3): strengthen arcade cabinet canvas glow',
    run() {
      replace(
        'index.html',
        'box-shadow: 0 0 60px rgba(0, 0, 0, 0.8), 0 0 4px rgba(238, 184, 80, 0.15);',
        'box-shadow: 0 0 80px rgba(0, 0, 0, 0.9), 0 0 12px rgba(238, 184, 80, 0.25), inset 0 0 0 2px rgba(255, 255, 255, 0.06);',
      );
    },
  },
  {
    msg: 'ui(4): add shared UI palette tokens in constants',
    run() {
      replace(
        'src/config/constants.ts',
        '  hudStar: 0xffd040,\n\n  titleBrick:',
        `  hudStar: 0xffd040,
  uiAccent: 0xeeb850,
  uiMuted: 0x888888,
  pauseOverlay: 0x000000,
  pauseDim: 0.75,

  titleBrick:`,
      );
    },
  },
  {
    msg: 'ui(5): add sidebar chrome border on HUD',
    run() {
      replace(
        'src/ui/HUD.ts',
        '  private flagBody!: Phaser.GameObjects.Graphics;\n\n  constructor',
        '  private flagBody!: Phaser.GameObjects.Graphics;\n  private sidebarBorder!: Phaser.GameObjects.Graphics;\n\n  constructor',
      );
      replace(
        'src/ui/HUD.ts',
        '      .setDepth(21);\n\n    // High score',
        `      .setDepth(21);

    this.sidebarBorder = scene.add.graphics().setDepth(22);
    this.sidebarBorder.lineStyle(1, 0xffffff, 0.35);
    this.sidebarBorder.strokeRect(sx, PLAYFIELD_OFFSET_Y, SIDEBAR_WIDTH - 8, PLAYFIELD_SIZE);
    this.sidebarBorder.lineStyle(1, 0x3a3a3a, 1);
    this.sidebarBorder.strokeRect(sx + 1, PLAYFIELD_OFFSET_Y + 1, SIDEBAR_WIDTH - 10, PLAYFIELD_SIZE - 2);

    // High score`,
      );
      replace('src/ui/HUD.ts', '    this.flagBody.destroy();', '    this.sidebarBorder.destroy();\n    this.flagBody.destroy();');
    },
  },
  {
    msg: 'ui(6): add HUD divider between enemy grid and lives',
    run() {
      replace(
        'src/ui/HUD.ts',
        '    // Lives label\n    const livesY = iconStartY + 10 * 10 + 8;',
        `    const dividerY = iconStartY + 10 * 10 + 4;
    scene.add
      .rectangle(sx + 4, dividerY, SIDEBAR_WIDTH - 16, 1, 0x5a5a5a)
      .setOrigin(0)
      .setDepth(22);

    // Lives label
    const livesY = iconStartY + 10 * 10 + 8;`,
      );
    },
  },
  {
    msg: 'ui(7): use palette tokens for HUD score text colors',
    run() {
      replace('src/ui/HUD.ts', "import {\n  COLORS,", "import Phaser from 'phaser';\nimport {\n  COLORS,");
      replace('src/ui/HUD.ts', "import Phaser from 'phaser';\nimport Phaser from 'phaser';", "import Phaser from 'phaser';");
      replace(
        'src/ui/HUD.ts',
        "        color: '#ffffff',\n      })\n      .setOrigin(0, 1)\n      .setDepth(23);\n\n    this.scoreText",
        "        color: '#ffffff',\n        shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },\n      })\n      .setOrigin(0, 1)\n      .setDepth(23);\n\n    this.scoreText",
      );
      replace(
        'src/ui/HUD.ts',
        "        color: '#ffffff',\n      })\n      .setOrigin(1, 1)\n      .setDepth(23);",
        "        color: '#ffffff',\n        shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },\n      })\n      .setOrigin(1, 1)\n      .setDepth(23);",
      );
    },
  },
  {
    msg: 'ui(8): refine stage flag with base plate',
    run() {
      replace(
        'src/ui/HUD.ts',
        '    // pole\n    g.fillStyle(0xffffff, 1);',
        '    g.fillStyle(0x4a4a4a, 1);\n    g.fillRect(x, y + 14, 6, 2);\n    // pole\n    g.fillStyle(0xffffff, 1);',
      );
    },
  },
  {
    msg: 'ui(9): label enemy reserve section in HUD',
    run() {
      replace(
        'src/ui/HUD.ts',
        '    // Enemy reserve grid:',
        `    scene.add
      .text(sx + 6, PLAYFIELD_OFFSET_Y + 4, 'REST', {
        fontFamily: 'monospace',
        fontSize: '6px',
        color: '#cccccc',
      })
      .setDepth(23);

    // Enemy reserve grid:`,
      );
    },
  },
  {
    msg: 'ui(10): gold tint star tier display in HUD',
    run() {
      replace(
        'src/ui/HUD.ts',
        "        color: '#ffd040',\n      })\n      .setDepth(23);\n  }",
        "        color: '#ffd040',\n        shadow: { offsetX: 0, offsetY: 0, color: '#806000', blur: 2, fill: true },\n      })\n      .setDepth(23);\n  }",
      );
      replace(
        'src/ui/HUD.ts',
        "    this.starText.setText(`★${starLevel}`);",
        "    this.starText.setText(`★${starLevel}`);\n    this.starText.setColor(starLevel > 0 ? '#ffec80' : '#ffd040');",
      );
    },
  },
  {
    msg: 'ui(11): add decorative frame on main menu',
    run() {
      replace(
        'src/scenes/MainMenuScene.ts',
        '    this.drawTitle();',
        `    const frame = this.add.graphics();
    frame.lineStyle(2, COLORS.uiAccent, 0.5);
    frame.strokeRect(12, 32, GAME_WIDTH - 24, GAME_HEIGHT - 64);
    frame.lineStyle(1, 0xffffff, 0.15);
    frame.strokeRect(14, 34, GAME_WIDTH - 28, GAME_HEIGHT - 68);

    this.drawTitle();`,
      );
    },
  },
  {
    msg: 'ui(12): add drop shadow behind menu title bricks',
    run() {
      replace(
        'src/scenes/MainMenuScene.ts',
        '  private drawLetter(x: number, y: number, pattern: string[], cs: number): void {\n    const g = this.add.graphics();',
        '  private drawLetter(x: number, y: number, pattern: string[], cs: number): void {\n    const shadow = this.add.graphics();\n    shadow.fillStyle(0x000000, 0.45);\n    for (let r = 0; r < pattern.length; r++) {\n      const row = pattern[r]!;\n      for (let c = 0; c < row.length; c++) {\n        if (row[c] === \'#\') shadow.fillRect(x + c * cs + 2, y + r * cs + 2, cs, cs);\n      }\n    }\n    const g = this.add.graphics();',
      );
    },
  },
  {
    msg: 'ui(13): pulse selected menu option',
    run() {
      replace(
        'src/scenes/MainMenuScene.ts',
        "    this.labels.forEach((l, i) => l.setColor(i === this.selected ? '#eeb850' : '#ffffff'));",
        "    this.labels.forEach((l, i) => {\n      l.setColor(i === this.selected ? '#eeb850' : '#ffffff');\n      l.setScale(i === this.selected ? 1.05 : 1);\n    });",
      );
    },
  },
  {
    msg: 'ui(14): pad high score on main menu',
    run() {
      replace(
        'src/scenes/MainMenuScene.ts',
        '    this.add.text(GAME_WIDTH - 20, 12, `HI- ${data.highScore}`, {',
        '    this.add.text(GAME_WIDTH - 20, 12, `HI- ${String(data.highScore).padStart(6, \'0\')}`, {',
      );
    },
  },
  {
    msg: 'ui(15): add version badge on main menu',
    run() {
      replace(
        'src/scenes/MainMenuScene.ts',
        '    this.drawTitle();',
        `    this.add.text(GAME_WIDTH - 14, 22, 'v1.0', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#666666',
    }).setOrigin(1, 0);

    this.drawTitle();`,
      );
    },
  },
  {
    msg: 'ui(16): add vignette panels on game over screen',
    run() {
      replace(
        'src/scenes/GameOverScene.ts',
        'import { GAME_HEIGHT, GAME_WIDTH } from \'../config/constants\';',
        "import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';",
      );
      replace(
        'src/scenes/GameOverScene.ts',
        '    this.cameras.main.fadeIn(300);\n\n    // GAME OVER',
        `    this.cameras.main.fadeIn(300);

    this.add.rectangle(0, 0, GAME_WIDTH, 28, COLORS.background, 0.9).setOrigin(0);
    this.add.rectangle(0, GAME_HEIGHT - 28, GAME_WIDTH, 28, COLORS.background, 0.9).setOrigin(0);

    // GAME OVER`,
      );
    },
  },
  {
    msg: 'ui(17): add shadow layer behind game over title',
    run() {
      replace(
        'src/scenes/GameOverScene.ts',
        '    // GAME OVER rises',
        `    this.add.text(GAME_WIDTH / 2 + 2, GAME_HEIGHT + 42, 'GAME\\nOVER', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#000000',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // GAME OVER rises`,
      );
    },
  },
  {
    msg: 'ui(18): show performance rank on game over',
    run() {
      replace(
        'src/scenes/GameOverScene.ts',
        '    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, `SCORE',
        `    const rank = gd.score >= 100000 ? 'ACE' : gd.score >= 50000 ? 'VETERAN' : gd.score >= 20000 ? 'SOLDIER' : 'RECRUIT';
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 28, rank, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#eeb850',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, \`SCORE`,
      );
    },
  },
  {
    msg: 'ui(19): improve game over continue hint',
    run() {
      replace(
        'src/scenes/GameOverScene.ts',
        "      fontSize: '9px',\n      color: '#eeb850',\n    }).setOrigin(0.5);\n    this.tweens.add({ targets: hint",
        "      fontSize: '10px',\n      color: '#eeb850',\n      backgroundColor: '#1a1a1a',\n      padding: { x: 6, y: 3 },\n    }).setOrigin(0.5);\n    this.tweens.add({ targets: hint",
      );
    },
  },
  {
    msg: 'ui(20): animate stage clear headline',
    run() {
      replace(
        'src/scenes/StageClearScene.ts',
        "    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 12, 'CLEAR', {",
        "    const clearTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 12, 'CLEAR', {",
      );
      replace(
        'src/scenes/StageClearScene.ts',
        "      fontStyle: 'bold',\n    }).setOrigin(0.5);\n\n    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, 'TOTAL'",
        "      fontStyle: 'bold',\n    }).setOrigin(0.5).setScale(0.5);\n    this.tweens.add({ targets: clearTxt, scale: 1, duration: 500, ease: 'Back.easeOut' });\n\n    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, 'TOTAL'",
      );
    },
  },
  {
    msg: 'ui(21): enlarge stage number on clear screen',
    run() {
      replace(
        'src/scenes/StageClearScene.ts',
        "      fontSize: '12px',\n      color: '#aaaaaa',",
        "      fontSize: '14px',\n      color: '#cccccc',",
      );
    },
  },
  {
    msg: 'ui(22): add separator line on stage clear',
    run() {
      replace(
        'src/scenes/StageClearScene.ts',
        "    this.tweens.add({ targets: clearTxt, scale: 1, duration: 500, ease: 'Back.easeOut' });\n\n    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, 'TOTAL'",
        `    this.tweens.add({ targets: clearTxt, scale: 1, duration: 500, ease: 'Back.easeOut' });

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 8, 120, 1, 0x444444).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, 'TOTAL'`,
      );
    },
  },
  {
    msg: 'ui(23): use palette tokens for pause overlay dim',
    run() {
      replace(
        'src/scenes/GameScene.ts',
        '    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0);',
        '    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.pauseOverlay, COLORS.pauseDim).setOrigin(0);',
      );
    },
  },
  {
    msg: 'ui(24): frame pause overlay with accent border',
    run() {
      replace(
        'src/scenes/GameScene.ts',
        '    this.pauseOverlay.add([bg, txt, hint]);',
        `    const frame = this.add.graphics();
    frame.lineStyle(2, COLORS.uiAccent, 0.8);
    frame.strokeRect(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 - 36, 140, 72);
    this.pauseOverlay.add([bg, frame, txt, hint]);`,
      );
    },
  },
  {
    msg: 'ui(25): blink pause title while paused',
    run() {
      replace(
        'src/scenes/GameScene.ts',
        '    this.pauseOverlay.add([bg, frame, txt, hint]);',
        `    this.pauseOverlay.add([bg, frame, txt, hint]);
    this.tweens.add({ targets: txt, alpha: { from: 1, to: 0.45 }, duration: 600, yoyo: true, repeat: -1 });`,
      );
    },
  },
  {
    msg: 'ui(26): polish stage intro banner layout',
    run() {
      replace(
        'src/scenes/GameScene.ts',
        '    const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `STAGE  ${this.gameData.stage}`, {\n      fontFamily: \'monospace\',\n      fontSize: \'16px\',\n      color: \'#000000\',\n    }).setOrigin(0.5);',
        `    const label = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, 'STAGE', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#333333',
    }).setOrigin(0.5);
    const num = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 8, String(this.gameData.stage), {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const txt = this.add.container(0, 0, [label, num]);`,
      );
      replace(
        'src/scenes/GameScene.ts',
        '    this.stageIntroOverlay.add([bg, txt]);',
        '    this.stageIntroOverlay.add([bg, txt]);\n    this.tweens.add({ targets: num, scale: { from: 1.2, to: 1 }, duration: 400, ease: \'Back.easeOut\' });',
      );
    },
  },
  {
    msg: 'ui(27): add boot loading splash text',
    run() {
      replace(
        'src/scenes/BootScene.ts',
        "import Phaser from 'phaser';\nimport { generateAllSprites } from '../render/Sprites';",
        "import Phaser from 'phaser';\nimport { GAME_HEIGHT, GAME_WIDTH } from '../config/constants';\nimport { generateAllSprites } from '../render/Sprites';",
      );
      replace(
        'src/scenes/BootScene.ts',
        `  create(): void {
    generateAllSprites(this);
    this.scene.start('MainMenuScene');
  }`,
        `  create(): void {
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
  }`,
      );
    },
  },
  {
    msg: 'ui(28): add playfield inner bezel in game scene',
    run() {
      replace(
        'src/scenes/GameScene.ts',
        '    this.add.rectangle(PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y, PLAYFIELD_SIZE, PLAYFIELD_SIZE, COLORS.playfield).setOrigin(0).setDepth(0.5);',
        `    this.add.rectangle(PLAYFIELD_OFFSET_X, PLAYFIELD_OFFSET_Y, PLAYFIELD_SIZE, PLAYFIELD_SIZE, COLORS.playfield).setOrigin(0).setDepth(0.5);
    this.add.rectangle(PLAYFIELD_OFFSET_X + 1, PLAYFIELD_OFFSET_Y + 1, PLAYFIELD_SIZE - 2, PLAYFIELD_SIZE - 2, 0x1a1a1a, 0).setOrigin(0).setDepth(0.6).setStrokeStyle(1, 0x333333);`,
      );
    },
  },
  {
    msg: 'ui(29): cap upscale for crisp pixel art',
    run() {
      replace(
        'src/main.ts',
        '    autoCenter: Phaser.Scale.CENTER_BOTH,\n  },',
        '    autoCenter: Phaser.Scale.CENTER_BOTH,\n    max: { width: GAME_WIDTH * 4, height: GAME_HEIGHT * 4 },\n  },',
      );
    },
  },
  {
    msg: 'ui(30): add screen vignette on page shell',
    run() {
      replace(
        'index.html',
        'body::before {',
        `body::after {
        content: '';
        pointer-events: none;
        position: fixed;
        inset: 0;
        z-index: 9998;
        background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%);
      }
      body::before {`,
      );
    },
  },
  {
    msg: 'ui(31): brighten menu footer hint text',
    run() {
      replace(
        'src/scenes/MainMenuScene.ts',
        "      color: '#888888',\n    }).setOrigin(0.5);\n\n    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14",
        "      color: '#999999',\n    }).setOrigin(0.5);\n\n    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14",
      );
      replace(
        'src/scenes/MainMenuScene.ts',
        "      color: '#666666',\n    }).setOrigin(0.5);\n\n    this.input.keyboard",
        "      color: '#777777',\n    }).setOrigin(0.5);\n\n    this.input.keyboard",
      );
    },
  },
  {
    msg: 'ui(32): highlight HUD high score when player leads',
    run() {
      replace(
        'src/ui/HUD.ts',
        '    this.highScoreText.setText(`HI ${String(highScore).padStart(5, \'0\')}`);',
        "    this.highScoreText.setText(`HI ${String(highScore).padStart(5, '0')}`);\n    this.highScoreText.setColor(score >= highScore && score > 0 ? '#eeb850' : '#ffffff');",
      );
    },
  },
  {
    msg: 'ui(33): lengthen scene fade-in transitions',
    run() {
      replace('src/scenes/GameScene.ts', '    this.cameras.main.fadeIn(250);', '    this.cameras.main.fadeIn(400);');
      replace('src/scenes/MainMenuScene.ts', '    this.cameras.main.fadeIn(300);', '    this.cameras.main.fadeIn(450);');
      replace('src/scenes/GameOverScene.ts', '    this.cameras.main.fadeIn(300);', '    this.cameras.main.fadeIn(450);');
      replace('src/scenes/StageClearScene.ts', '    this.cameras.main.fadeIn(250);', '    this.cameras.main.fadeIn(400);');
    },
  },
];

for (let i = 0; i < steps.length; i++) {
  const step = steps[i];
  console.log(`\n=== Step ${i + 1}/33: ${step.msg} ===`);
  try {
    step.run();
    commitPush(step.msg);
  } catch (err) {
    console.error(`Failed at step ${i + 1}:`, err);
    process.exit(1);
  }
}

console.log('\nAll 33 UI improvements committed and pushed.');
