import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { Theme } from '@/constants/Theme';
import { ResponsiveUI } from '@/utils/responsive';

interface PixelTextProps extends TextProps {
  size?: keyof typeof Theme.typography.sizes;
  color?: string;
  centered?: boolean;
  children: React.ReactNode;
}

export function PixelText({ 
  size = 'regular',
  color = Theme.colors.text,
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
          fontSize: ResponsiveUI.typography.body(Theme.typography.sizes[size]),          
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
    fontFamily: Theme.typography.fontPixel,
    letterSpacing: 0.5,
  },
});
