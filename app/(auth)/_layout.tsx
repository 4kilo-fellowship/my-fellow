import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useTheme } from "@/context/ThemeContext";

export default function AuthLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <StatusBar style="light" />
      <Stack
        initialRouteName="sign-up-step-1"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? "#0f172a" : "#ffffff" },
        }}
      >
        <Stack.Screen name="sign-up-step-1" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up-step-2" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="legal" />
      </Stack>
    </>
  );
}
