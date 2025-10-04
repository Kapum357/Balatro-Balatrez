// app/play.tsx
import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useGameFlow } from "@/hooks/useGameFlow";
import { Card } from "@/.expo/types/card";

export default function PlayScreen() {
  const {
    playerHand,
    score,
    totalScore,
    startNewGame,
    discardCards,
    calculateCurrentScore,
    endCurrentRound,
    resetGame,
  } = useGameFlow();

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const toggleCardSelection = (card: Card) => {
    setSelectedCards((prev) => {
      if (prev.includes(card)) {
        return prev.filter((c) => c !== card);
      } else {
        return [...prev, card];
      }
    });
  };

  const handleDiscard = () => {
    if (selectedCards.length > 0) {
      discardCards(selectedCards);
      setSelectedCards([]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Balatro - Juego</Text>
      {playerHand.length === 0 ? (
        <Button title="Iniciar Nueva Partida" onPress={startNewGame} />
      ) : (
        <>
          <Text>Mano Actual:</Text>
          {playerHand.map((card, index) => (
            <Text
              key={index}
              style={{
                color: selectedCards.includes(card) ? "red" : "black",
                textDecorationLine: selectedCards.includes(card) ? "line-through" : "none",
              }}
              onPress={() => toggleCardSelection(card)}
            >
              {`${card.value} de ${card.suit}`}
            </Text>
          ))}
          <Button title="Descartar Cartas Seleccionadas" onPress={handleDiscard} />
          <Button title="Calcular Puntuación" onPress={calculateCurrentScore} />
          <Text>Puntuación de la Ronda: {score}</Text>
          <Button title="Finalizar Ronda" onPress={endCurrentRound} />
          <Text>Puntuación Total: {totalScore}</Text>
          <Button title="Reiniciar Juego" onPress={resetGame} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
