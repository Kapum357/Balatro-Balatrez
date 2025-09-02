import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function TutorialScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How to Play Balatro</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Build Your Deck</Text>
        <Text style={styles.sectionDescription}>
          Start by selecting cards to create a powerful deck. Each card has a suit and value.
        </Text>
        <Image
          source={require("../assets/images/deck.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Master Poker Hands</Text>
        <Text style={styles.sectionDescription}>
          Learn the poker hand rankings to maximize your score. For example, a Royal Flush is the highest hand.
        </Text>
        <Image
          source={require("../assets/images/poker-hands.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Scoring</Text>
        <Text style={styles.sectionDescription}>
          Earn points based on your poker hands. Bonuses are awarded for special achievements, like no discards.
        </Text>
        <Image
          source={require("../assets/images/scoring.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: "#cccccc",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
});