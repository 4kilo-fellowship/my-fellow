import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
          animation: "fade",
          gestureEnabled: true,
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up-step-1" />
        <Stack.Screen name="sign-up-step-2" />
      </Stack>
    </>
  );
}
