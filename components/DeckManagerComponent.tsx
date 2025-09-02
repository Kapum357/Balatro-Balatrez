// components/DeckManagerComponent.tsx
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Card } from '../.expo/types/card';
import { DeckManager } from '../managers/deckManager';
import AnimatedCardDraw from './AnimatedCardDraw'; // Import the AnimatedCardDraw component

const initialDeck: Card[] = [
  { suit: 'hearts', value: 10 },
  { suit: 'diamonds', value: 11 },
  { suit: 'clubs', value: 12 },
  { suit: 'spades', value: 13 },
  { suit: 'hearts', value: 14 },
];

export default function DeckManagerComponent() {
  const [deckManager] = useState(new DeckManager(initialDeck));
  const [hand, setHand] = useState<Card[]>([]);

  const drawCards = () => {
    const drawn = deckManager.drawCards(2);
    setHand(drawn);
  };

  const discardHand = () => {
    deckManager.discardCards(hand);
    setHand([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deck Manager</Text>
      <Text>Hand: {hand.map((card) => `${card.value} of ${card.suit}`).join(', ')}</Text>
      <Button title="Draw Cards" onPress={drawCards} />
      <Button title="Discard Hand" onPress={discardHand} />
      <View>
        {hand.map((card, index) => (
          <AnimatedCardDraw key={index} card={`${card.value} of ${card.suit}`} />
        ))}
      </View>
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