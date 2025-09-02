// components/PixelButton.tsx
import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PixelTheme } from '../constants/Theme';

interface PixelButtonProps {
    title: string;
    onPress: () => void;
    type?: 'primary' | 'secondary';
    disabled?: boolean;
}

export function PixelButton({ 
    title, 
    onPress, 
    type = 'primary',
    disabled = false 
}: PixelButtonProps) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.button,
                type === 'secondary' && styles.buttonSecondary,
                disabled && styles.buttonDisabled,
                Platform.select({
                    web: styles.buttonWeb,
                    default: null,
                })
            ]}>
            <View style={styles.innerShadow}>
                <Text style={[
                    styles.text,
                    type === 'secondary' && styles.textSecondary,
                    disabled && styles.textDisabled
                ]}>
                    {title}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: PixelTheme.colors.accent,
        padding: PixelTheme.spacing.sm,
        borderRadius: PixelTheme.borderRadius.small,
        borderWidth: 2,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#000000',
    },
    buttonSecondary: {
        backgroundColor: PixelTheme.colors.card,
    },
    buttonDisabled: {
        backgroundColor: PixelTheme.colors.textSecondary,
        opacity: 0.5,
    },
    buttonWeb: {
        cursor: 'pointer',
    },
    innerShadow: {
        padding: PixelTheme.spacing.sm,
    },
    text: {
        color: PixelTheme.colors.text,
        fontSize: 16,
        fontFamily: 'monospace',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    textSecondary: {
        color: PixelTheme.colors.textSecondary,
    },
    textDisabled: {
        color: PixelTheme.colors.textSecondary,
    }
});