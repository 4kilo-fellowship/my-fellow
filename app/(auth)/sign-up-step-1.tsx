import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function SignUpStep1() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
  });

  const handleNext = () => {
    // Basic validation
    if (!form.fullName || !form.password) return;

    router.push({
      pathname: "/sign-up-step-2",
      params: { ...form },
    });
  };

  const handleBackToLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/sign-in");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              className="mt-4 items-start"
            >
              <TouchableOpacity
                onPress={handleBackToLogin}
                className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
              >
                <Ionicons name="arrow-back" size={20} color="#334155" />
              </TouchableOpacity>
            </Animated.View>

            {/* Header Section */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              className="mt-8 mb-10 items-center"
            >
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                <Ionicons name="people" size={32} color="#4F46E5" />
              </View>
              <Text className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
                Join the Fellowship
              </Text>
              <Text className="text-slate-500 mt-3 text-base text-center font-medium leading-6 max-w-[80%]">
                Grow in faith, fellowship, and purpose together
              </Text>
            </Animated.View>

            {/* Form Fields */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              className="space-y-6"
            >
              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">
                  Full Name
                </Text>
                <TextInput
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-base focus:border-primary focus:bg-white"
                  placeholder="e.g. Grace Hopper"
                  placeholderTextColor="#94a3b8"
                  value={form.fullName}
                  onChangeText={(t) => setForm({ ...form, fullName: t })}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">
                  Phone Number
                </Text>
                <TextInput
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-base focus:border-primary focus:bg-white"
                  placeholder="+1 234 567 890"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(t) => setForm({ ...form, phone: t })}
                />
              </View>

              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-slate-900 text-base focus:border-primary focus:bg-white"
                    placeholder="Create a strong password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={form.password}
                    onChangeText={(t) => setForm({ ...form, password: t })}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
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
            </Animated.View>

            {/* Footer / Button */}
            <Animated.View
              entering={FadeInUp.delay(500).duration(500)}
              className="mt-auto pt-10 pb-6"
            >
              <TouchableOpacity
                onPress={handleNext}
                className="w-full bg-primary py-4 rounded-2xl shadow-lg shadow-primary/40 flex-row justify-center items-center space-x-2 active:scale-[0.98]"
              >
                <Text className="text-white font-bold text-lg tracking-wide">
                  Continue
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>

              <View className="flex-row justify-center mt-6">
                <Text className="text-slate-500 font-medium">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={handleBackToLogin}>
                  <Text className="text-primary font-bold">Log In</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
