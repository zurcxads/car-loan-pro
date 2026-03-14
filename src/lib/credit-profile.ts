// Server-safe credit profile generation (no browser APIs)

export interface CreditPullResult {
  ficoScore: number;
  vantageScore: number;
  dtiPercent: number;
  totalMonthlyObligations: number;
  openAutoTradelines: number;
  derogatoryMarks: number;
  hasRepo: boolean;
  hasBankruptcy: boolean;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateCreditProfile(fico?: number): CreditPullResult {
  const score = fico || Math.floor(Math.random() * 160) + 620;
  const dti = randomBetween(18, 48);
  return {
    ficoScore: score,
    vantageScore: score + Math.floor(Math.random() * 20) - 10,
    dtiPercent: dti,
    totalMonthlyObligations: Math.round(randomBetween(800, 3200)),
    openAutoTradelines: Math.floor(Math.random() * 3),
    derogatoryMarks: score > 700 ? 0 : Math.floor(Math.random() * 3),
    hasRepo: score < 550 && Math.random() > 0.6,
    hasBankruptcy: score < 520 && Math.random() > 0.7,
  };
}
