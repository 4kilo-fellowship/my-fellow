import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const backgroundAnim = useRef(new Animated.Value(0)).current; // 0 = primary, 1 = white

  useEffect(() => {
    Animated.sequence([
      Animated.delay(2000), // wait 2s
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.delay(1000), // wait 1s
    ]).start(() => {
      router.replace("/(tabs)"); // Navigate to home screen
    });
  }, []);

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1D4ED8", "#FFFFFF"], // Tailwind 'primary' color → white
  });

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* White Logo */}
      <Animated.Image
        source={require("../assets/images/logo-white.png")}
        style={{
          width: 200,
          height: 200,
          position: "absolute",
          opacity: backgroundAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        }}
        resizeMode="contain"
      />

      {/* Primary Logo */}
      <Animated.Image
        source={require("../assets/images/logo-primary.png")}
        style={{
          width: 200,
          height: 200,
          position: "absolute",
          opacity: backgroundAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
