// components/PixelLayout.tsx
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { PixelTheme } from '../constants/Theme';

interface PixelLayoutProps extends ViewProps {
    children: React.ReactNode;
}

export function PixelLayout({ children, style, ...props }: PixelLayoutProps) {
    return (
        <View style={[styles.container, style]} {...props}>
            <View style={styles.pixelBorder}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PixelTheme.colors.background,
    },
    pixelBorder: {
        flex: 1,
        margin: PixelTheme.spacing.sm,
        borderWidth: 2,
        borderColor: PixelTheme.colors.accent,
        borderRadius: PixelTheme.borderRadius.small,
        padding: PixelTheme.spacing.md,
    }
});