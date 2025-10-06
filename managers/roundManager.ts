import {Card} from '@/.expo/types/card';
import {GameRound, RoundType} from '@/.expo/types/game';
import {calculateHandScore, ScoreBreakdown} from '@/utils/scoringUtility';
import {
    MAX_ANTE,
    BLIND_TYPES,
    BLIND_MULTIPLIERS,
    BASE_TARGET_CHIPS,
    ANTE_TARGET_MULTIPLIER,
    ENDLESS_OVERFLOW_CAP
} from '@/constants/GameConstants';

type BlindType = typeof BLIND_TYPES[number];

export class RoundManager {
    private currentRound: GameRound | null = null;
    private roundScore: number = 0; // Store the score for the current round
    private totalScore: number = 0; // Cumulative score across rounds
    private lastBreakdown: ScoreBreakdown | null = null;

    ante: number = 1;
    blindIndex: number = 0; // 0: Small, 1: Big, 2: Boss
    endless: boolean = false;
    overflowed: boolean = false;
    win: boolean = false;
    lose: boolean = false;

    startRound(type: RoundType, targetChips: number, restrictions?: GameRound['restrictions']) {
        this.currentRound = {
            type,
            targetChips,
            restrictions,
        };
        this.roundScore = 0; // Reset score at the start of a new round
        console.log(`Round started: ${type}`);
    }

    calculateScore(playerHand: Card[], actions: { discards: number }): number {
        if (!this.currentRound) {
            throw new Error("No active round to calculate score for.");
        }

        // Use new scoring utility and store breakdown
        const breakdown = calculateHandScore(playerHand, {
            discards: actions.discards,
            roundType: this.currentRound.type as any,
        });
        this.lastBreakdown = breakdown;
        this.roundScore += breakdown.total;
        console.log(`Total round score: ${this.roundScore}`);
        return this.roundScore;
    }

    getLastBreakdown(): ScoreBreakdown | null {
        return this.lastBreakdown;
    }

    endRound() {
        console.log(`Round ended: ${this.currentRound?.type}, Final score: ${this.roundScore}`);
        this.totalScore += this.roundScore; // Add round score to total score
        console.log(`Cumulative score: ${this.totalScore}`);
        this.currentRound = null;
        this.roundScore = 0; // Reset score after the round ends
    }

    getTotalScore(): number {
        return this.totalScore;
    }

    getCurrentBlind(): BlindType {
        return BLIND_TYPES[this.blindIndex];
    }

    getTargetChips(): number {
        let target = BASE_TARGET_CHIPS *
            Math.pow(ANTE_TARGET_MULTIPLIER, this.ante - 1) *
            BLIND_MULTIPLIERS[this.getCurrentBlind()];
        if (target > ENDLESS_OVERFLOW_CAP || !Number.isFinite(target)) {
            this.overflowed = true;
            return Infinity;
        }
        return Math.floor(target);
    }

    advanceBlind() {
        if (this.blindIndex < BLIND_TYPES.length - 1) {
            this.blindIndex++;
        } else {
            this.advanceAnte();
        }
    }

    advanceAnte() {
        if (this.ante < MAX_ANTE) {
            this.ante++;
            this.blindIndex = 0;
        } else {
            this.win = true;
            this.endless = true;
            this.ante++;
            this.blindIndex = 0;
        }
    }

    checkEndConditions(currentScore: number, handsLeft: number) {
        if (this.overflowed) return 'overflow';
        if (this.win) return 'win';
        if (handsLeft <= 0 && currentScore < this.getTargetChips()) {
            this.lose = true;
            return 'lose';
        }
        return null;
    }
}
