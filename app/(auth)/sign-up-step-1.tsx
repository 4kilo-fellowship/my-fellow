import AppButton from "@/components/AppButton";
import AuthIcon from "@/components/AuthIcon";
import { InfoModal } from "@/components/Modals/InfoModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSignupStore } from "@/stores/signup.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useEffect, useRef, useState } from "react";
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
import { z } from "zod";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.28;

const signUpStep1Schema = z.object({
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
  const headerHeight = useHeaderHeight();

  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.focus === "phoneNumber") {
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 500);
    }
  }, [params.focus]);

  const signup = useSignupStore.getState();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpStep1FormValues>({
    resolver: zodResolver(signUpStep1Schema),
    defaultValues: {
      fullName: signup.fullName || "",
      phoneNumber: signup.phoneNumber || "",
      password: signup.password || "",
    },
  });

  const fullNameValue = watch("fullName");
  const phoneNumberValue = watch("phoneNumber");
  const passwordValue = watch("password");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });
  const { requestOtp } = useAuth();

  const isFilled = Boolean(
    fullNameValue && fullNameValue.trim().length >= 3 &&
    phoneNumberValue && /^(09|07)\d{8}$/.test(phoneNumberValue.trim()) &&
    passwordValue && passwordValue.trim().length >= 6
  );

  const isButtonDisabled = !isFilled || loading;

  const onNext = async (data: SignUpStep1FormValues) => {
    const phoneNumber = data.phoneNumber.trim();
    setLoading(true);

    // Save signup data regardless of OTP success
    useSignupStore.getState().start({
      fullName: data.fullName.trim(),
      phoneNumber,
      password: data.password,
    });

    try {
      await requestOtp(phoneNumber, "signup");

      // OTP sent successfully — go to OTP verification screen
      router.push({
        pathname: "/otp-verify",
        params: {
          phoneNumber,
          purpose: "signup",
        },
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "";

      // If the phone is already registered, show error and don't proceed
      const isRegistered =
        message.toLowerCase().includes("already registered") ||
        message.toLowerCase().includes("already exists");

      if (isRegistered) {
        setErrorModal({
          visible: true,
          title: "Phone Already Registered",
          message,
        });
      } else {
        // OTP service unavailable (API key, network, etc.)
        // Skip OTP — proceed directly to step 2, user will be verified later
        router.push({
          pathname: "/sign-up-step-2",
          params: {
            fullName: data.fullName.trim(),
            phoneNumber,
            password: data.password,
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };


  const handleBackToLogin = () => {
    router.push("/(auth)/sign-in");
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
                style={{ width: "150%", height: "150%" }}
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
              <View className="flex-col gap-6">
                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-700"} font-semibold mb-2 ml-1 text-sm`}
                  >
                    Full Name
                  </Text>
                  <Controller
                    control={control}
                    name="fullName"
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
                          className={`w-full ${isDark ? "bg-slate-900 text-white focus:border-primary border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-[22px] text-base focus:bg-transparent focus:border-primary`}
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
                            name="person"
                            size={23}
                            color={isDark ? "#cbd5e1" : "#475569"}
                          />
                        </View>
                      </View>
                    )}
                  />
                  {errors.fullName?.message ? (
                    <Text className="text-red-500 text-xs mt-1.5 ml-1">
                      {errors.fullName.message}
                    </Text>
                  ) : null}
                </View>

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
                        style={{ height: 58, justifyContent: "center" }}
                        className="relative"
                      >
                        <TextInput
                          ref={phoneInputRef}
                          style={{
                            height: 58,
                            borderRadius: 22,
                            paddingLeft: 50,
                            paddingRight: 16,
                            textAlignVertical: "center",
                            includeFontPadding: false,
                          }}
                          className={`w-full ${isDark ? "bg-slate-900 text-white focus:border-primary border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-[22px] text-base focus:bg-transparent focus:border-primary`}
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
                          className={`w-full ${isDark ? "bg-slate-900 text-white focus:border-primary border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-[22px] text-base focus:bg-transparent focus:border-primary`}
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
                          onPress={() => setShowPassword(!showPassword)}
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
                    <Text className="text-red-500 text-xs mt-1.5 ml-1">
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
                    Already have an account?{" "}
                  </Text>
                  <Pressable
                    onPress={handleBackToLogin}
                    className="px-1 py-0.5"
                  >
                    <Text className="text-primary font-bold text-base">
                      Log In
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <InfoModal
        visible={errorModal.visible}
        onClose={() => setErrorModal((prev) => ({ ...prev, visible: false }))}
        title={errorModal.title}
        message={errorModal.message}
        type="error"
        isDark={isDark}
      />
    </View>
  );
}

