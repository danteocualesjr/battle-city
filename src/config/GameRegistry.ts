export interface GameRegistryData {
  score: number;
  highScore: number;
  lives: number;
  stage: number;
  starLevel: number;
}

const HIGH_SCORE_KEY = 'battle-city-high-score';

export function loadHighScore(): number {
  const stored = localStorage.getItem(HIGH_SCORE_KEY);
  return stored ? parseInt(stored, 10) : 20_000;
}

export function saveHighScore(score: number): void {
  localStorage.setItem(HIGH_SCORE_KEY, String(score));
}

export function createDefaultRegistry(): GameRegistryData {
  return {
    score: 0,
    highScore: loadHighScore(),
    lives: 3,
    stage: 1,
    starLevel: 0,
  };
}
