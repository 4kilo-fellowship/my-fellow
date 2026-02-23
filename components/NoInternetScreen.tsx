import { PRIMARY } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface NoInternetScreenProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function NoInternetScreen({
  onRetry,
  isRetrying = false,
}: NoInternetScreenProps) {
  const tilt = useSharedValue(0);
  const floating = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    tilt.value = withRepeat(
      withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    floating.value = withRepeat(
      withTiming(-20, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floating.value },
        { rotate: `${tilt.value}deg` },
      ],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: interpolate(pulse.value, [1, 1.2], [0.6, 0.2]),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        {/* Pulsing Background */}
        <Animated.View style={[styles.pulseCircle, pulseStyle]} />

        {/* Animated No Internet SVG */}
        <Animated.View style={[styles.svgWrapper, animatedStyle]}>
          <Svg width="140" height="140" viewBox="0 0 48 48" fill="none">
            {/* Cloud Outline */}
            <Path
              d="M13.5 19.5A10.5 10.5 0 0 1 34.5 19.5 7.5 7.5 0 0 1 34.5 34.5H13.5a7.5 7.5 0 0 1 0-15Z"
              stroke={PRIMARY}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Diagonal Slash */}
            <Path
              d="M10 10l28 28"
              stroke={PRIMARY}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        <View style={styles.iconOverlay}>
          <Ionicons name="cloud-offline-outline" size={40} color="white" />
        </View>
      </View>

      <Text style={styles.title}>Offline</Text>
      <Text style={styles.message}>
        Connect to the internet to get started on your journey.
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onRetry}
        disabled={isRetrying}
        style={[styles.button, isRetrying && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>
          {isRetrying ? "Checking..." : "Try Again"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  svgWrapper: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseCircle: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: PRIMARY,
  },
  iconOverlay: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 100,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
