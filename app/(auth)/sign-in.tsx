import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          justifyContent: "center",
        }}
      >
        <View className="items-center mb-8">
          <View className="h-16 w-16 bg-primary/10 rounded-full items-center justifyContent-center mb-4">
            <Ionicons name="log-in" size={32} color="#4F46E5" />
          </View>
          <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
          <Text className="text-gray-500 mt-2 text-center">
            Sign in to access your team dashboard
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-1">
              Telegram or Phone
            </Text>
            <TextInput
              placeholder="@username or +1234..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:border-primary focus:border-2"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-1">Password</Text>
            <TextInput
              placeholder="••••••••"
              secureTextEntry
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:border-primary focus:border-2"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity className="self-end mt-2">
              <Text className="text-primary font-medium text-sm">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="w-full bg-primary py-4 rounded-xl shadow-md shadow-primary/40 mt-4 active:opacity-90"
            onPress={() => alert("Login Logic Here")}
          >
            <Text className="text-center text-white font-bold text-lg">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/sign-up-step-1")}>
            <Text className="text-primary font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
