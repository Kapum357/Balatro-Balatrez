import { Card } from '../.expo/types/card';
import { GameRound, RoundType } from '../.expo/types/game';
import { calculateHandScore } from '../utils/scoringUtility';

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

  getCurrentRound(): GameRound | null {
    return this.currentRound;
  }

  calculateScore(playerHand: Card[], actions: { discards: number }): number {
    if (!this.currentRound) {
      throw new Error("No active round to calculate score for.");
    }

    // Use the scoring utility to calculate the score
    const score = calculateHandScore(playerHand, {
      discards: actions.discards,
      roundType: this.currentRound.type,
    });

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