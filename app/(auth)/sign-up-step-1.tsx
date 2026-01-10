import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function SignUpStep1() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
  });

  const handleNext = () => {
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
    <View className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header Background with rounded bottom corners */}
          <View
            className="bg-primary"
            style={{
              height: HEADER_HEIGHT,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <View
              className="flex-1 justify-center items-center px-6"
              style={{ paddingTop: 60 }}
            >
              {/* Back Button */}
              <View className="absolute top-4 left-6 pt-6">
                <TouchableOpacity
                  onPress={handleBackToLogin}
                  className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border border-white/30 shadow-lg"
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Header Section */}
              <View className="items-center">
                <Text className="text-4xl font-black text-white text-center mb-3 tracking-tight">
                  Join 4kilo-ECSF
                </Text>
                <Text className="text-white/90 text-base font-medium text-center leading-6 max-w-[85%]">
                  Grow in faith, fellowship, and purpose together
                </Text>
              </View>
            </View>
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Form Container */}
              <View className="flex-1 bg-white pt-8 px-6">
                {/* Form Fields */}
                <View className="space-y-5">
                  <View>
                    <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                      Full Name
                    </Text>
                    <View className="relative">
                      <TextInput
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 pl-12 text-slate-900 text-base focus:border-primary focus:bg-white"
                        placeholder="e.g. Grace Hopper"
                        placeholderTextColor="#94a3b8"
                        value={form.fullName}
                        onChangeText={(t) => setForm({ ...form, fullName: t })}
                        autoCapitalize="words"
                      />
                      <View className="absolute left-4 top-4">
                        <Ionicons
                          name="person-outline"
                          size={22}
                          color="#64748b"
                        />
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                      Phone Number
                    </Text>
                    <View className="relative">
                      <TextInput
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 pl-12 text-slate-900 text-base focus:border-primary focus:bg-white"
                        placeholder="+1 234 567 890"
                        placeholderTextColor="#94a3b8"
                        keyboardType="phone-pad"
                        value={form.phone}
                        onChangeText={(t) => setForm({ ...form, phone: t })}
                      />
                      <View className="absolute left-4 top-4">
                        <Ionicons
                          name="call-outline"
                          size={22}
                          color="#64748b"
                        />
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
                        placeholder="Create a strong password"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry={!showPassword}
                        value={form.password}
                        onChangeText={(t) => setForm({ ...form, password: t })}
                      />
                      <View className="absolute left-4 top-4">
                        <Ionicons
                          name="lock-closed-outline"
                          size={22}
                          color="#64748b"
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                        className="absolute right-4 top-4"
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-off-outline" : "eye-outline"
                          }
                          size={22}
                          color="#64748b"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Footer / Button */}
                <View className="mt-8 mb-6">
                  <TouchableOpacity
                    onPress={handleNext}
                    className="w-full bg-primary py-5 rounded-2xl shadow-lg shadow-primary/40 flex-row justify-center items-center space-x-2 active:scale-[0.98]"
                  >
                    <Text className="text-white font-bold text-lg tracking-wide">
                      Continue
                    </Text>
                    <Ionicons name="arrow-forward" size={22} color="white" />
                  </TouchableOpacity>

                  <View className="flex-row justify-center mt-6">
                    <Text className="text-slate-600 font-medium text-base">
                      Already have an account?{" "}
                    </Text>
                    <TouchableOpacity onPress={handleBackToLogin}>
                      <Text className="text-primary font-bold text-base">
                        Log In
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}
