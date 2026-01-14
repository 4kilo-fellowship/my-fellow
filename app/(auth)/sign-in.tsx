import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.4;

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleSignIn = async () => {
    // Basic validation
    if (!phoneNumber.trim() || !password.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter both phone number and password."
      );
      return;
    }

    setLoading(true);

    try {
      await login(phoneNumber.trim(), password);
      // Navigation will be handled by AuthProvider/auth state
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error.response?.data?.message ||
          error.message ||
          "Invalid phone number or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* head */}
          <View
            className="bg-primary"
            style={{
              height: HEADER_HEIGHT,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <View className="flex-1 justify-center items-center px-6">
              {/* Header Section */}
              <View className="items-center">
                <Text className="text-white text-5xl font-black text-center tracking-tight">
                  4kilo-ECSF
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* form */}
            <View className="flex-1 bg-white pt-8 px-6">
              {/* fields*/}
              <View className="space-y-5">
                <View>
                  <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                    Phone Number
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 pl-12 text-slate-900 text-base focus:border-primary focus:bg-white"
                      placeholder="e.g. 0994627985"
                      placeholderTextColor="#94a3b8"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                    />
                    <View className="absolute left-4 top-4">
                      <Ionicons name="call-outline" size={22} color="#64748b" />
                    </View>
                  </View>
                </View>

                <View>
                  <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                    Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 pl-12 pr-12 text-slate-900 text-base focus:border-primary focus:bg-white"
                      placeholder="Enter your password"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      keyboardType="default"
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <View className="absolute left-4 top-4">
                      <Ionicons
                        name="lock-closed-outline"
                        size={22}
                        color="#64748b"
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowPassword((prev) => !prev)}
                      activeOpacity={0.7}
                      className="absolute right-4 top-4"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#64748b"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.9}
                  className="items-end mt-2"
                >
                  <Text className="text-primary font-bold text-base">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View className="mt-8 mb-6">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleSignIn}
                  disabled={loading}
                  className="w-full bg-primary py-5 rounded-2xl shadow-lg shadow-primary/40 items-center justify-center active:scale-[0.98] flex-row"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-bold text-lg">
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Footer */}
                <View className="flex-row justify-center mt-6">
                  <Text className="text-slate-600 font-medium text-base">
                    Don&apos;t have an account?{" "}
                  </Text>
                  <Link href="/sign-up-step-1" asChild>
                    <TouchableOpacity activeOpacity={0.9}>
                      <Text className="text-primary font-bold text-base">
                        Register
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                {/* Terms */}
                <View className="mt-6 px-2">
                  <Text className="text-center text-xs text-slate-500 leading-5">
                    By signing in, you agree to our{" "}
                    <Text className="text-primary font-bold">Terms of Use</Text>{" "}
                    and{" "}
                    <Text className="text-primary font-bold">
                      Privacy Policy
                    </Text>
                    .
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}
