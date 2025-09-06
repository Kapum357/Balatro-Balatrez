// components/PokerHandEvaluator.tsx
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Card } from '../.expo/types/card';
import { evaluateHand } from '../utils/pokerEvaluator';

interface Props {
  hand: Card[];
}

export default function PokerHandEvaluator({ hand }: Props) {
  const [score, setScore] = useState<number | null>(null);
  const evaluatedHands = evaluateHand(hand); // Devuelve un objeto
  const bestHand = evaluatedHands; // Accede directamente al objeto

  const evaluateHandScore = () => {
    const handScore = evaluateHand(hand);
    setScore(handScore?.score ?? null); // Accede a la propiedad 'score'
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Poker Hand Evaluator</Text>
      {hand.map((card, index) => (
        <Text key={index} style={{ color: card.value === 'Joker' ? 'purple' : 'black' }}>
          {card.value === 'Joker' ? '🃏 Joker' : `${card.value} de ${card.suit}`}
        </Text>
      ))}
      <Text>Mejor Mano: {bestHand?.description || 'Ninguna'}</Text>
      <Text>Puntuación: {bestHand?.score || 0}</Text>
      <Button title="Evaluate Hand" onPress={evaluateHandScore} />
      {score !== null && <Text>Evaluated Score: {score}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});