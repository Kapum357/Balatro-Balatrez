// This component is currently unused in the project. Consider removing it or integrating it where necessary.
// components/AnimatedCardDraw.tsx
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { PixelCard } from "./PixelCard";

interface CardProps {
  card: {
    suit: "H" | "D" | "C" | "S" | "JOKER";
    value: string;
  };
}

function AnimatedCardDraw({ card }: CardProps){
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 500 });
    opacity.value = withTiming(1, { duration: 500 });
  }, [translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <>
      <PixelCard suit="H" value="A" selected />
      <Animated.View style={[styles.card, animatedStyle]}>
        <PixelCard suit={card.suit} value={card.value} />
      </Animated.View>
    </>
  );
} const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default AnimatedCardDraw;
