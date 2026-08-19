import AppButton from "@/components/AppButton";
import { useTheme } from "@/context/ThemeContext";
import { useSignupStore } from "@/stores/signup.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Dimensions,
  Image,
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
import { z } from "zod";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.36;

const signUpStep1Schema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^(09|07)\d{8}$/, "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

type SignUpStep1FormValues = z.infer<typeof signUpStep1Schema>;

export default function SignUpStep1() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const phoneInputRef = useRef<TextInput>(null);

  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.focus === "phoneNumber") {
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 500);
    }
  }, [params.focus]);

  const signup = useSignupStore.getState();
  const { control, handleSubmit, formState: { errors } } = useForm<SignUpStep1FormValues>({
    resolver: zodResolver(signUpStep1Schema),
    defaultValues: {
      fullName: signup.fullName || "",
      phoneNumber: signup.phoneNumber || "",
      password: signup.password || "",
    },
  });

  const onNext = async (data: SignUpStep1FormValues) => {
    const phoneNumber = data.phoneNumber.trim();
    useSignupStore.getState().start({
      fullName: data.fullName.trim(),
      phoneNumber,
      password: data.password,
    });
    router.push({
      pathname: "/sign-up-step-2",
      params: {
        fullName: data.fullName.trim(),
        phoneNumber,
        password: data.password,
      },
    });
  };

  const handleBackToLogin = () => {
    router.push("/(auth)/sign-in");
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-white"}`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View
            className="bg-primary overflow-hidden items-center justify-center"
            style={{
              height: HEADER_HEIGHT,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <View className="flex-1 w-full justify-center items-center pt-10">
              <Image
                source={require("@/assets/images/logo-white.png")}
                style={{ width: "135%", height: "135%" }}
                resizeMode="contain"
              />
            </View>
          </View>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View
              className={`flex-1 ${isDark ? "bg-dark" : "bg-white"} pt-10 px-6`}
            >
              <View className="space-y-5">
                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-800"} font-bold mb-3 ml-1 text-base`}
                  >
                    Full Name
                  </Text>
                  <Controller
                    control={control}
                    name="fullName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          className={`w-full ${isDark ? "bg-slate-900 text-white focus:border-primary border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-2xl p-4 pl-12 text-base focus:bg-transparent ${
                            errors.fullName
                              ? "border-red-500"
                              : "focus:border-primary"
                          }`}
                          placeholder="e.g. Samuel Kebede"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="words"
                          textContentType="name"
                          autoComplete="name"
                          importantForAutofill="yes"
                        />
                        <View className="absolute left-4 top-4">
                          <Ionicons
                            name="person-outline"
                            size={22}
                            color={isDark ? "#94a3b8" : "#64748b"}
                          />
                        </View>
                      </View>
                    )}
                  />
                  {errors.fullName?.message ? (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.fullName.message}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-800"} font-bold mb-3 ml-1 text-base`}
                  >
                    Phone Number
                  </Text>
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          ref={phoneInputRef}
                          className={`w-full ${isDark ? "bg-slate-900 text-white focus:border-primary border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-2xl p-4 pl-12 text-base focus:bg-transparent ${
                            errors.phoneNumber
                              ? "border-red-500"
                              : "focus:border-primary"
                          }`}
                          placeholder="0911234567"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          keyboardType="phone-pad"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          textContentType="username"
                          autoComplete="username"
                          importantForAutofill="yes"
                        />
                        <View className="absolute left-4 top-4">
                          <Ionicons
                            name="call-outline"
                            size={22}
                            color={isDark ? "#94a3b8" : "#64748b"}
                          />
                        </View>
                      </View>
                    )}
                  />
                  {errors.phoneNumber?.message ? (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.phoneNumber.message}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-800"} font-bold mb-3 ml-1 text-base`}
                  >
                    Password
                  </Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          className={`w-full ${isDark ? "bg-slate-900 text-white focus:border-primary border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-2xl p-4 pl-12 pr-12 text-base focus:bg-transparent ${
                            errors.password
                              ? "border-red-500"
                              : "focus:border-primary"
                          }`}
                          placeholder="Create a strong password"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          secureTextEntry={!showPassword}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          textContentType="newPassword"
                          autoComplete="password-new"
                          importantForAutofill="yes"
                        />
                        <View className="absolute left-4 top-4">
                          <Ionicons
                            name="lock-closed-outline"
                            size={22}
                            color={isDark ? "#94a3b8" : "#64748b"}
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
                            color={isDark ? "#94a3b8" : "#64748b"}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errors.password?.message ? (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.password.message}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="mt-8 mb-6">
                <AppButton
                  title="Continue"
                  icon="arrow-forward"
                  iconPosition="right"
                  onPress={handleSubmit(onNext)}
                  isDark={isDark}
                  variant="primary"
                  size="lg"
                />

                <View className="flex-row justify-center mt-6">
                  <Text
                    className={`${isDark ? "text-slate-400" : "text-slate-600"} font-medium text-base`}
                  >
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={handleBackToLogin}
                    activeOpacity={0.9}
                  >
                    <Text className="text-primary font-bold text-base">
                      Log In
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}
