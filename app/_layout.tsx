import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { FontAwesome5, Ionicons, Octicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    ...Octicons.font,
    ...FontAwesome5.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

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
          <Stack.Screen
            name="reminders/manage"
            options={{ title: "Manage Alert" }}
          />
        </Stack>
        <Toast />
      </ThemeProvider>
    </AuthProvider>
  );
}
