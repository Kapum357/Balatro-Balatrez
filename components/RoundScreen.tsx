import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { RoundManager } from '../managers/roundManager';

const roundManager = new RoundManager();

export default function RoundScreen() {
    const [currentRound, setCurrentRound] = useState<string | null>(null);
    const [totalScore, setTotalScore] = useState<number>(0);

    const startNewRound = () => {
        roundManager.startRound('normal', 100); // Inicia una ronda de tipo "normal" con un objetivo de 100 fichas
        setCurrentRound('normal');
    };

    const endCurrentRound = () => {
        roundManager.endRound(); // Finaliza la ronda actual
        setTotalScore(roundManager.getTotalScore()); // Actualiza la puntuación total
        setCurrentRound(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gestión de Rondas</Text>
            {currentRound ? (
                <>
                    <Text>Ronda Actual: {currentRound}</Text>
                    <Button title="Finalizar Ronda" onPress={endCurrentRound} />
                </>
            ) : (
                <>
                    <Text>No hay una ronda activa</Text>
                    <Button title="Iniciar Nueva Ronda" onPress={startNewRound} />
                </>
            )}
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