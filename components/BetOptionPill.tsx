import React from 'react';
import {StyleSheet, Pressable} from 'react-native';
import {PixelText} from '@/components/PixelText';

export function BetOptionPill(props: { label: string; selected?: boolean; onPress?: () => void }) {
    const {label, selected, onPress} = props;
    return (
        <Pressable onPress={onPress}
                   style={({pressed}) => [styles.pill, selected && styles.selected, pressed && styles.pressed]}>
            <PixelText>{label}</PixelText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#333',
        marginRight: 8,
        marginBottom: 8
    },
    selected: {backgroundColor: '#0a84ff'},
    pressed: {opacity: 0.85}
});

export default BetOptionPill;
