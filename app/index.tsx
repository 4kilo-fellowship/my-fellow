import { PRIMARY } from "@/constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
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
  const [barStyle, setBarStyle] = useState<"light" | "dark">("light");

  // Diagonal length for translation distance (hypotenuse covers screen)
  // Multiply by 1.6 to ensure full coverage even with rotation
  // using useMemo to calculate it only when dimensions change
  const diagonal = useMemo(() => {
    return Math.sqrt(width * width + height * height) * 1.6;
  }, [width, height]);

  const wipe1 = useSharedValue(diagonal);
  const wipe2 = useSharedValue(diagonal);

  useEffect(() => {
    // Ensure shared values are set correctly if dimensions loaded late
    wipe1.value = diagonal;
    wipe2.value = diagonal;

    SplashScreen.hideAsync().catch(() => {});

    const startAnimations = async () => {
      // 1. Initial State: Primary BG for a very short time
      await new Promise((r) => setTimeout(r, 400));

      // 2. Wipe White In (Bottom-Right to Top-Left)
      // Change status bar to dark roughly halfway through or at start of wipe?
      // Better to change it when the background is mostly white.
      setTimeout(() => setBarStyle("dark"), 400);

      wipe1.value = withTiming(0, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      // Wait for wipe to finish + short pause
      await new Promise((r) => setTimeout(r, 900)); // 800ms anim + 100ms pause

      // 3. Wipe Primary In (Bottom-Right to Top-Left)
      setBarStyle("light"); // Back to light for Primary BG

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

    if (width > 0 && height > 0) {
      startAnimations();
    }
  }, [width, height, diagonal]);

  // -- Animated Styles --
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

  if (width === 0 || height === 0) {
    return null; // Don't render until layout is ready
  }

  return (
    <View style={styles.container}>
      <StatusBar style={barStyle} backgroundColor="transparent" translucent />

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
        <Animated.View style={[styles.innerContainer, logo1Style]}>
          <Image
            source={require("../assets/images/logo-primary.png")}
            style={styles.logo}
            contentFit="contain"
            cachePolicy="memory"
          />
        </Animated.View>
      </Animated.View>

      {/* Layer 2: Primary Wipe (Primary BG, White Logo) */}
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
    overflow: "hidden",
  },
  wipeContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
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
