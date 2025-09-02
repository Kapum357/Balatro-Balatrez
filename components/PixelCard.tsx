import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface PixelCardProps {
  suit: string;
  value: number;
}

export const PixelCard: React.FC<PixelCardProps> = ({ suit, value }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.suit}>{suit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  suit: {
    fontSize: 14,
    color: "#555",
  },
});