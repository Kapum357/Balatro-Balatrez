import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* Logo or Banner */}
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Welcome Message */}
        <PixelText size="xxlarge" style={styles.title}>Welcome to Balatro</PixelText>
        <PixelText size="regular" style={styles.description}>
          A roguelike deck-building game that reimagines poker. Build your deck,
          master poker hands, and conquer challenges!
        </PixelText>

        {/* Navigation Buttons */}
        <PixelButton
          title="Ir al Juego"
          onPress={() => router.push('/game')}
          type="primary"
        />
        <PixelButton
          title="Ir al Tutorial"
          onPress={() => router.push('/tutorial')}
          type="secondary"
        />
        <PixelButton
          title="Ir al Login"
          onPress={() => router.push('/login')}
          type="secondary"
        />

        {/* Footer */}
        <PixelText size="small" style={styles.footer}>© 2025 Balatro by LocalThunk</PixelText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    opacity: 0.7,
  },
});