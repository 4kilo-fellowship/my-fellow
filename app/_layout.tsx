import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Slot } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    </AuthProvider>
  );
}
