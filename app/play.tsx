// app/play.tsx
import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useGameFlow } from "../hooks/useGameFlow";
import { Card } from "@/.expo/types/card";

export default function PlayScreen() {
  const {
    playerHand,
    score,
    totalScore,
    target,
    ante,
    blind,
    handsRemaining,
    cash,
    inShop,
    isWin,
    isGameOver,
    isOverflow,
    startNewGame,
    discardCards,
    calculateCurrentScore,
    endCurrentRound,
    resetGame,
    proceedFromShop,
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
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold' }}>Ante: {ante} | Blind: {blind.toUpperCase()} | Objetivo: {target}</Text>
            <Text>Manos restantes: {handsRemaining} | Cash: {cash}</Text>
            {isWin && <Text style={{ color: 'green', fontWeight: 'bold' }}>¡Has completado el Ante {ante - 1}! (Modo infinito activo)</Text>}
            {isOverflow && <Text style={{ color: 'orange', fontWeight: 'bold' }}>Objetivo fuera de rango: progresión detenida</Text>}
            {isGameOver && <Text style={{ color: 'red', fontWeight: 'bold' }}>Fin de la partida</Text>}
          </View>
          {inShop ? (
            <View style={{ alignItems: 'center', marginVertical: 16 }}>
              <Text style={{ fontSize: 18, marginBottom: 8 }}>Shop interludio (placeholder)</Text>
              <Button title="Continuar" onPress={proceedFromShop} />
            </View>
          ) : (
            <>
              <Text style={{ marginBottom: 8 }}>Mano Actual:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {playerHand.map((card: Card, index: number) => (
                  <Text
                    key={index}
                    style={{
                      color: selectedCards.includes(card) ? "red" : "black",
                      textDecorationLine: selectedCards.includes(card) ? "line-through" : "none",
                      marginRight: 8,
                      marginBottom: 4,
                    }}
                    onPress={() => !isGameOver && !isOverflow && !inShop && toggleCardSelection(card)}
                  >
                    {`${card.value} de ${card.suit}`}
                  </Text>
                ))}
              </View>
              <Button title="Descartar Cartas Seleccionadas" onPress={handleDiscard} disabled={isGameOver || isOverflow || inShop} />
              <Button title="Calcular Puntuación" onPress={calculateCurrentScore} disabled={isGameOver || isOverflow || inShop} />
              <Text style={{ marginVertical: 8 }}>Puntuación de la Ronda: {score}</Text>
              <Button title="Finalizar Ronda" onPress={endCurrentRound} disabled={isGameOver || isOverflow || inShop} />
              <Text style={{ marginVertical: 8 }}>Puntuación Total: {totalScore}</Text>
              <Button title="Reiniciar Juego" onPress={resetGame} />
            </>
          )}
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
