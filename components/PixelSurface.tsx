// components/PixelSurface.tsx
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { PixelTheme } from '../constants/Theme';

interface Props extends ViewProps {
  inset?: boolean;
  variant?: 'flat' | 'sunken' | 'raised';
  color?: string;
}

export function PixelSurface({
  style,
  children,
  inset = false,
  variant = 'raised',
  color = PixelTheme.colors.bgAlt,
  ...rest
}: Props) {
  return (
    <View style={[
      styles.base,
      { backgroundColor: color },
      variant === 'raised' && styles.raised,
      variant === 'sunken' && styles.sunken,
      inset && styles.inset,
      style
    ]} {...rest}>
      {children}
    </View>
  );
}

const b = PixelTheme.colors.border;
const sh = PixelTheme.colors.shadow;

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderColor: b,
    padding: PixelTheme.spacing.sm
  },
  raised: {
    shadowColor: sh,
    shadowOffset: { width: 0, height: PixelTheme.elevation.offset },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0
  },
  sunken: {
    borderTopColor: sh,
    borderLeftColor: sh,
  },
  inset: {
    padding: PixelTheme.spacing.xs
  }
});