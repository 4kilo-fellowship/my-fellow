import { Stack } from "expo-router";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View className="flex-1 bg-white">
      <Stack
        screenOptions={{
          headerShown: false, // We will build custom headers for a premium feel
          contentStyle: { backgroundColor: "white" },
          animation: "slide_from_right", // Smooth transitions
        }}
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up-step-1" />
        <Stack.Screen name="sign-up-step-2" />
      </Stack>
    </View>
  );
}
