// utils/pokerEvaluator.ts
import { Card } from '../.expo/types/card';
import { PokerHandType } from '../.expo/types/poker';
import { POKER_HANDS } from './pokerGuide';

interface EvaluatedHand {
  type: PokerHandType;
  description: string;
  score: number;
}

export function evaluateHand(hand: Card[]): EvaluatedHand[] {
  const jokers = hand.filter((card) => card.value === 'Joker');
  const nonJokers = hand.filter((card) => card.value !== 'Joker');

  // Lógica para evaluar combinaciones con Jokers
  if (jokers.length > 0) {
    return [
      {
        type: 'pair', // Use a valid PokerHandType or the most appropriate type
        description: 'Mano con Joker(s)',
        score: calculateBestScoreWithJokers(nonJokers, jokers.length),
      },
    ];
  }

  // Evaluar manos normales
  return evaluateStandardHand(nonJokers);
}

function calculateBestScoreWithJokers(cards: Card[], jokerCount: number): number {
  // Implementar lógica para calcular la mejor puntuación posible con los Jokers disponibles
  // Esto podría implicar probar diferentes combinaciones y elegir la que dé más puntos
  // Por simplicidad, este ejemplo solo devuelve una puntuación fija
  return 100 + jokerCount * 10; // Ejemplo: +10 puntos por cada Joker para la mejor combinación
}

function evaluateStandardHand(cards: Card[]): EvaluatedHand[] {
  const possibleHands: EvaluatedHand[] = [];

  if (isPair(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === 'pair');
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore + calculateJokerBonus(cards),
      });
    }
  }

  if (isFlush(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === 'flush');
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore + calculateJokerBonus(cards),
      });
    }
  }

  if (isThreeOfAKind(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === ('three_of_a_kind' as PokerHandType));
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore + calculateJokerBonus(cards),
      });
    }
  }

  if (isStraight(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === 'straight');
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore + calculateJokerBonus(cards),
      });
    }
  }

  if (isFullHouse(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === ('full_house' as PokerHandType));
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore + calculateJokerBonus(cards),
      });
    }
  }

  if (isFourOfAKind(cards)) {
    const handGuide = POKER_HANDS.find((hand) => hand.type === ('four_of_a_kind' as PokerHandType));
    if (handGuide) {
      possibleHands.push({
        type: handGuide.type,
        description: handGuide.description,
        score: handGuide.baseScore + calculateJokerBonus(cards),
      });
    }
  }

  // Si no se encontró ninguna mano, devolver una lista vacía
  return possibleHands;
}

function calculateJokerBonus(cards: Card[]): number {
  const jokers = cards.filter((card) => card.value === 'Joker');
  return jokers.length * 20; // Por ejemplo, +20 puntos por cada Joker
}

function isPair(cards: Card[]): boolean {
  const jokers = cards.filter((card) => card.value === 'Joker');
  const nonJokerValues = cards
    .filter((card) => card.value !== 'Joker')
    .map((card) => card.value);

  const uniqueValues = new Set(nonJokerValues);

  // Si hay un Joker, puede formar un par con cualquier carta
  return uniqueValues.size <= cards.length - jokers.length;
}

function isFlush(cards: Card[]): boolean {
  const suits = cards.map((card) => card.suit);

  // Si hay Jokers, ignora su palo
  return suits.filter((suit) => suit !== 'wild').every((suit) => suit === suits[0]);
}

function isThreeOfAKind(cards: Card[]): boolean {
  const valueCounts: { [key: string]: number } = {};
  const jokers = cards.filter((card) => card.value === 'Joker').length;

  for (const card of cards) {
    if (card.value !== 'Joker') {
      valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
    }
  }

  return Object.values(valueCounts).some((count) => count + jokers >= 3);
}

function isStraight(cards: Card[]): boolean {
  const values = cards
    .map((card) => (typeof card.value === 'number' ? card.value : parseInt(card.value, 10)))
    .sort((a, b) => a - b);

  const jokers = cards.filter((card) => card.value === 'Joker').length;

  // Handle Ace-low straight (A,2,3,4,5)
  const uniqueValues = Array.from(new Set(values));
  if (uniqueValues.length + jokers !== cards.length) return false;

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
  const jokers = cards.filter((card) => card.value === 'Joker').length;

  for (const card of cards) {
    if (card.value !== 'Joker') {
      valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
    }
  }

  const counts = Object.values(valueCounts);
  return counts.includes(3) && counts.includes(2 - jokers);
}

function isFourOfAKind(cards: Card[]): boolean {
  const valueCounts: { [key: string]: number } = {};
  const jokers = cards.filter((card) => card.value === 'Joker').length;

  for (const card of cards) {
    if (card.value !== 'Joker') {
      valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
    }
  }

  return Object.values(valueCounts).some((count) => count + jokers >= 4);
}