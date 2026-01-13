import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

interface AnimatedSplashProps {
  onAnimationFinish: () => void;
}

export default function AnimatedSplash({
  onAnimationFinish,
}: AnimatedSplashProps) {
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(1)).current; // Opacity of the "Primary" view
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Sequence of animations
    const runAnimation = () => {
      // 1. Wait 2.5 seconds (2-3 seconds as requested)
      setTimeout(() => {
        // 2. Fade out the Primary BG (revealing White BG underneath)
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500, // Smooth transition duration
          useNativeDriver: true,
        }).start(() => {
          // 3. Wait another ~1 second while showing White BG + Primary Logo
          setTimeout(() => {
            onAnimationFinish();
          }, 1000);
        });
      }, 2500);
    };

    runAnimation();
  }, []);

  return (
    <View style={styles.container}>
      {/* LAYER 1 (Bottom): White Background with Primary Logo.
        This is what we reveal after the fade.
      */}
      <View className="absolute inset-0 bg-white items-center justify-center z-0">
        <Image
          source={require("../assets/images/logo-primary.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* LAYER 2 (Top): Primary Background with White Logo.
        This is what the user sees first. We animate its opacity.
      */}
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim }, // Bind opacity to animation
        ]}
        className="bg-primary items-center justify-center"
      >
        <Image
          source={require("../assets/images/logo-white.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  logo: {
    width: 150, // Adjust size as needed
    height: 150,
  },
});
