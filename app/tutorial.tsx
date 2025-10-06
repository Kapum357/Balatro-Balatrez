import {useNavigation} from "@react-navigation/native";
import React from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {PixelButton} from "@/components/PixelButton";
import {PixelText} from "@/components/PixelText";

export default function TutorialScreen() {
    const navigation = useNavigation();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <PixelText size="xxlarge" style={styles.title}>
                How to Play Balatro
            </PixelText>

            <View style={styles.section}>
                <PixelText size="large" style={styles.sectionTitle}>
                    1. Build Your Deck
                </PixelText>
                <PixelText size="regular" style={styles.sectionDescription}>
                    Start by selecting cards to create a powerful deck. Each card has a suit
                    and value.
                </PixelText>
            </View>

            <View style={styles.section}>
                <PixelText size="large" style={styles.sectionTitle}>
                    2. Master Poker Hands
                </PixelText>
                <PixelText size="regular" style={styles.sectionDescription}>
                    Learn the poker hand rankings to maximize your score. For example, a
                    Royal Flush is the highest hand.
                </PixelText>
            </View>

            <View style={styles.section}>
                <PixelText size="large" style={styles.sectionTitle}>
                    3. Scoring
                </PixelText>
                <PixelText size="regular" style={styles.sectionDescription}>
                    Earn points based on your poker hands. Bonuses are awarded for special
                    achievements, like no discards.
                </PixelText>
            </View>

            {/* Example Navigation Button */}
            <PixelButton
                title="Go Back"
                onPress={() => navigation.goBack()}
                variant="secondary"
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: "#1a1a1a",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 24,
        textAlign: "center",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 16,
        color: "#cccccc",
        marginBottom: 8,
    },
});