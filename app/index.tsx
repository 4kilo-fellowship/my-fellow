import { PRIMARY } from "@/constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function SplashScreenComponent() {
  const router = useRouter();
  const [phase, setPhase] = useState<"primary" | "white">("primary");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (isImageLoaded) {
      // Once image is loaded, hide native splash to reveal this matching screen
      SplashScreen.hideAsync();

      const changeTimeout = setTimeout(() => {
        setPhase("white");
      }, 3000);

      const navTimeout = setTimeout(() => {
        router.replace("/(tabs)");
      }, 4000);

      return () => {
        clearTimeout(changeTimeout);
        clearTimeout(navTimeout);
      };
    }
  }, [isImageLoaded]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: phase === "primary" ? PRIMARY : "#fff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={
          phase === "primary"
            ? require("../assets/images/logo-white.png")
            : require("../assets/images/logo-primary.png")
        }
        style={{
          width: "100%",
          height: "100%",
          maxWidth: 400, // Reasonable max width close to typical native splash icon sizes
          maxHeight: 400,
        }}
        contentFit="contain"
        transition={0}
        cachePolicy="memory"
        onLoad={() => setIsImageLoaded(true)}
      />
    </View>
  );
}
