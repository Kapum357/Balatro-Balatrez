// components/HandSuggestion.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../.expo/types/card';
import { PixelTheme } from '../constants/Theme';
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
    padding: PixelTheme.spacing.sm,
    backgroundColor: PixelTheme.colors.background,
    borderRadius: PixelTheme.borderRadius.small,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PixelTheme.colors.text,
    marginBottom: 8,
  },
  suggestion: {
    marginBottom: 8,
  },
  handType: {
    color: PixelTheme.colors.accent,
  },
  score: {
    color: PixelTheme.colors.textSecondary,
  },
});