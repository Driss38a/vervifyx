export const WEIGHTS = { price: 0.35, speed: 0.25, rating: 0.25, reliability: 0.15 } as const;
export const NEWCOMER_MIN_FINISHED = 10;
export const NEUTRAL_RATING = 4.0;
export const NEUTRAL_RELIABILITY = 0.9;
export const BALANCE_TOLERANCE = 0.1;

export interface RankInput {
  carrierId: string;
  priceMinor: number;
  etaDays: number;
  ratingAvg: number;
  finished: number;
  delivered: number;
  shipments30d: number;
}

export interface Ranked extends RankInput {
  score: number;
  rating: number;
  reliability: number;
  isNewcomer: boolean;
  rank: number;
}

const lowerIsBetter = (x: number, min: number, max: number) => (max === min ? 1 : (max - x) / (max - min));

export function rankCarriers(inputs: RankInput[]): Ranked[] {
  if (!inputs.length) return [];
  const prices = inputs.map((i) => i.priceMinor);
  const etas = inputs.map((i) => i.etaDays);
  const [minP, maxP] = [Math.min(...prices), Math.max(...prices)];
  const [minE, maxE] = [Math.min(...etas), Math.max(...etas)];

  const scored = inputs.map((i) => {
    const isNewcomer = i.finished < NEWCOMER_MIN_FINISHED;
    const rating = isNewcomer || i.ratingAvg <= 0 ? NEUTRAL_RATING : i.ratingAvg;
    const reliability = isNewcomer ? NEUTRAL_RELIABILITY : i.delivered / i.finished;
    const score = 100 * (
      WEIGHTS.price * lowerIsBetter(i.priceMinor, minP, maxP) +
      WEIGHTS.speed * lowerIsBetter(i.etaDays, minE, maxE) +
      WEIGHTS.rating * (rating / 5) +
      WEIGHTS.reliability * reliability
    );
    return { ...i, rating, reliability, isNewcomer, score: Math.round(score * 10) / 10, rank: 0 };
  });

  scored.sort((a, b) => b.score - a.score || a.priceMinor - b.priceMinor);
  scored.forEach((s, idx) => { s.rank = idx + 1; });
  return scored;
}

export function pickBalanced(ranked: Ranked[]): Ranked | undefined {
  if (!ranked.length) return undefined;
  const threshold = ranked[0].score * (1 - BALANCE_TOLERANCE);
  return ranked
    .filter((r) => r.score >= threshold)
    .sort((a, b) => a.shipments30d - b.shipments30d || b.score - a.score)[0];
}