import { Card } from '@/.expo/types/card';
import { GameRound, RoundType } from '@/.expo/types/game';
import { calculateHandScore } from '@/utils/scoringUtility';

export class RoundManager {
    private currentRound: GameRound | null = null;
    private roundScore: number = 0; // Store the score for the current round
    private totalScore: number = 0; // Cumulative score across rounds

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

        // Cálculo lineal y predecible
        let score = calculateHandScore(playerHand, {
            discards: actions.discards
        });
        
        // Bonificaciones estáticas
        if (actions.discards === 0) {
            score += 50;
        }

        // Apply penalties
        if (actions.discards > 3) {
            score -= 20; // Penalty for excessive discards
            console.log("Penalty: Too many discards (-20)");
        }

        // Apply multipliers based on round type
        if (this.currentRound.type === 'hard') {
            score *= 1.5; // 1.5x multiplier for hard rounds
            console.log("Multiplier: Hard round (x1.5)");
        }

        this.roundScore += score; // Add to the round's score
        console.log(`Total round score: ${this.roundScore}`);
        return this.roundScore;
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
}
