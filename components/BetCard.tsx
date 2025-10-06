import React from 'react';
import {View, StyleSheet} from 'react-native';
import {PixelText} from '@/components/PixelText';
import {PixelButton} from '@/components/PixelButton';
import {Bet} from '@/.expo/types/bet';

export default function BetCard({bet, onPressJoin, onPressOpen}: {
    bet: Bet;
    onPressJoin?: () => void;
    onPressOpen?: () => void
}) {
    return (
        <View style={styles.card}>
            <View style={styles.row}><PixelText
                size="large">{bet.title}</PixelText><PixelText>{bet.status}</PixelText></View>
            <PixelText>{bet.description}</PixelText>
            <View style={styles.row}><PixelText>Stake: {bet.stake_per_player}</PixelText>{onPressJoin &&
                <PixelButton title="Unirme" onPress={onPressJoin}/>}</View>
            {onPressOpen && <PixelButton title="Ver" onPress={onPressOpen}/>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#232323',
        borderRadius: 12,
        padding: 14,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 4
    }
});
