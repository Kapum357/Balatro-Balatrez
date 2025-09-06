import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Card } from '../.expo/types/card';
import { DeckManager } from '../managers/deckManager';
import { RoundManager } from '../managers/roundManager';

// Configuración inicial del mazo
const initialDeck: Card[] = [
    { suit: 'hearts', value: 1 },
    { suit: 'hearts', value: 2 },
    { suit: 'hearts', value: 3 },
    { suit: 'hearts', value: 4 },
    { suit: 'hearts', value: 5 },
    { suit: 'hearts', value: 6 },
    { suit: 'hearts', value: 7 },
    { suit: 'hearts', value: 8 },
    { suit: 'hearts', value: 9 },
    { suit: 'hearts', value: 10 },
    { suit: 'hearts', value: 11 },
    { suit: 'hearts', value: 12 },
    { suit: 'hearts', value: 13 },
    { suit: 'diamonds', value: 1 },
    { suit: 'diamonds', value: 2 },
    { suit: 'diamonds', value: 3 },
    { suit: 'diamonds', value: 4 },
    { suit: 'diamonds', value: 5 },
    { suit: 'diamonds', value: 6 },
    { suit: 'diamonds', value: 7 },
    { suit: 'diamonds', value: 8 },
    { suit: 'diamonds', value: 9 },
    { suit: 'diamonds', value: 10 },
    { suit: 'diamonds', value: 11 },
    { suit: 'diamonds', value: 12 },
    { suit: 'diamonds', value: 13 },
    { suit: 'clubs', value: 1 },
    { suit: 'clubs', value: 2 },
    { suit: 'clubs', value: 3 },
    { suit: 'clubs', value: 4 },
    { suit: 'clubs', value: 5 },
    { suit: 'clubs', value: 6 },
    { suit: 'clubs', value: 7 },
    { suit: 'clubs', value: 8 },
    { suit: 'clubs', value: 9 },
    { suit: 'clubs', value: 10 },
    { suit: 'clubs', value: 11 },
    { suit: 'clubs', value: 12 },
    { suit: 'clubs', value: 13 },
    { suit: 'spades', value: 1 },
    { suit: 'spades', value: 2 },
    { suit: 'spades', value: 3 },
    { suit: 'spades', value: 4 },
    { suit: 'spades', value: 5 },
    { suit: 'spades', value: 6 },
    { suit: 'spades', value: 7 },
    { suit: 'spades', value: 8 },
    { suit: 'spades', value: 9 },
    { suit: 'spades', value: 10 },
    { suit: 'spades', value: 11 },
    { suit: 'spades', value: 12 },
    { suit: 'spades', value: 13 },
];

// Inicializar gestores
const deckManager = new DeckManager(initialDeck);
const roundManager = new RoundManager();

export default function PlayScreen() {
    const [currentHand, setCurrentHand] = useState<Card[]>(deckManager.drawCards(5));
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);

    const toggleCardSelection = (card: Card) => {
        setSelectedCards((prev) => {
            if (prev.includes(card)) {
                return prev.filter((c) => c !== card);
            } else {
                return [...prev, card];
            }
        });
    };

    const discardSelectedCards = () => {
        deckManager.discardCards(selectedCards);
        const newCards = deckManager.drawCards(selectedCards.length);
        setCurrentHand((prevHand) => [
            ...prevHand.filter((card) => !selectedCards.includes(card)),
            ...newCards,
        ]);
        setSelectedCards([]);
    };

    const calculateScore = () => {
        const roundScore = roundManager.calculateScore(currentHand, { discards: selectedCards.length });
        setScore(roundScore);
    };

    const startNewRound = () => {
        roundManager.startRound('normal', 100);
        setCurrentHand(deckManager.drawCards(5));
        setScore(0);
        setSelectedCards([]);
    };

    const endRound = () => {
        roundManager.endRound();
        setTotalScore(roundManager.getTotalScore());
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Balatro - Juego</Text>
            <Text>Mano Actual:</Text>
            {currentHand.map((card, index) => (
                <Text
                    key={index}
                    style={{
                        color: selectedCards.includes(card) ? 'red' : 'black',
                        textDecorationLine: selectedCards.includes(card) ? 'line-through' : 'none',
                    }}
                    onPress={() => toggleCardSelection(card)}
                >
                    {`${card.value} de ${card.suit}`}
                </Text>
            ))}
            <Button title="Descartar Cartas Seleccionadas" onPress={discardSelectedCards} />
            <Button title="Calcular Puntuación" onPress={calculateScore} />
            <Text>Puntuación de la Ronda: {score}</Text>
            <Button title="Iniciar Nueva Ronda" onPress={startNewRound} />
            <Button title="Finalizar Ronda" onPress={endRound} />
            <Text>Puntuación Total: {totalScore}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});