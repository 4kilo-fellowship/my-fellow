import { PRIMARY } from "@/constants";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface NoInternetScreenProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function NoInternetScreen({
  onRetry,
  isRetrying = false,
}: NoInternetScreenProps) {
  const floating = useSharedValue(0);
  const pulse = useSharedValue(0);
  const fadeIn = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    fadeIn.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    floating.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const illustrationStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floating.value }],
  }));

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.9, 1.15]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0]),
  }));

  const containerFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: interpolate(fadeIn.value, [0, 1], [30, 0]) }],
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, containerFadeStyle]}>
        <View style={styles.illustrationContainer}>
          <Animated.View style={[styles.pulseRing, pulseRingStyle]} />

          <Animated.View style={[styles.imageWrapper, illustrationStyle]}>
            <Image
              source={require("../assets/images/no-internet.png")}
              style={styles.illustration}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <Text style={styles.title}>No Connection</Text>
        <Text style={styles.message}>
          Connect to the internet to get started{"\n"}on your journey.
        </Text>

        <Animated.View style={buttonAnimStyle}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onRetry}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isRetrying}
            style={[styles.button, isRetrying && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isRetrying ? "Checking..." : "Try Again"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    width: width * 0.65,
    height: width * 0.65,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  pulseRing: {
    position: "absolute",
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    borderWidth: 2.5,
    borderColor: PRIMARY,
    opacity: 0.3,
  },
  imageWrapper: {
    width: width * 0.6,
    height: width * 0.6,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 40,
  },
  button: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 52,
    paddingVertical: 16,
    borderRadius: 100,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
