export declare const WEIGHTS: {
    readonly price: 0.35;
    readonly speed: 0.25;
    readonly rating: 0.25;
    readonly reliability: 0.15;
};
export declare const NEWCOMER_MIN_FINISHED = 10;
export declare const NEUTRAL_RATING = 4;
export declare const NEUTRAL_RELIABILITY = 0.9;
export declare const BALANCE_TOLERANCE = 0.1;
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
export declare function rankCarriers(inputs: RankInput[]): Ranked[];
export declare function pickBalanced(ranked: Ranked[]): Ranked | undefined;
