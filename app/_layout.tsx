import { ThemeProvider } from "@/context/ThemeContext";
import { Stack } from "expo-router";
import "./global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
