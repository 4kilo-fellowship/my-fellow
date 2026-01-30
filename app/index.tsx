import { PRIMARY } from "@/constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function SplashScreenComponent() {
  const router = useRouter();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (isImageLoaded) {
      // Once image is loaded, hide native splash to reveal this matching screen
      SplashScreen.hideAsync();

      const navTimeout = setTimeout(() => {
        router.replace("/(tabs)");
      }, 2500); // 2.5 seconds splash duration

      return () => {
        clearTimeout(navTimeout);
      };
    }
  }, [isImageLoaded]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: PRIMARY,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require("../assets/images/logo-white.png")}
        style={{
          width: "70%", // Large logo
          aspectRatio: 1,
          maxWidth: 350,
        }}
        contentFit="contain"
        transition={0}
        cachePolicy="memory"
        onLoad={() => setIsImageLoaded(true)}
      />
    </View>
  );
}
