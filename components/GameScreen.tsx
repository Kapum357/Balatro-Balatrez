import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Card } from '../.expo/types/card';
import { playGame } from '../utils/gameFlow';

export default function PlayScreen() {
    const [currentHand, setCurrentHand] = useState<Card[]>([
        { suit: 'hearts', value: 10 },
        { suit: 'hearts', value: 11 },
        { suit: 'hearts', value: 12 },
        { suit: 'hearts', value: 13 },
        { suit: 'hearts', value: 14 },
    ]);
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

    const discardSelectedCards = () => {
        setCurrentHand((prevHand) => prevHand.filter((card) => !selectedCards.includes(card)));
        setSelectedCards([]);
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
            <Button title="Iniciar Juego" onPress={playGame} />
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