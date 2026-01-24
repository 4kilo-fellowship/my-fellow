import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import React from "react";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="devotions" options={{ title: "Devotions" }} />
          <Stack.Screen name="teams" options={{ title: "Teams" }} />
          <Stack.Screen name="reminders" options={{ title: "Alerts" }} />
          <Stack.Screen name="gifts" options={{ title: "Gifts" }} />
          <Stack.Screen name="programs" options={{ title: "Programs" }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
