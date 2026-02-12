import { PRIMARY } from "@/constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const LOGO_SIZE = 500;

export default function AppSplashScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const progress = useSharedValue(0);

  const originX = width + 50;
  const originY = height + 50;
  const finalRadius = Math.hypot(width + 50, height + 50) * 1.5;
  const logoTargetLeft = (width - LOGO_SIZE) / 2;
  const logoTargetTop = (height - LOGO_SIZE) / 2;

  const [imagesLoaded, setImagesLoaded] = React.useState(false);

  useEffect(() => {
    // Fallback: if images take too long, hide splash anyway
    const timer = setTimeout(() => {
      if (!imagesLoaded) setImagesLoaded(true);
    }, 2000);

    if (imagesLoaded) {
      SplashScreen.hideAsync().catch(() => {});

      progress.value = withDelay(
        500, // Reduced delay for faster transition once ready
        withTiming(
          1,
          { duration: 1000, easing: Easing.inOut(Easing.exp) },
          (finished) => {
            if (finished) {
              scheduleOnRN(router.replace, "/(tabs)");
            }
          },
        ),
      );
    }
    return () => clearTimeout(timer);
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
      opacity, // Prevent showing white bubble before animation starts
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
      <StatusBar style="light" backgroundColor="transparent" translucent />

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
            onLoad={() => setImagesLoaded(true)}
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
            onLoad={() => {
              // Both logos should ideally be loaded
            }}
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
