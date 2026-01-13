import { ThemeProvider } from "@/context/ThemeContext";
import { Slot } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}
