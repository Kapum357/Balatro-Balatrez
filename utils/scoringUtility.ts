import { Card } from '../.expo/types/card';
import { evaluateHand } from './pokerEvaluator';

interface ScoringOptions {
  discards: number; // Number of cards discarded
  roundType?: 'normal' | 'hard'; // Type of round (optional)
}

export function calculateHandScore(playerHand: Card[], options: ScoringOptions): number {
  // Evaluate the player's hand
  const evaluatedHands = evaluateHand(playerHand);

  // Find the highest-scoring hand
  const bestHand = evaluatedHands.reduce((best, current) =>
    current.score > best.score ? current : best,
  );

  let score = bestHand.score; // Base score from the best hand
  console.log(`Best hand: ${bestHand.type}, Base score: ${score}`);

  // Apply bonuses
  if (options.discards === 0) {
    score += 50; // Bonus for no discards
    console.log("Bonus: No discards (+50)");
  }

  // Apply penalties
  if (options.discards > 3) {
    score -= 20; // Penalty for excessive discards
    console.log("Penalty: Too many discards (-20)");
  }

  // Apply multipliers based on round type
  if (options.roundType === 'hard') {
    score *= 1.5; // 1.5x multiplier for hard rounds
    console.log("Multiplier: Hard round (x1.5)");
  }

  console.log(`Final score: ${score}`);
  return score;
}