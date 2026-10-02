import { useTheme } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function AuthLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const navBar = {
    title: "",
    headerShadowVisible: false,
    headerBackButtonDisplayMode: "minimal" as const,
  };

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} animated />
      <Stack
        initialRouteName="sign-up-step-1"
        screenOptions={{
          headerShown: false,
          animation: "simple_push",
          gestureEnabled: true,
          contentStyle: { backgroundColor: isDark ? "#1A1A1B" : "#ffffff" },
        }}
      >
        <Stack.Screen
          name="sign-up-step-1"
          options={{
            ...navBar,
            headerShown: true,
            gestureEnabled: true,
            headerStyle: { backgroundColor: "#ff6719" },
            headerTintColor: "#ffffff",
          }}
        />
        <Stack.Screen
          name="sign-in"
          options={{
            ...navBar,
            headerShown: true,
            gestureEnabled: true,
            headerStyle: { backgroundColor: "#ff6719" },
            headerTintColor: "#ffffff",
          }}
        />
        <Stack.Screen
          name="sign-up-step-2"
          options={{
            ...navBar,
            headerShown: true,
            gestureEnabled: true,
            headerStyle: {
              backgroundColor: isDark ? "#1A1A1B" : "#ffffff",
            },
            headerTintColor: isDark ? "#ffffff" : "#0f172a",
          }}
        />
        <Stack.Screen
          name="otp-verify"
          options={{
            ...navBar,
            headerShown: true,
            gestureEnabled: true,
            headerStyle: { backgroundColor: "#ff6719" },
            headerTintColor: "#ffffff",
          }}
        />

        <Stack.Screen
          name="legal"
          options={{
            ...navBar,
            title: "Legal Information",
            headerShown: true,
            gestureEnabled: true,
            headerStyle: {
              backgroundColor: isDark ? "#1A1A1B" : "#ffffff",
            },
            headerTintColor: isDark ? "#ffffff" : "#0f172a",
          }}
        />
      </Stack>
    </>
  );
}
