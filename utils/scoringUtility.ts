import { Card } from '@/.expo/types/card';
import { evaluateHand } from './pokerEvaluator';

interface ScoringOptions {
  discards: number; // Number of cards discarded
}

export function calculateHandScore(playerHand: Card[], options: ScoringOptions): number {
  // Evaluate the player's hand
  const evaluatedHands = evaluateHand(playerHand);

  // Ensure evaluatedHands is an array
  const handsArray = Array.isArray(evaluatedHands) ? evaluatedHands : [evaluatedHands];

  // Find the highest-scoring hand
  const bestHand = handsArray.reduce((best, current) =>
    current.score > best.score ? current : best,
  );

  let score = bestHand.score; // Base score from the best hand
  console.log(`Best hand: ${bestHand.type}, Base score: ${score}`);

  // Apply bonuses
  if (options.discards === 0) {
    score += 50; // Bonificación por no descartar
  }

  // Apply penalties
  if (options.discards > 3) {
    score -= 20; // Penalización por descartar demasiado
  }

  console.log(`Final score: ${score}`);
  return score;
}

