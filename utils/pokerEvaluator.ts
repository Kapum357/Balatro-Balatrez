// utils/pokerEvaluator.ts
import { Card } from '../.expo/types/card';
import { PokerHandType } from '../.expo/types/poker';
import { POKER_HANDS } from './pokerGuide';

interface EvaluatedHand {
  type: PokerHandType;
  description: string;
  score: number;
}

export function evaluateHand(cards: Card[]): EvaluatedHand[] {
  const possibleHands: EvaluatedHand[] = [];

  // Example logic for evaluating hands
  if (isPair(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === 'pair');
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore,
      });
    }
  }

  if (isFlush(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === 'flush');
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore,
      });
    }
  }

  if (isThreeOfAKind(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === ('three_of_a_kind' as PokerHandType));
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore,
      });
    }
  }

  if (isStraight(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === 'straight');
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore,
      });
    }
  }

  if (isFullHouse(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === ('full_house' as PokerHandType));
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore,
      });
    }
  }

  if (isFourOfAKind(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === ('four_of_a_kind' as PokerHandType));
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore,
      });
    }
  }

  return possibleHands;
}

function isPair(cards: Card[]): boolean {
  const values = cards.map((card) => card.value);
  const uniqueValues = new Set(values);
  return uniqueValues.size < values.length;
}

function isFlush(cards: Card[]): boolean {
  const suits = cards.map((card) => card.suit);
  return suits.every((suit) => suit === suits[0]);
}

function isThreeOfAKind(cards: Card[]): boolean {
  const valueCounts: { [key: string]: number } = {};
  for (const card of cards) {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  }
  return Object.values(valueCounts).some(count => count === 3);
}
function isStraight(cards: Card[]): boolean {
  const values = cards
    .map(card => typeof card.value === 'number' ? card.value : parseInt(card.value, 10))
    .sort((a, b) => a - b);

  // Handle Ace-low straight (A,2,3,4,5)
  const uniqueValues = Array.from(new Set(values));
  if (uniqueValues.length !== cards.length) return false;

  for (let i = 1; i < uniqueValues.length; i++) {
    if (uniqueValues[i] !== uniqueValues[i - 1] + 1) {
      // Check for Ace-low straight
      if (i === uniqueValues.length - 1 && uniqueValues[0] === 2 && uniqueValues[i] === 14) {
        continue;
      }
      return false;
    }
  }
  return true;
}

function isFullHouse(cards: Card[]): boolean {
  const valueCounts: { [key: string]: number } = {};
  for (const card of cards) {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  }
  const counts = Object.values(valueCounts);
  return counts.includes(3) && counts.includes(2);
}

function isFourOfAKind(cards: Card[]): boolean {
  const valueCounts: { [key: string]: number } = {};
  for (const card of cards) {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  }
  return Object.values(valueCounts).some(count => count === 4);
}

