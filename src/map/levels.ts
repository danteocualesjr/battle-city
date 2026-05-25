/**
 * 13x13 tile grids based on classic Battle City stage layouts.
 * Legend: . empty   B brick   S steel   F forest   W water   I ice   H base (eagle)
 */
export const LEVELS: string[][] = [
  // ── Stage 1 — six brick pillars + central cross + brick fortress ──
  [
    '.............',
    '..BB.B.B.BB..',
    '..BB.B.B.BB..',
    '..BB.B.B.BB..',
    '..BB.....BB..',
    '.....BBB.....',
    '..B..B.B..B..',
    '.....BBB.....',
    '..BB.....BB..',
    '..BB.B.B.BB..',
    '..BB.BBB.BB..',
    '.....B.B.....',
    '.....BHB.....',
  ],

  // ── Stage 2 — water gates + forest cover ──
  [
    '.............',
    '.BBBB...BBBB.',
    '.B.........B.',
    '.B.BB...BB.B.',
    '....B...B....',
    'WWW.......WWW',
    '..F.B.B.F....',
    'WWW...B...WWW',
    '..F.......F..',
    '..BB.BBB.BB..',
    '..B...B...B..',
    '..B..BHB..B..',
    '.....BBB.....',
  ],

  // ── Stage 3 — steel arena ──
  [
    '..S.S.S.S.S..',
    '.............',
    '.BBB.BBB.BBB.',
    '.B.B.B.B.B.B.',
    '.BBB.BBB.BBB.',
    '.....B.B.....',
    'S.B.S...S.B.S',
    '.....B.B.....',
    '.BBB.BBB.BBB.',
    '.B.B.B.B.B.B.',
    '.BBB.BBB.BBB.',
    '.....B.B.....',
    '.....BHB.....',
  ],

  // ── Stage 4 — forest maze ──
  [
    '.FFF.....FFF.',
    '.F.F.B.B.F.F.',
    '.F.F.B.B.F.F.',
    '.FFF.....FFF.',
    '.....BBB.....',
    'BB....B....BB',
    'BB...B.B...BB',
    'BB....B....BB',
    '.....BBB.....',
    '.FFF.....FFF.',
    '.F.F.....F.F.',
    '.FFF.BHB.FFF.',
    '.....BBB.....',
  ],

  // ── Stage 5 — ice rink ──
  [
    '.IIIIIIIIIII.',
    '.IBBI.B.IBBI.',
    '.IBBI.B.IBBI.',
    '.IIII...IIII.',
    '.............',
    '..BB.BBB.BB..',
    '..B...B...B..',
    '..BB.BBB.BB..',
    '.............',
    '.IIII...IIII.',
    '.IBBI...IBBI.',
    '.IBBIBHBIBBI.',
    '.IIII.B.IIII.',
  ],

  // ── Stage 6 — water cross ──
  [
    '.............',
    '.BBBB.S.BBBB.',
    '.B........BB.',
    '.B.WWWWWWW.B.',
    '.B.W.....W.B.',
    'BB.W.BBB.W.BB',
    '...W.B.B.W...',
    'BB.W.BBB.W.BB',
    '.B.W.....W.B.',
    '.B.WWWWWWW.B.',
    '.B........BB.',
    '.BBBB.H.BBBB.',
    '.....BBB.....',
  ],

  // ── Stage 7 — diagonal bricks ──
  [
    'B...........B',
    '.B.........B.',
    '..B.SSSSS.B..',
    '...B.....B...',
    '....BB.BB....',
    '.....B.B.....',
    'SS...B.B...SS',
    '.....B.B.....',
    '....BB.BB....',
    '...B.....B...',
    '..B.BBBBB.B..',
    '.B...BHB...B.',
    'B....BBB....B',
  ],

  // ── Stage 8 — fortress ──
  [
    'BBBBBBBBBBBBB',
    'B...........B',
    'B.SSSSSSSSS.B',
    'B.S.......S.B',
    'B.S.BBBBB.S.B',
    'B.S.B...B.S.B',
    'B.S.B.B.B.S.B',
    'B.S.B...B.S.B',
    'B.S.BB.BB.S.B',
    'B.S.......S.B',
    'B.SSSSSSSSS.B',
    'B....BHB....B',
    'BBBBBB.BBBBBB',
  ],
];

// Generate stages 9-35 by varying patterns from the first 8.
const TEMPLATES: string[][] = [...LEVELS];

for (let i = LEVELS.length; i < 35; i++) {
  const base = TEMPLATES[i % TEMPLATES.length]!.map((row) => row);
  // Toggle some bricks ↔ steel to vary difficulty.
  const transformed = base.map((row, ri) => {
    if (ri < 4 && i % 3 === 0) {
      return row.replaceAll('B', 'S');
    }
    if (i % 4 === 0) {
      return row.replaceAll('F', 'B');
    }
    return row;
  });
  LEVELS.push(transformed);
}
