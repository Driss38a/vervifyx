"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BALANCE_TOLERANCE = exports.NEUTRAL_RELIABILITY = exports.NEUTRAL_RATING = exports.NEWCOMER_MIN_FINISHED = exports.WEIGHTS = void 0;
exports.rankCarriers = rankCarriers;
exports.pickBalanced = pickBalanced;
exports.WEIGHTS = { price: 0.35, speed: 0.25, rating: 0.25, reliability: 0.15 };
exports.NEWCOMER_MIN_FINISHED = 10;
exports.NEUTRAL_RATING = 4.0;
exports.NEUTRAL_RELIABILITY = 0.9;
exports.BALANCE_TOLERANCE = 0.1;
const lowerIsBetter = (x, min, max) => (max === min ? 1 : (max - x) / (max - min));
function rankCarriers(inputs) {
    if (!inputs.length)
        return [];
    const prices = inputs.map((i) => i.priceMinor);
    const etas = inputs.map((i) => i.etaDays);
    const [minP, maxP] = [Math.min(...prices), Math.max(...prices)];
    const [minE, maxE] = [Math.min(...etas), Math.max(...etas)];
    const scored = inputs.map((i) => {
        const isNewcomer = i.finished < exports.NEWCOMER_MIN_FINISHED;
        const rating = isNewcomer || i.ratingAvg <= 0 ? exports.NEUTRAL_RATING : i.ratingAvg;
        const reliability = isNewcomer ? exports.NEUTRAL_RELIABILITY : i.delivered / i.finished;
        const score = 100 * (exports.WEIGHTS.price * lowerIsBetter(i.priceMinor, minP, maxP) +
            exports.WEIGHTS.speed * lowerIsBetter(i.etaDays, minE, maxE) +
            exports.WEIGHTS.rating * (rating / 5) +
            exports.WEIGHTS.reliability * reliability);
        return { ...i, rating, reliability, isNewcomer, score: Math.round(score * 10) / 10, rank: 0 };
    });
    scored.sort((a, b) => b.score - a.score || a.priceMinor - b.priceMinor);
    scored.forEach((s, idx) => { s.rank = idx + 1; });
    return scored;
}
function pickBalanced(ranked) {
    if (!ranked.length)
        return undefined;
    const threshold = ranked[0].score * (1 - exports.BALANCE_TOLERANCE);
    return ranked
        .filter((r) => r.score >= threshold)
        .sort((a, b) => a.shipments30d - b.shipments30d || b.score - a.score)[0];
}
//# sourceMappingURL=ranking.js.map