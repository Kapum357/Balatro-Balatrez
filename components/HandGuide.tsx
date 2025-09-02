// components/HandGuide.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PixelTheme } from '../constants/Theme';
import { POKER_HANDS } from '../utils/pokerGuide';

export function HandGuide() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Guía de Manos de Póquer</Text>
      {POKER_HANDS.map((hand) => (
        <View key={hand.type} style={styles.handContainer}>
          <Text style={styles.handName}>{hand.name}</Text>
          <Text style={styles.description}>{hand.description}</Text>
          <Text style={styles.example}>Ejemplo: {hand.example}</Text>
          <Text style={styles.score}>Puntuación Base: {hand.baseScore}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: PixelTheme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: PixelTheme.colors.text,
  },
  handContainer: {
    backgroundColor: PixelTheme.colors.card,
    padding: PixelTheme.spacing.md,
    marginBottom: PixelTheme.spacing.sm,
    borderRadius: PixelTheme.borderRadius.small,
  },
  handName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PixelTheme.colors.accent,
  },
  description: {
    color: PixelTheme.colors.text,
    marginVertical: 4,
  },
  example: {
    color: PixelTheme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  score: {
    color: PixelTheme.colors.text,
    marginTop: 4,
  },
});