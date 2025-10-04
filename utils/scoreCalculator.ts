// The function 'calculateScore' is currently unused in the project. Consider removing it or integrating it where necessary.
// utils/scoreCalculator.ts
import { Card } from '@/.expo/types/card';

export function calculateScore(cards: Card[], multipliers: number[]): number {
  const baseScore = cards.reduce((score, card) => score + Number(card.value), 0);
  const multiplier = multipliers.reduce((total, mult) => total * mult, 1);
  return baseScore * multiplier;
}