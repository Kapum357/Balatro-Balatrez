// components/ShopScreen.tsx
                            import React from 'react';
                            import { ScrollView, StyleSheet, Text, View } from 'react-native';
                            import { ShopManager } from '@/managers/shopManager';
                            import { PixelButton } from './PixelButton';
                            import { Theme } from '@/constants/Theme';

                            interface ShopScreenProps {
                                chips?: number;
                            }

                            export function ShopScreen({ chips = 0 }: ShopScreenProps) {
                                const [shopManager] = React.useState(() => new ShopManager(chips));
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
                                                    <Text style={styles.itemText}>{joker.name} - {joker.effect}</Text>
                                                    <Text style={styles.itemText}>Coste: {joker.cost}</Text>
                                                    <PixelButton
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
                                                    <Text style={styles.itemText}>{card.name}</Text>
                                                    <Text style={styles.itemText}>Efecto: x{card.multiplier} en {card.target}</Text>
                                                    <Text style={styles.itemText}>Coste: {card.cost}</Text>
                                                    <PixelButton
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
                                    backgroundColor: Theme.colors.bg,
                                },
                                title: {
                                    fontSize: 24,
                                    fontWeight: 'bold',
                                    marginBottom: 16,
                                    color: Theme.colors.text,
                                    fontFamily: Theme.typography.fontPixel,
                                },
                                chips: {
                                    fontSize: 18,
                                    marginBottom: 16,
                                    color: Theme.colors.text,
                                    fontFamily: Theme.typography.fontPixel,
                                },
                                section: {
                                    marginBottom: 24,
                                },
                                sectionTitle: {
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                    marginBottom: 8,
                                    color: Theme.colors.text,
                                    fontFamily: Theme.typography.fontPixel,
                                },
                                item: {
                                    padding: 16,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.border,
                                    borderRadius: 8,
                                    marginBottom: 8,
                                    backgroundColor: Theme.colors.bgAlt,
                                },
                                itemText: {
                                    color: Theme.colors.text,
                                    marginBottom: 4,
                                    fontFamily: Theme.typography.fontPixel,
                                },
                            });