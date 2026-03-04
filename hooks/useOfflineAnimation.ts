import { useCallback } from "react";
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const useOfflineAnimation = () => {
  const pulse = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  const startAnimations = useCallback(() => {
    fadeIn.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [fadeIn, pulse]);

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.9, 1.15]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0]),
  }));

  const containerFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  return {
    startAnimations,
    pulseRingStyle,
    containerFadeStyle,
  };
};
