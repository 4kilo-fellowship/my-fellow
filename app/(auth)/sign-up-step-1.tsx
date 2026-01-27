import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.4;

const signUpStep1Schema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^(09|07)\d{8}$/, "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignUpStep1FormValues = z.infer<typeof signUpStep1Schema>;

export default function SignUpStep1() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpStep1FormValues>({
    resolver: zodResolver(signUpStep1Schema),
    defaultValues: {
      fullName: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onNext = (data: SignUpStep1FormValues) => {
    router.push({
      pathname: "/sign-up-step-2",
      params: {
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        password: data.password,
      },
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
          {/* header */}
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
              {/* header button */}
              <View className="absolute top-4 left-6 pt-6">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleBackToLogin}
                  className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border border-white/30 shadow-lg"
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* header Section */}
              <View className="items-center">
                <Image
                  width={24}
                  height={24}
                  style={{ transform: [{ scale: 0.3 }, { translateY: -5 }] }}
                  source={require("@/assets/images/logo-white.png")}
                />
              </View>
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
            {/* Form Container */}
            <View className="flex-1 bg-white pt-8 px-6">
              {/* Form Fields */}
              <View className="space-y-5">
                <View>
                  <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                    Full Name
                  </Text>
                  <Controller
                    control={control}
                    name="fullName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          className={`w-full bg-slate-50 border-2 rounded-2xl p-4 pl-12 text-slate-900 text-base focus:bg-white ${
                            errors.fullName
                              ? "border-red-500"
                              : "border-slate-200 focus:border-primary"
                          }`}
                          placeholder="e.g. Natnael Zerihun"
                          placeholderTextColor="#94a3b8"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
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
                    )}
                  />
                  {errors.fullName?.message ? (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.fullName.message}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                    Phone Number
                  </Text>
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          className={`w-full bg-slate-50 border-2 rounded-2xl p-4 pl-12 text-slate-900 text-base focus:bg-white ${
                            errors.phone
                              ? "border-red-500"
                              : "border-slate-200 focus:border-primary"
                          }`}
                          placeholder="e.g. 0994627985"
                          placeholderTextColor="#94a3b8"
                          keyboardType="phone-pad"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                        <View className="absolute left-4 top-4">
                          <Ionicons
                            name="call-outline"
                            size={22}
                            color="#64748b"
                          />
                        </View>
                      </View>
                    )}
                  />
                  {errors.phone?.message ? (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.phone.message}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                    Password
                  </Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          className={`w-full bg-slate-50 border-2 rounded-2xl p-4 pl-12 pr-12 text-slate-900 text-base focus:bg-white ${
                            errors.password
                              ? "border-red-500"
                              : "border-slate-200 focus:border-primary"
                          }`}
                          placeholder="Create a strong password"
                          placeholderTextColor="#94a3b8"
                          secureTextEntry={!showPassword}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
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
                    )}
                  />
                  {errors.password?.message ? (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.password.message}
                    </Text>
                  ) : null}
                </View>
                <View>
                  <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                    Confirm Password
                  </Text>
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative">
                        <TextInput
                          className={`w-full bg-slate-50 border-2 rounded-2xl p-4 pl-12 pr-12 text-slate-900 text-base focus:bg-white ${
                            errors.confirmPassword
                              ? "border-red-500"
                              : "border-slate-200 focus:border-primary"
                          }`}
                          placeholder="Confirm your password"
                          placeholderTextColor="#94a3b8"
                          secureTextEntry={!showPassword}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
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
                    )}
                  />
                  {errors.confirmPassword?.message ? (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.confirmPassword.message}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Footer / Button */}
              <View className="mt-8 mb-6">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleSubmit(onNext)}
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
