import AppButton from "@/components/AppButton";
import AuthIcon from "@/components/AuthIcon";
import ForgotPasswordModal from "@/components/Modals/ForgotPasswordModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Link, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.28;

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
  const headerHeight = useHeaderHeight();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  const phoneNumberValue = watch("phoneNumber");
  const passwordValue = watch("password");

  const isFilled = Boolean(
    phoneNumberValue && phoneNumberValue.trim().length >= 9 &&
    passwordValue && passwordValue.trim().length >= 6
  );

  const isButtonDisabled = !isFilled;

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
    } catch {
      const message = "Invalid phone number or password. Please try again.";
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-white"}`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 20}
        >
          <View
            className="bg-primary relative overflow-hidden items-center justify-center"
            style={{
              height: HEADER_HEIGHT,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <View className="flex-1 w-full justify-center items-center pt-10">
              <Image
                source={require("@/assets/images/logo-white.png")}
                style={{ width: "150%", height: "150%" }}
                resizeMode="contain"
              />
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
            <View
              className={`flex-1 ${isDark ? "bg-dark" : "bg-white"} pt-14 px-6`}
            >
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
                      <View
                        style={{ height: 58, justifyContent: "center" }}
                        className="relative"
                      >
                        <TextInput
                          style={{
                            height: 58,
                            borderRadius: 22,
                            paddingLeft: 50,
                            paddingRight: 16,
                            textAlignVertical: "center",
                            includeFontPadding: false,
                          }}
                          className={`w-full ${isDark ? "bg-slate-900 text-white border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-[22px] text-base focus:bg-transparent focus:border-primary`}
                          placeholder="0911234567"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="phone-pad"
                          autoCapitalize="none"
                          textContentType="username"
                          autoComplete="username"
                          importantForAutofill="yes"
                        />
                        <View
                          style={{
                            position: "absolute",
                            left: 16,
                            height: 58,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          pointerEvents="none"
                        >
                          <AuthIcon
                            name="phone"
                            size={23}
                            color={isDark ? "#cbd5e1" : "#475569"}
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
                      <View
                        style={{ height: 58, justifyContent: "center" }}
                        className="relative"
                      >
                        <TextInput
                          style={{
                            height: 58,
                            borderRadius: 22,
                            paddingLeft: 50,
                            paddingRight: 50,
                            textAlignVertical: "center",
                            includeFontPadding: false,
                          }}
                          className={`w-full ${isDark ? "bg-slate-900 text-white border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-[22px] text-base focus:bg-transparent focus:border-primary`}
                          placeholder="Enter your password"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          value={value}
                          keyboardType="default"
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry={!showPassword}
                          textContentType="password"
                          autoComplete="password"
                          importantForAutofill="yes"
                        />
                        <View
                          style={{
                            position: "absolute",
                            left: 16,
                            height: 58,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          pointerEvents="none"
                        >
                          <AuthIcon
                            name="lock"
                            size={23}
                            color={isDark ? "#cbd5e1" : "#475569"}
                          />
                        </View>
                        <Pressable
                          onPress={() => setShowPassword((prev) => !prev)}
                          hitSlop={8}
                          android_ripple={{
                            color: isDark
                              ? "rgba(255, 255, 255, 0.2)"
                              : "rgba(0, 0, 0, 0.12)",
                            borderless: true,
                            radius: 20,
                            foreground: true,
                          }}
                          style={{
                            position: "absolute",
                            right: 12,
                            height: 58,
                            width: 44,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <AuthIcon
                            name={showPassword ? "eye-off" : "eye"}
                            size={23}
                            color={isDark ? "#cbd5e1" : "#475569"}
                          />
                        </Pressable>
                      </View>
                    )}
                  />
                  {errors.password?.message ? (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.password.message}
                    </Text>
                  ) : null}
                </View>

                {loginError ? (
                  <Text className="text-red-500 text-sm mt-3 ml-1">
                    {loginError}
                  </Text>
                ) : null}

                <View className="items-end">
                  <ForgotPasswordModal />
                </View>
              </View>

              <View className="mt-8 mb-6">
                <AppButton
                  title="Sign In"
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  disabled={isButtonDisabled}
                  isDark={isDark}
                  variant="primary"
                  size="lg"
                />

                <View className="flex-row justify-center mt-6 items-center">
                  <Text
                    className={`${isDark ? "text-slate-400" : "text-slate-600"} font-medium text-base`}
                  >
                    Don&apos;t have an account?{" "}
                  </Text>
                  <Link href="/sign-up-step-1" asChild>
                    <Pressable className="px-1 py-0.5">
                      <Text className="text-primary font-bold text-base">
                        Register
                      </Text>
                    </Pressable>
                  </Link>
                </View>

                <View className="mt-6 px-2">
                  <Text
                    className={`text-center text-xs ${isDark ? "text-slate-500" : "text-slate-500"} leading-5`}
                  >
                    By signing in, you agree to our{" "}
                    <Text
                      className="text-primary font-bold text-xs"
                      onPress={() => router.push("/(auth)/legal?section=terms")}
                    >
                      Terms of Use
                    </Text>{" "}
                    and{" "}
                    <Text
                      className="text-primary font-bold text-xs"
                      onPress={() =>
                        router.push("/(auth)/legal?section=privacy")
                      }
                    >
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
