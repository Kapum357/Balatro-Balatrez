import React, { useRef, useState } from "react";
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../.expo/types/card";
import { PixelButton } from "../components/PixelButton";
import { PixelCard } from "../components/PixelCard";
import { DeckManager } from "../managers/deckManager";
import { RoundManager } from "../managers/roundManager";

const initialDeck: Card[] = [
  { suit: "hearts", value: 10 },
  { suit: "diamonds", value: 11 },
  { suit: "clubs", value: 12 },
  { suit: "spades", value: 13 },
  { suit: "hearts", value: 14 },
];

export default function GameScreen() {
  const [deckManager] = useState(new DeckManager(initialDeck));
  const [roundManager] = useState(new RoundManager());
  const [hand, setHand] = useState<Card[]>([]);
  const [score, setScore] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  // Animated values for each card and score
  const animatedValues = useRef(hand.map(() => new Animated.Value(1))).current;
  const scoreAnimation = useRef(new Animated.Value(1)).current;
  const colorAnimation = useRef(new Animated.Value(0)).current; // New animated value for color

  const animateScore = () => {
    // Trigger scale animation
    Animated.sequence([
      Animated.timing(scoreAnimation, {
        toValue: 1.5, // Scale up
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scoreAnimation, {
        toValue: 1, // Scale back to normal
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger color animation
    Animated.sequence([
      Animated.timing(colorAnimation, {
        toValue: 1, // Change to highlight color
        duration: 200,
        useNativeDriver: false, // Color interpolation does not support native driver
      }),
      Animated.timing(colorAnimation, {
        toValue: 0, // Change back to normal color
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const startRound = () => {
    roundManager.startRound("normal", 100);
    setScore(0);
    setHand([]);
    setSelectedCards([]);
    console.log("Round started!");
  };

  const drawCards = () => {
    const drawn = deckManager.drawCards(5);
    setHand(drawn);

    // Reset animations for new cards
    animatedValues.forEach((value, index) => {
      Animated.timing(value, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }).start();
    });

    const newScore = roundManager.calculateScore(drawn, { discards: 0 });
    setScore(newScore);
    animateScore(); // Trigger score animation
  };

  const discardAndDraw = () => {
    if (selectedCards.length === 0) {
      console.log("No cards selected for discard.");
      return;
    }

    // Animate discarded cards
    selectedCards.forEach((index) => {
      Animated.timing(animatedValues[index], {
        toValue: 0, // Fade out
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Replace discarded cards with new ones after animation
        const newHand = [...hand];
        newHand[index] = deckManager.drawCards(1)[0];
        setHand(newHand);

        // Reset animation for the new card
        Animated.timing(animatedValues[index], {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }).start();
      });
    });

    setSelectedCards([]);

    // Calculate the score with the number of discards
    const newScore = roundManager.calculateScore(hand, { discards: selectedCards.length });
    setScore(newScore);
    animateScore(); // Trigger score animation
  };

  const toggleCardSelection = (index: number) => {
    setSelectedCards((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const endRound = () => {
    roundManager.endRound();
    const totalScore = roundManager.getTotalScore();
    setCumulativeScore(totalScore);

    // Show a score summary
    Alert.alert(
      "Round Ended",
      `Final Round Score: ${score}\nCumulative Score: ${totalScore}`,
      [{ text: "OK" }]
    );

    console.log("Round ended!");
  };

  // Interpolate color based on the colorAnimation value
  const scoreColor = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#ffcc00"], // Normal color to highlight color
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Screen</Text>
      <Text style={styles.description}>This is where the game will be played.</Text>
      <Animated.Text
        style={[
          styles.score,
          {
            transform: [{ scale: scoreAnimation }], // Scale animation for the score
            color: scoreColor, // Animated color
          },
        ]}
      >
        Current Score: {score}
      </Animated.Text>
      <Text style={styles.cumulativeScore}>Cumulative Score: {cumulativeScore}</Text>
      <View style={styles.cardContainer}>
        {hand.map((card, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => toggleCardSelection(index)}
            style={[
              styles.cardWrapper,
              selectedCards.includes(index) && styles.selectedCard,
            ]}
          >
            <Animated.View
              style={{
                opacity: animatedValues[index],
                transform: [
                  {
                    translateY: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0], // Move down when fading out
                    }),
                  },
                ],
              }}
            >
              <PixelCard suit={card.suit} value={card.value} />
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
      <PixelButton title="Start Round" onPress={startRound} type="primary" />
      <PixelButton title="Draw Cards" onPress={drawCards} type="primary" />
      <PixelButton title="Discard & Draw" onPress={discardAndDraw} type="secondary" />
      <PixelButton title="End Round" onPress={endRound} type="secondary" />
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#cccccc",
    textAlign: "center",
    marginBottom: 16,
  },
  score: {
    fontSize: 18,
    marginBottom: 8,
  },
  cumulativeScore: {
    fontSize: 18,
    color: "#ffffff",
    marginBottom: 16,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  cardWrapper: {
    margin: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#ffcc00",
    borderRadius: 4,
  },
});