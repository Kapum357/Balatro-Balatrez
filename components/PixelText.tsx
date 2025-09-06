import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { PixelTheme } from '../constants/Theme';
import { ResponsiveUI } from '../utils/responsive';

interface PixelTextProps extends TextProps {
  size?: keyof typeof PixelTheme.typography.sizes;
  color?: string;
  centered?: boolean;
  children: React.ReactNode;
}

export function PixelText({ 
  size = 'regular',
  color = PixelTheme.colors.text,
  centered = false,
  style,
  children,
  ...props 
}: PixelTextProps) {
  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: ResponsiveUI.typography.body(PixelTheme.typography.sizes[size]),          
          color,
          textAlign: centered ? 'center' : 'left',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: PixelTheme.typography.fontPixel,
    letterSpacing: 0.5,
  },
});
