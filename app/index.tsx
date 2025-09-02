import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { PixelButton } from "../components/PixelButton";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo or Banner */}
      <Image
        source={require("../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome Message */}
      <Text style={styles.title}>Welcome to Balatro</Text>
      <Text style={styles.description}>
        A roguelike deck-building game that reimagines poker. Build your deck,
        master poker hands, and conquer challenges!
      </Text>

      {/* Navigation Buttons */}
      <PixelButton
        title="Start Game"
        onPress={() => router.push("/game")}
        type="primary"
      />
      <PixelButton
        title="Tutorial"
        onPress={() => router.push("/tutorial")}
        type="secondary"
      />

      {/* Footer */}
      <Text style={styles.footer}>© 2025 Balatro by LocalThunk</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1a1a1a",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
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
    marginBottom: 32,
  },
  footer: {
    fontSize: 12,
    color: "#666666",
    marginTop: 32,
  },
});