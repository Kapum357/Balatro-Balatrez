import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { PixelTheme } from '../constants/Theme';
import { usePressScale } from '../utils/usePressScale';

interface PixelButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  small?: boolean;
}

export function PixelButton({
  title, onPress, type = 'primary', disabled = false, small = false
}: PixelButtonProps) {
  const { onPressIn, onPressOut, animatedStyle } = usePressScale(0.93);

  const colors = {
    primary: PixelTheme.colors.accent,
    secondary: PixelTheme.colors.bgAlt,
    danger: PixelTheme.colors.danger
  } as const;

  return (
    <View style={styles.wrapper}>
      <View style={styles.shadowBlock} />
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
            { backgroundColor: colors[type] },
            small && styles.small,
            disabled && styles.disabled,
            pressed && styles.pressed
        ]}
      >
        <Animated.View style={[animatedStyle]}>
          <Text style={[
            styles.text,
            disabled && styles.textDisabled
          ]}>{title}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    margin: PixelTheme.spacing.xs
  },
  shadowBlock: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: PixelTheme.colors.shadow,
  },
  base: {
    borderWidth: 2,
    borderColor: PixelTheme.colors.border,
    paddingVertical: PixelTheme.spacing.xs + 2,
    paddingHorizontal: PixelTheme.spacing.md,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center'
  },
  small: {
    paddingHorizontal: PixelTheme.spacing.sm,
    minWidth: 72
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  disabled: {
    opacity: 0.45
  },
  text: {
    color: PixelTheme.colors.text,
    fontFamily: PixelTheme.typography.fontPixel,
    textTransform: 'uppercase',
    fontSize: 13,
    letterSpacing: 1
  },
  textDisabled: {
    color: PixelTheme.colors.textFaint
  }
});