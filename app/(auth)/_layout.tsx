import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform } from "react-native";

export default function AuthLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        initialRouteName="sign-up-step-1"
        screenOptions={{
          headerShown: false,
          animation: "default",
          animationDuration: 350,
          fullScreenGestureEnabled: Platform.OS === "ios",
          gestureEnabled: true,
          contentStyle: { backgroundColor: isDark ? "#1A1A1B" : "#ffffff" },
        }}
      >
        <Stack.Screen name="sign-up-step-1" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up-step-2" />
        <Stack.Screen name="legal" />
      </Stack>
    </>
  );
}
