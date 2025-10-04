import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { PixelText } from './PixelText';

interface NotificationToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onDismiss: () => void;
}

export function NotificationToast({ 
    message, 
    type = 'info', 
    duration = 3000, 
    onDismiss 
}: NotificationToastProps) {
    const opacity = useMemo(() => new Animated.Value(0), []);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(duration),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => onDismiss());
    }, [duration, onDismiss, opacity]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#4caf50';
            case 'error':
                return '#f44336';
            default:
                return '#2196f3';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor(), opacity }
            ]}
        >
            <PixelText style={styles.message}>{message}</PixelText>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    message: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});