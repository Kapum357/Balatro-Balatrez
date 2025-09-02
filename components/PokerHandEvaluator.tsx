// components/PokerHandEvaluator.tsx
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Card } from '../.expo/types/card';
import { evaluateHand } from '../utils/pokerEvaluator';

const exampleHand: Card[] = [
  { suit: 'hearts', value: 10 },
  { suit: 'hearts', value: 11 },
  { suit: 'hearts', value: 12 },
  { suit: 'hearts', value: 13 },
  { suit: 'hearts', value: 14 },
];

export default function PokerHandEvaluator() {
  const [score, setScore] = useState<number | null>(null);

  const evaluateHandScore = () => {
    const handScore = evaluateHand(exampleHand);
    // Assuming evaluateHand returns an array of EvaluatedHand, and you want the score of the first hand
    setScore(handScore[0]?.score ?? null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Poker Hand Evaluator</Text>
      <Text>Hand: {exampleHand.map((card) => `${card.value} of ${card.suit}`).join(', ')}</Text>
      <Text>Score: {score !== null ? score : 'Not evaluated'}</Text>
      <Button title="Evaluate Hand" onPress={evaluateHandScore} />
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