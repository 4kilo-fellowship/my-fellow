import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export const unstable_settings = {
  initialRouteName: "sign-in",
};

export default function AuthLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} animated />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "simple_push",
          gestureEnabled: true,
          contentStyle: { backgroundColor: isDark ? "#1A1A1B" : "#ffffff" },
        }}
      >
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="sign-up-step-1"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="personalization"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="sign-up-step-2"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="otp-verify"
          options={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />

        <Stack.Screen
          name="legal"
          options={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />
      </Stack>
    </>
  );
}
