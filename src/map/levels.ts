/** 13x13 tile grids. B=brick S=steel F=forest W=water I=ice H=base .=empty */
export const LEVELS: string[][] = [
  // Stage 1
  [
    '.............',
    '.BBB...BBB...',
    '.B.B...B.B...',
    '.BBB...BBB...',
    '.....S.S.....',
    '.S.........S.',
    '.....B.B.....',
    '.S.........S.',
    '.....S.S.....',
    '..........SS.',
    '...BBB.BBB...',
    '...B.H.BBB...',
    '...BBB.BBB...',
  ],
  // Stage 2
  [
    '.............',
    '.SSS...SSS...',
    '.S.S...S.S...',
    '.SSS...SSS...',
    '.....B.B.....',
    '.B.........B.',
    '.....SSS.....',
    '.B.........B.',
    '.....B.B.....',
    '..........BB.',
    '...BBB.BBB...',
    '...B.H.BBB...',
    '...BBB.BBB...',
  ],
  // Stage 3
  [
    '.............',
    '.BBB.BBB.BBB.',
    '.B.......B...',
    '.B.BBBB.B.B..',
    '.....B.B.....',
    '.BBBB...BBBB.',
    '.....B.B.....',
    '.BBBB...BBBB.',
    '.....B.B.....',
    '.B.......B...',
    '.BBB.BBB.BBB.',
    '...B.H.BBB...',
    '...BBB.BBB...',
  ],
  // Stage 4
  [
    '.............',
    '.SSS.SSS.SSS.',
    '.S.......S...',
    '.S.BBBB.S.B..',
    '.....S.S.....',
    '.SSSS...SSSS.',
    '.....S.S.....',
    '.SSSS...SSSS.',
    '.....S.S.....',
    '.S.......S...',
    '.SSS.SSS.SSS.',
    '...B.H.BBB...',
    '...BBB.BBB...',
  ],
  // Stage 5
  [
    '.............',
    '.FFF...FFF...',
    '.F.F...F.F...',
    '.FFF...FFF...',
    '.....B.B.....',
    '.B.........B.',
    '.....WWW.....',
    '.B.........B.',
    '.....B.B.....',
    '..........BB.',
    '...BBB.BBB...',
    '...B.H.BBB...',
    '...BBB.BBB...',
  ],
];

for (let i = LEVELS.length; i < 35; i++) {
  const n = i + 1;
  const alt = n % 2 === 0;
  LEVELS.push([
    '.............',
    alt ? '.SSS...SSS...' : '.BBB...BBB...',
    alt ? '.S.S...S.S...' : '.B.B...B.B...',
    alt ? '.SSS...SSS...' : '.BBB...BBB...',
    '.....B.B.....',
    '.B.........B.',
    alt ? '.....SSS.....' : '.....BBB.....',
    '.B.........B.',
    '.....B.B.....',
    '..........BB.',
    '...BBB.BBB...',
    '...B.H.BBB...',
    '...BBB.BBB...',
  ]);
}
