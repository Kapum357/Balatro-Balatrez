// components/HandSuggestion.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../.expo/types/card';
import { Theme } from '../constants/Theme';
import { evaluateHand } from '../utils/pokerEvaluator';

interface HandSuggestionProps {
  cards: Card[];
}

export function HandSuggestion({ cards }: HandSuggestionProps) {
  const possibleHands = evaluateHand(cards);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sugerencias</Text>
      {possibleHands.map((hand, index) => (
        <View key={index} style={styles.suggestion}>
          <Text style={styles.handType}>
            Posible {hand.type}: {hand.description}
          </Text>
          <Text style={styles.score}>
            Puntuación potencial: {hand.score}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.bg,
    borderRadius: Theme.radius.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  suggestion: {
    marginBottom: 8,
  },
  handType: {
    color: Theme.colors.accent,
  },
  score: {
    color: Theme.colors.textFaint,
  },
});