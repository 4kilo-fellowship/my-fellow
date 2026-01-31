import ForgotPasswordModal from "@/components/Modals/ForgotPasswordModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
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
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.4;

const signInSchema = z.object({
  phoneNumber: z
    .string()
    .min(9, "Phone number is required")
    .regex(/^\d{9,15}$/, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignIn() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  const onSubmit = async ({ phoneNumber, password }: SignInFormValues) => {
    const trimmedPhone = phoneNumber.trim();

    setLoading(true);
    setLoginError(null);

    try {
      await login(trimmedPhone, password);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      const message = "Invalid phone number or password. Please try again.";
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-white"} `}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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
              {/* header section */}
              <View className="items-center">
                <Image
                  width={24}
                  height={24}
                  style={{ transform: [{ scale: 0.3 }, { translateY: 99 }] }}
                  source={require("@/assets/images/logo-white.png")}
                />
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
            <View
              className={`flex-1 ${isDark ? "bg-dark" : "bg-white"} pt-8 px-6`}
            >
              {/* fields*/}
              <View className="space-y-5">
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
                          className={`w-full ${isDark ? "bg-slate-900 text-white border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-2xl p-4 pl-12 text-base focus:bg-transparent focus:border-primary ${
                            errors.phoneNumber
                              ? "border-red-500"
                              : "focus:border-primary"
                          }`}
                          placeholder="e.g. 0994627985"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="phone-pad"
                          autoCapitalize="none"
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
                          className={`w-full ${isDark ? "bg-slate-900 text-white border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-2xl p-4 pl-12 pr-12 text-base focus:bg-transparent ${
                            errors.password
                              ? "border-red-500"
                              : "focus:border-primary"
                          }`}
                          placeholder="Enter your password"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          value={value}
                          keyboardType="default"
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry={!showPassword}
                        />
                        <View className="absolute left-4 top-4">
                          <Ionicons
                            name="lock-closed-outline"
                            size={22}
                            color={isDark ? "#94a3b8" : "#64748b"}
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() => setShowPassword((prev) => !prev)}
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

                {/* Login error from server (invalid credentials) */}
                {loginError ? (
                  <Text className="text-red-500 text-sm mt-3 ml-1">
                    {loginError}
                  </Text>
                ) : null}

                <ForgotPasswordModal />
              </View>

              {/* Action Buttons */}
              <View className="mt-8 mb-6">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSubmit(onSubmit)}
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
                  <Text
                    className={`${isDark ? "text-slate-400" : "text-slate-600"} font-medium text-base`}
                  >
                    Don&apos;t have an account?{" "}
                  </Text>
                  <Link href="/sign-up-step-1" asChild>
                    <TouchableOpacity activeOpacity={0.8}>
                      <Text className="text-primary font-bold text-base">
                        Register
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                {/* Terms */}
                <View className="mt-6 px-2">
                  <Text
                    className={`text-center text-xs ${isDark ? "text-slate-500" : "text-slate-500"} leading-5`}
                  >
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
