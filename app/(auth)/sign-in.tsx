import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSignIn = (): void => {
    console.log("Sign In", name, password);
    // router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              justifyContent: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header - Centered & Consistent with Sign Up */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              className="items-center mb-10"
            >
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                <Ionicons name="log-in" size={32} color="#4F46E5" />
              </View>
              <Text className="text-3xl font-extrabold text-slate-900 text-center">
                Welcome Back
              </Text>
              <Text className="text-slate-500 mt-2 text-base font-medium text-center leading-6 max-w-[80%]">
                Sign in to grow, connect, and walk together in Christ
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              className="space-y-5"
            >
              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">
                  Full Name
                </Text>
                <TextInput
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-base focus:border-primary focus:bg-white"
                  placeholder="e.g., Natnael Zerihun"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">
                  Password
                </Text>
                <View className="flex-row items-center w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 focus:border-primary focus:bg-white">
                  <TextInput
                    className="flex-1 py-4 text-slate-900 text-base"
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    activeOpacity={0.7}
                    className="p-2"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity className="items-end">
                <Text className="text-primary font-bold">Forgot Password?</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View
              entering={FadeInUp.delay(500).duration(500)}
              className="mt-10"
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSignIn}
                className="w-full bg-primary py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98]"
              >
                <Text className="text-white text-center font-bold text-lg">
                  Sign In
                </Text>
              </TouchableOpacity>

              {/* Footer */}
              <View className="flex-row justify-center mt-8">
                <Text className="text-slate-500 font-medium">
                  Don't have an account?{" "}
                </Text>
                <Link href="/sign-up-step-1" asChild>
                  <TouchableOpacity>
                    <Text className="text-primary font-bold">Register</Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Terms */}
              <View className="mt-6 px-4">
                <Text className="text-center text-xs text-slate-500 leading-5">
                  By signing in, you agree to our{" "}
                  <Text className="text-primary font-bold">Terms of Use</Text>{" "}
                  and{" "}
                  <Text className="text-primary font-bold">Privacy Policy</Text>
                  .
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
