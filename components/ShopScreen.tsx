// components/ShopScreen.tsx
import React from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ShopManager } from '../managers/shopManager';

export default function ShopScreen({ navigation, route }: any) {
    const [shopManager] = React.useState(() => new ShopManager(route.params?.chips || 0));
    const [items, setItems] = React.useState(shopManager.getAvailableItems());

    const handleBuyJoker = (jokerId: string) => {
        const joker = shopManager.buyJoker(jokerId);
        if (joker) {
            setItems(shopManager.getAvailableItems());
            // Actualizar el mazo del jugador
        }
    };

    const handleBuyTarot = (cardId: string) => {
        const card = shopManager.buyTarotCard(cardId);
        if (card) {
            setItems(shopManager.getAvailableItems());
            // Actualizar el mazo del jugador
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Tienda</Text>
            <Text style={styles.chips}>Fichas: {items.chips}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Comodines</Text>
                {items.jokers.map(joker => (
                    <View key={joker.id} style={styles.item}>
                        <Text>{joker.name} - {joker.effect}</Text>
                        <Text>Coste: {joker.cost}</Text>
                        <Button 
                            title="Comprar" 
                            onPress={() => handleBuyJoker(joker.id)}
                            disabled={items.chips < joker.cost}
                        />
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cartas del Tarot</Text>
                {items.tarotCards.map(card => (
                    <View key={card.id} style={styles.item}>
                        <Text>{card.name}</Text>
                        <Text>Efecto: x{card.multiplier} en {card.target}</Text>
                        <Text>Coste: {card.cost}</Text>
                        <Button 
                            title="Comprar" 
                            onPress={() => handleBuyTarot(card.id)}
                            disabled={items.chips < card.cost}
                        />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    chips: {
        fontSize: 18,
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    item: {
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
    },
});
