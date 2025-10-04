import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Theme } from '@/constants/Theme';
import { usePressScale } from '@/utils/usePressScale';

interface PixelButtonProps {
  title?: string;
  children?: ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  small?: boolean;
  style?: object;
}

export function PixelButton({
  title,
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  small = false,
  style
}: PixelButtonProps) {
  const { onPressIn, onPressOut, animatedStyle } = usePressScale(0.93); // Add animation scaling

  const colors = {
    primary: Theme.colors.accent,
    secondary: Theme.colors.bgAlt,
    danger: Theme.colors.danger
  } as const;

  return (
    <View style={[styles.wrapper, style]}> {/* Apply the custom style here */}
      <View style={styles.shadowBlock} />
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          { backgroundColor: colors[variant] },
          small && styles.small,
          disabled && styles.disabled,
          pressed && styles.pressed
        ]}
      >
        <Animated.View style={[animatedStyle]}> {/* Apply animation */}
          {children || (
            <Text style={[
              styles.text,
              disabled && styles.textDisabled
            ]}>{title}</Text>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    margin: Theme.spacing.xs
  },
  shadowBlock: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: Theme.colors.shadow,
  },
  base: {
    borderWidth: 2,
    borderColor: Theme.colors.border,
    paddingVertical: Theme.spacing.xs + 2,
    paddingHorizontal: Theme.spacing.md,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center'
  },
  small: {
    paddingHorizontal: Theme.spacing.sm,
    minWidth: 72
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  disabled: {
    opacity: 0.45
  },
  text: {
    color: Theme.colors.text,
    fontFamily: Theme.typography.fontPixel,
    textTransform: 'uppercase',
    fontSize: 13,
    letterSpacing: 1
  },
  textDisabled: {
    color: Theme.colors.textFaint
  }
});