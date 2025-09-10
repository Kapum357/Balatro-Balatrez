// components/HandGuide.tsx
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Theme } from '../constants/Theme';
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
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Theme.colors.text,
  },
  handContainer: {
    backgroundColor: Theme.colors.cardFace, // Replaced 'card' with 'cardFace'
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.radius.sm, // Replaced 'borderRadius.small' with 'radius.sm'
  },
  handName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.accent,
  },
  description: {
    color: Theme.colors.text,
    marginVertical: 4,
  },
  example: {
    color: Theme.colors.textFaint, // Replaced 'textSecondary' with 'textFaint'
    fontFamily: 'monospace',
  },
  score: {
    color: Theme.colors.text,
    marginTop: 4,
  },
});