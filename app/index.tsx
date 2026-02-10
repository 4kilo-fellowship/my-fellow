import { PRIMARY } from "@/constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const LOGO_SIZE = 500;

export default function AppSplashScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [statusBarDelay, setStatusBarDelay] = useState(false);
  const progress = useSharedValue(0);

  const originX = width;
  const originY = height;
  const finalRadius = Math.hypot(width, height) * 1.5;
  const logoTargetLeft = (width - LOGO_SIZE) / 2;
  const logoTargetTop = (height - LOGO_SIZE) / 2;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    progress.value = withDelay(
      2000,
      withTiming(
        1,
        { duration: 1200, easing: Easing.inOut(Easing.exp) },
        (finished) => {
          if (finished) {
            runOnJS(router.replace)("/(tabs)");
          }
        },
      ),
    );
  }, []);

  useAnimatedReaction(
    () => progress.value,
    (current, prev) => {
      if (current > 0.6 && (!prev || prev <= 0.6)) {
        runOnJS(setStatusBarDelay)(true);
      }
    },
  );

  const bubbleStyle = useAnimatedStyle(() => {
    const r = progress.value * finalRadius;
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      left: originX - r,
      top: originY - r,
    };
  });

  const innerLogoStyle = useAnimatedStyle(() => {
    const r = progress.value * finalRadius;

    const containerLeft = originX - r;
    const containerTop = originY - r;

    return {
      left: logoTargetLeft - containerLeft,
      top: logoTargetTop - containerTop,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar
        style={statusBarDelay ? "dark" : "light"}
        backgroundColor="transparent"
        translucent
      />

      <View style={[StyleSheet.absoluteFill, styles.primaryLayer]}>
        <View
          style={{
            position: "absolute",
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            left: logoTargetLeft,
            top: logoTargetTop,
          }}
        >
          <Image
            source={require("../assets/images/logo-white.png")}
            style={styles.logo}
            contentFit="contain"
            cachePolicy="memory"
            transition={0}
          />
        </View>
      </View>

      <Animated.View style={[styles.revealContainer, bubbleStyle]}>
        <Animated.View style={[styles.innerLogoContainer, innerLogoStyle]}>
          <Image
            source={require("../assets/images/logo-primary.png")}
            style={styles.logo}
            contentFit="contain"
            cachePolicy="memory"
            transition={0}
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
  },
  primaryLayer: {
    backgroundColor: PRIMARY,
    zIndex: 1,
  },
  revealContainer: {
    position: "absolute",
    backgroundColor: "#fff",
    overflow: "hidden",
    zIndex: 2,
  },
  innerLogoContainer: {
    position: "absolute",
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
