import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "../.expo/types/card";
import { PixelButton } from "../components/PixelButton";
import { PixelCard } from "../components/PixelCard";
import { PixelText } from "../components/PixelText";
import { DeckManager } from "../managers/deckManager";

const initialDeck: Card[] = [
  { suit: "hearts", value: 10 },
  { suit: "diamonds", value: 11 },
  { suit: "clubs", value: 12 },
  { suit: "spades", value: 13 },
  { suit: "hearts", value: 14 },
];

export default function GameScreen() {
  const [deckManager] = useState(new DeckManager(initialDeck));
  const [hand, setHand] = useState<Card[]>([]);

  const drawCards = () => {
    const drawn = deckManager.drawCards(5);
    setHand(drawn);
  };

  return (
    <View style={styles.container}>
      <PixelText size="xxlarge" style={styles.title}>
        Game Screen
      </PixelText>
      <PixelText size="medium" style={styles.description}>
        This is where the game will be played.
      </PixelText>
      <View style={styles.cardContainer}>
        {hand.map((card, index) => (
          <PixelCard
            key={index}
            suit={
              card.suit === "hearts"
                ? "H"
                : card.suit === "diamonds"
                ? "D"
                : card.suit === "clubs"
                ? "C"
                : "S"
            }
            value={card.value.toString()}
          />
        ))}
      </View>
      <PixelButton title="Draw Cards" onPress={drawCards} type="primary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  description: {
    color: "#cccccc",
    textAlign: "center",
    marginBottom: 32,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
});