// This component is currently unused in the project. Consider removing it or integrating it where necessary.
// components/PixelLayout.tsx
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Theme } from '@/constants/Theme';

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
        backgroundColor: Theme.colors.bg,
    },
    pixelBorder: {
        flex: 1,
        margin: Theme.spacing.sm,
        borderWidth: 2,
        borderColor: Theme.colors.accent,
        borderRadius: Theme.radius.sm,
        padding: Theme.spacing.md,
    }
});