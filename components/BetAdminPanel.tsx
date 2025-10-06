import React from 'react';
import {View, StyleSheet} from 'react-native';
import {PixelButton} from '@/components/PixelButton';

export default function BetAdminPanel({onOpen, onLock, onUnlock, onSettle, onCancel}: {
    onOpen?: () => void;
    onLock?: () => void;
    onUnlock?: () => void;
    onSettle?: () => void;
    onCancel?: () => void
}) {
    return (
        <View style={styles.container}>
            {onOpen && <PixelButton title="Abrir" onPress={onOpen}/>}
            {onLock && <PixelButton title="Bloquear" onPress={onLock}/>}
            {onUnlock && <PixelButton title="Desbloquear" onPress={onUnlock}/>}
            {onSettle && <PixelButton title="Liquidar" onPress={onSettle}/>}
            {onCancel && <PixelButton title="Cancelar" variant="danger" onPress={onCancel}/>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        padding: 12,
        gap: 8
    }
});
