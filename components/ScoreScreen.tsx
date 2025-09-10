import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Card } from '../.expo/types/card';
import { RoundManager } from '../managers/roundManager';

const roundManager = new RoundManager();

export default function ScoreScreen() {
    const [playerHand] = useState<Card[]>([
        { suit: 'hearts', value: 10 },
        { suit: 'hearts', value: 11 },
        { suit: 'hearts', value: 12 },
        { suit: 'hearts', value: 13 },
        { suit: 'hearts', value: 14 },
    ]);
    const [score, setScore] = useState<number>(0);
    const [discards, setDiscards] = useState<number>(0);

    const calculatePlayerScore = () => {
        const newScore = roundManager.calculateScore(playerHand, { discards });
        setScore(newScore);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calcular Puntuación</Text>
            <Text>Mano del Jugador:</Text>
            {playerHand.map((card, index) => {
                console.log("card.value:", card.value, "card.suit:", card.suit);
                return <Text key={index}>{`${card.value} de ${card.suit}`}</Text>;
            })}
            <Text>Descartes: {discards}</Text>
            <Text>Puntuación Actual: {score}</Text>
            <Button title="Calcular Puntuación" onPress={calculatePlayerScore} />
            <Button title="Descartar Carta" onPress={() => setDiscards(discards + 1)} />
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