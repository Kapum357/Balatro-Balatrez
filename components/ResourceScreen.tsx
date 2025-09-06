import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ResourceManager } from '../managers/roundManager';

const resourceManager = new ResourceManager(100); // Inicializa con 100 fichas

export default function ResourceScreen() {
    const [chips, setChips] = useState<number>(resourceManager.getChips());

    const handleSpendChips = (amount: number) => {
        const success = resourceManager.spendChips(amount);
        if (success) {
            setChips(resourceManager.getChips());
            console.log(`Gastaste ${amount} fichas.`);
        } else {
            console.log('No tienes suficientes fichas.');
        }
    };

    const handleAddChips = (amount: number) => {
        resourceManager.addChips(amount);
        setChips(resourceManager.getChips());
        console.log(`Agregaste ${amount} fichas.`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gestión de Recursos</Text>
            <Text>Fichas Disponibles: {chips}</Text>
            <Button title="Gastar 10 Fichas" onPress={() => handleSpendChips(10)} />
            <Button title="Agregar 20 Fichas" onPress={() => handleAddChips(20)} />
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