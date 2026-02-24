import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface NoInternetScreenProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function NoInternetScreen({
  onRetry,
  isRetrying = false,
}: NoInternetScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pulse = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
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
  }, []);

  const pulseRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.9, 1.15]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0]),
  }));

  const containerFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  return (
    <View
      style={[
        offlineStyles.container,
        { backgroundColor: isDark ? "#1A1A1B" : "#ffffff" },
      ]}
    >
      <Animated.View style={[offlineStyles.content, containerFadeStyle]}>
        <View style={offlineStyles.illustrationContainer}>
          <Animated.View style={[offlineStyles.pulseRing, pulseRingStyle]} />
          <View style={offlineStyles.imageWrapper}>
            <Image
              source={require("../assets/images/no-internet.jpg")}
              style={offlineStyles.illustration}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text
          style={[
            offlineStyles.title,
            { color: isDark ? "#ffffff" : "#1e293b" },
          ]}
        >
          No Connection
        </Text>
        <Text
          style={[
            offlineStyles.message,
            { color: isDark ? "#94a3b8" : "#94a3b8" },
          ]}
        >
          Connect to the internet to get started{"\n"}on your journey.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onRetry}
          disabled={isRetrying}
          style={[offlineStyles.button, isRetrying && { opacity: 0.6 }]}
        >
          <Text style={offlineStyles.buttonText}>
            {isRetrying ? "Checking..." : "Try Again"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const offlineStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  pulseRing: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: (SCREEN_WIDTH * 0.7) / 2,
    borderWidth: 2.5,
    borderColor: PRIMARY,
    opacity: 0.3,
  },
  imageWrapper: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
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
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
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
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
