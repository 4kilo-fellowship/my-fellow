import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F9FAFB" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="sign-up-step-1" />
      <Stack.Screen name="sign-up-step-2" />
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}
