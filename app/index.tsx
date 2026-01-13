import { PRIMARY } from "@/constants/Colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"primary" | "white">("primary");

  useEffect(() => {
    const changeTimeout = setTimeout(() => {
      setPhase("white");
    }, 2000);

    const navTimeout = setTimeout(() => {
      router.replace("/(tabs)");
    }, 3000);

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
