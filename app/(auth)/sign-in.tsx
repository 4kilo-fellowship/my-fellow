import AppButton from "@/components/AppButton";
import AuthIcon from "@/components/AuthIcon";
import ForgotPasswordModal from "@/components/Modals/ForgotPasswordModal";
import { NativeAlert } from "@/components/NativeAlert";
import { NativeRipplePressable } from "@/components/NativeRipplePressable";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { formatErrorMessage } from "@/utils/alertUtils";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useEffect, useState } from "react";
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
  const [isPhoneFocused, setIsPhoneFocused] = useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ verifiedPhone?: string }>();
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
  });
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const headerHeight = useHeaderHeight();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  useEffect(() => {
    if (params.verifiedPhone) {
      setValue("phoneNumber", params.verifiedPhone);
      setAlertConfig({
        visible: true,
        title: "Success",
        message: "Phone number verified.",
        type: "success",
      });
    }
  }, [params.verifiedPhone, setValue]);

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

    try {
      await login(trimmedPhone, password);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      const formatted = formatErrorMessage(err);
      setAlertConfig({
        visible: true,
        title: formatted.title,
        message: formatted.message,
        type: "error",
      });
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
              <View className="flex-col gap-6">
                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-700"} font-semibold mb-2 ml-1 text-sm`}
                  >
                    Phone Number
                  </Text>
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        style={{
                          width: "100%",
                          height: 58,
                          position: "relative",
                          justifyContent: "center",
                        }}
                      >
                        <TextInput
                          style={{
                            width: "100%",
                            height: 58,
                            borderRadius: 22,
                            paddingLeft: 50,
                            paddingRight: 16,
                            textAlignVertical: "center",
                            fontSize: 16,
                            borderWidth: 2,
                            borderColor: isPhoneFocused
                              ? "#ff6719"
                              : isDark
                                ? "#1e293b"
                                : "#e2e8f0",
                            backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                            color: isDark ? "#ffffff" : "#0f172a",
                          }}
                          placeholder="0911234567"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setIsPhoneFocused(true)}
                          onBlur={() => {
                            onBlur();
                            setIsPhoneFocused(false);
                          }}
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
                            top: 0,
                            bottom: 0,
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
                    <Text className="text-red-500 text-xs mt-1.5 ml-1">
                      {errors.phoneNumber.message}
                    </Text>
                  ) : null}
                </View>
                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-700"} font-semibold mb-2 ml-1 text-sm`}
                  >
                    Password
                  </Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        style={{
                          width: "100%",
                          height: 58,
                          position: "relative",
                          justifyContent: "center",
                        }}
                      >
                        <TextInput
                          style={{
                            width: "100%",
                            height: 58,
                            borderRadius: 22,
                            paddingLeft: 50,
                            paddingRight: 56,
                            textAlignVertical: "center",
                            fontSize: 16,
                            borderWidth: 2,
                            borderColor: isPasswordFocused
                              ? "#ff6719"
                              : isDark
                                ? "#1e293b"
                                : "#e2e8f0",
                            backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                            color: isDark ? "#ffffff" : "#0f172a",
                          }}
                          placeholder="Enter your password"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => {
                            onBlur();
                            setIsPasswordFocused(false);
                          }}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          textContentType="password"
                          autoComplete="password"
                          importantForAutofill="yes"
                        />
                        <View
                          style={{
                            position: "absolute",
                            left: 16,
                            top: 0,
                            bottom: 0,
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
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          android_ripple={{
                            color: isDark
                              ? "rgba(255, 255, 255, 0.2)"
                              : "rgba(0, 0, 0, 0.12)",
                            borderless: true,
                            radius: 22,
                            foreground: false,
                          }}
                          style={{
                            position: "absolute",
                            right: 4,
                            top: 0,
                            height: 58,
                            width: 52,
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 10,
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
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
                    <Text className="text-red-500 text-xs mt-1.5 ml-1">
                      {errors.password.message}
                    </Text>
                  ) : null}
                </View>

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
                  <NativeRipplePressable
                    onPress={() => router.push("/sign-up-step-1")}
                    isDark={isDark}
                  >
                    <Text className="text-primary font-bold text-base">
                      Register
                    </Text>
                  </NativeRipplePressable>
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

      <NativeAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        isDark={isDark}
        type={alertConfig.type}
      />
    </View>
  );
}

