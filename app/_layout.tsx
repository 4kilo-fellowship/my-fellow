import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import Toast from "react-native-toast-message";
import "./global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: "Splash" }} />
          <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
          <Stack.Screen name="(auth)" options={{ title: "Auth" }} />
          <Stack.Screen name="events/[id]" options={{ title: "Events" }} />
          <Stack.Screen name="teams/[id]" options={{ title: "Teams" }} />
          <Stack.Screen name="leaders" options={{ title: "Leaders" }} />
          <Stack.Screen name="locations" options={{ title: "Locations" }} />
          <Stack.Screen name="programs" options={{ title: "Programs" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
        </Stack>
        <Toast />
      </ThemeProvider>
    </AuthProvider>
  );
}
