import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSignIn = (): void => {
    // Add auth logic here
    console.log("Sign In", name, password);
    // router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      {/* header */}
      <View className="mb-10">
        <Text className="text-3xl font-bold text-slate-900">Welcome Back</Text>
        <Text className="text-slate-500 mt-2 text-base">
          Sign in to grow, connect, and walk together in Christ
        </Text>
      </View>

      {/* Form */}
      <View className="space-y-5">
        <View>
          <Text className="text-slate-600 font-medium mb-2 ml-1">
            Full Name
          </Text>
          <TextInput
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-primary focus:bg-white"
            placeholder="Natnael Zerihun"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View>
          <Text className="text-slate-600 font-medium mb-2 ml-1">Password</Text>

          <View className="flex-row items-center w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 focus:border-primary focus:bg-white">
            <TextInput
              className="flex-1 py-4 text-slate-900"
              placeholder="Enter your password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#0f172a"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity className="items-end">
          <Text className="text-primary font-medium">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View className="mt-10">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignIn}
          className="w-full bg-primary py-4 rounded-2xl shadow-sm shadow-primary/30"
        >
          <Text className="text-white text-center font-bold text-lg">
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="flex-row justify-center mt-8">
        <Text className="text-slate-500">Don't have an account? </Text>
        <Link href="/sign-up-step-1" asChild>
          <TouchableOpacity>
            <Text className="text-primary font-bold">Register</Text>
          </TouchableOpacity>
        </Link>
      </View>
      {/* Terms & Privacy */}
      <View className="mt-6 px-4">
        <Text className="text-center text-xs text-slate-500 leading-5">
          By signing in, you agree to our{" "}
          <Link href="/terms" asChild>
            <Text className="text-primary font-medium">Terms of Use</Text>
          </Link>{" "}
          and{" "}
          <Link href="/privacy" asChild>
            <Text className="text-primary font-medium">Privacy Policy</Text>
          </Link>
          .
        </Text>
      </View>
    </SafeAreaView>
  );
}
