import { PRIMARY } from "@/constants";
import { useAppStore } from "@/stores/app.store";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function AppSplashScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const logoSize = Math.min(width * 1.2, 500);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);

  const progress = useSharedValue(0);

  const originX = width + 50;
  const originY = height + 50;
  const finalRadius = Math.hypot(width + 50, height + 50) * 1.5;

  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (imagesLoaded) {
      SplashScreen.hideAsync().catch(() => {});

      progress.value = withDelay(
        1800,
        withTiming(
          1,
          { duration: 800, easing: Easing.inOut(Easing.exp) },
          (finished) => {
            if (finished) {
              setTimeout(() => {
                if (hasCompletedOnboarding) {
                  scheduleOnRN(router.replace, "/(tabs)");
                } else {
                  scheduleOnRN(router.replace, "/onboarding");
                }
              }, 300);
            }
          },
        ),
      );
    }
  }, [imagesLoaded]);

  const bubbleStyle = useAnimatedStyle(() => {
    const r = progress.value * finalRadius;
    const opacity = progress.value > 0 ? 1 : 0;
    return {
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      left: originX - r,
      top: originY - r,
      opacity,
    };
  });

  const innerLogoStyle = useAnimatedStyle(() => {
    const r = progress.value * finalRadius;
    const containerLeft = originX - r;
    const containerTop = originY - r;

    return {
      width,
      height,
      transform: [
        { translateX: -containerLeft },
        { translateY: -containerTop },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      <View style={[styles.primaryLayer, { width, height }]}>
        <Image
          source={require("../assets/images/logo-white.png")}
          style={[styles.logo, { width: logoSize, height: logoSize }]}
          contentFit="contain"
          cachePolicy="memory"
          transition={0}
          onLoad={() => setImagesLoaded(true)}
        />
      </View>

      <Animated.View style={[styles.revealContainer, bubbleStyle]}>
        <Animated.View style={[styles.innerLogoContainer, innerLogoStyle]}>
          <Image
            source={require("../assets/images/logo-primary.png")}
            style={[styles.logo, { width: logoSize, height: logoSize }]}
            contentFit="contain"
            cachePolicy="memory"
            transition={0}
            onLoad={() => {}}
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
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: PRIMARY,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  revealContainer: {
    position: "absolute",
    backgroundColor: "#fff",
    overflow: "hidden",
    zIndex: 2,
  },
  innerLogoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {},
});
