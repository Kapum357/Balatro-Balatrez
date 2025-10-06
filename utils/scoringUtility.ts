import {Card} from '@/.expo/types/card';
import {evaluateHand} from './pokerEvaluator';

export interface ScoringOptions {
    discards: number; // Number of cards discarded
    roundType?: string;
}

export interface ScoreBreakdown {
    chips: number;
    mult: number;
    total: number;
    bestHandType: string;
}

export function calculateHandScore(playerHand: Card[], options: ScoringOptions): ScoreBreakdown {
    const evaluatedHands = evaluateHand(playerHand);
    const handsArray = Array.isArray(evaluatedHands) ? evaluatedHands : [evaluatedHands];
    const bestHand = handsArray.reduce((best, current) => current.score > best.score ? current : best);

    let chips = bestHand.score;
    let mult = 1;
    if (options.discards === 0) chips += 50;
    if (options.discards > 3) chips -= 20;
    if (options.roundType === 'hard') mult *= 1.5;
    const total = Math.max(0, Math.floor(chips * mult));
    return {chips: Math.max(0, Math.floor(chips)), mult, total, bestHandType: bestHand.type};
}

