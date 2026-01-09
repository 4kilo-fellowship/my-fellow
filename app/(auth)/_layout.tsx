import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
          animation: "slide_from_right",
          gestureEnabled: true,
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up-step-1" />
        <Stack.Screen name="sign-up-step-2" />
      </Stack>
    </View>
  );
}
