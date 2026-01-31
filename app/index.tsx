import { PRIMARY } from "@/constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function AppSplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"primary" | "white">("primary");

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

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
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: phase === "primary" ? PRIMARY : "#fff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar
        style={phase === "primary" ? "light" : "dark"}
        backgroundColor={phase === "primary" ? PRIMARY : "#fff"}
        translucent
      />
      <Image
        source={
          phase === "primary"
            ? require("../assets/images/logo-white.png")
            : require("../assets/images/logo-primary.png")
        }
        style={{ width: 500, height: 500 }}
        contentFit="contain"
        transition={0}
        cachePolicy="memory"
      />
    </View>
  );
}
