import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const [isWhite, setIsWhite] = useState(false);

  useEffect(() => {
    // After 2s → switch background & logo instantly
    const t1 = setTimeout(() => {
      setIsWhite(true);
    }, 2000);

    // After another 1s → navigate
    const t2 = setTimeout(() => {
      router.replace("/(tabs)");
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isWhite ? "#FFFFFF" : "#1D4ED8", // primary → white
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={
          isWhite
            ? require("../assets/images/logo-primary.png")
            : require("../assets/images/logo-white.png")
        }
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
      />
    </View>
  );
}
