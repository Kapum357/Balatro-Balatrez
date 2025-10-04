// utils/pokerGuide.ts
import { PokerHandGuide } from '@/.expo/types/poker';

export const POKER_HANDS: PokerHandGuide[] = [
  {
    type: 'pair',
    name: 'Pareja',
    description: 'Dos cartas del mismo valor',
    baseScore: 100,
    example: '🂡 🂱 (dos ases)'
  },
  {
    type: 'two-pair',
    name: 'Doble Pareja',
    description: 'Dos pares diferentes de cartas',
    baseScore: 200,
    example: '🂡 🂱 🂢 🂲 (ases y doses)'
  },
  {
    type: 'three-of-a-kind',
    name: 'Trío',
    description: 'Tres cartas del mismo valor',
    baseScore: 300,
    example: '🂡 🂱 🃁 (tres ases)'
  },
  {
    type: 'straight',
    name: 'Escalera',
    description: 'Cinco cartas consecutivas',
    baseScore: 400,
    example: '🂡 🂢 🂣 🂤 🂥'
  },
  {
    type: 'flush',
    name: 'Color',
    description: 'Cinco cartas del mismo palo',
    baseScore: 500,
    example: '🂡 🂣 🂥 🂧 🂩'
  }
];