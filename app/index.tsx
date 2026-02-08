import { PRIMARY } from "@/constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function AppSplashScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Diagonal length for translation distance (hypotenuse covers screen)
  // Multiply by 1.5 to ensure full coverage even with rotation
  const diagonal = Math.sqrt(width * width + height * height) * 1.5;

  const wipe1 = useSharedValue(diagonal); // Starts off-screen
  const wipe2 = useSharedValue(diagonal); // Starts off-screen

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    const startAnimations = async () => {
      // Small pause before starting
      await new Promise((r) => setTimeout(r, 1000));

      // 1. Wipe White In (Bottom-Right to Top-Left)
      wipe1.value = withTiming(0, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      // Pause briefly on the white screen
      await new Promise((r) => setTimeout(r, 1200));

      // 2. Wipe Primary In (Bottom-Right to Top-Left)
      wipe2.value = withTiming(
        0,
        {
          duration: 800,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished) {
            runOnJS(router.replace)("/(tabs)");
          }
        },
      );
    };

    startAnimations();
  }, [width, height]); // Re-run if dimensions change (unlikely on splash but safe)

  // -- Animated Styles --

  // The wipes are large rotated rectangles that translate along their rotated X-axis.
  // 45deg rotation makes the X-axis point diagonal-down-right.
  // Translating from +diagonal to 0 moves them Up-Left to center.

  const wipe1Style = useAnimatedStyle(() => ({
    transform: [{ rotate: "45deg" }, { translateX: wipe1.value }],
  }));

  const logo1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: -wipe1.value }, { rotate: "-45deg" }],
  }));

  const wipe2Style = useAnimatedStyle(() => ({
    transform: [{ rotate: "45deg" }, { translateX: wipe2.value }],
  }));

  const logo2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: -wipe2.value }, { rotate: "-45deg" }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={PRIMARY} translucent />

      {/* Layer 0: Initial State (Primary BG, White Logo) */}
      <View style={[StyleSheet.absoluteFill, styles.centered]}>
        <Image
          source={require("../assets/images/logo-white.png")}
          style={styles.logo}
          contentFit="contain"
          cachePolicy="memory"
        />
      </View>

      {/* Layer 1: White Wipe (White BG, Primary Logo) */}
      <Animated.View
        style={[
          styles.wipeContainer,
          {
            width: diagonal,
            height: diagonal,
            top: (height - diagonal) / 2,
            left: (width - diagonal) / 2,
            backgroundColor: "#fff",
          },
          wipe1Style,
        ]}
      >
        {/* Counter-Rotated Inner Container to hold Logo Static */}
        <Animated.View style={[styles.innerContainer, logo1Style]}>
          <Image
            source={require("../assets/images/logo-primary.png")}
            style={styles.logo}
            contentFit="contain"
            cachePolicy="memory"
          />
        </Animated.View>
      </Animated.View>

      {/* Layer 2: Primary Wipe (Primary BG, White Logo) - Transitions to Home */}
      <Animated.View
        style={[
          styles.wipeContainer,
          {
            width: diagonal,
            height: diagonal,
            top: (height - diagonal) / 2,
            left: (width - diagonal) / 2,
            backgroundColor: PRIMARY,
            zIndex: 10,
          },
          wipe2Style,
        ]}
      >
        <Animated.View style={[styles.innerContainer, logo2Style]}>
          {/* We show the white logo again to complete the cycle before home appears */}
          <Image
            source={require("../assets/images/logo-white.png")}
            style={styles.logo}
            contentFit="contain"
            cachePolicy="memory"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
    overflow: "hidden", // Important so the huge rotating views don't mess up layout
  },
  wipeContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Clips the logo to this sliding window
  },
  innerContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 500,
    height: 500,
  },
});
