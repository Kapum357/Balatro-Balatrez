// utils/usePressScale.ts
import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function usePressScale(scaleDown = 0.94, dur = 80) {
  const sv = useSharedValue(1);
  const onPressIn = useCallback(() => { sv.value = withTiming(scaleDown, { duration: dur }); }, [scaleDown, dur, sv]);
  const onPressOut = useCallback(() => { sv.value = withTiming(1, { duration: dur }); }, [dur, sv]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sv.value }],
  }));
  return { onPressIn, onPressOut, animatedStyle };
}