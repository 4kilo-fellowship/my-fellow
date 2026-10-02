import AppButton from "@/components/AppButton";
import AuthIcon from "@/components/AuthIcon";
import { InfoModal } from "@/components/Modals/InfoModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSignupStore } from "@/stores/signup.store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.28;

export default function OtpVerify() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const headerHeight = useHeaderHeight();
  const { verifyOtp, requestOtp } = useAuth();
  const signupStore = useSignupStore();

  const phoneNumber =
    (params.phoneNumber as string) || signupStore.phoneNumber || "";
  const purpose =
    ((params.purpose as "signup" | "reset-password") || "signup") as
      | "signup"
      | "reset-password";

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [resending, setResending] = useState<boolean>(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "error" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "error",
  });

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Auto countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const otpCode = otpDigits.join("");
  const isFilled = otpCode.length === 6 && /^\d{6}$/.test(otpCode);
  const isButtonDisabled = !isFilled || loading;

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");

    // Handle full paste
    if (cleaned.length === 6) {
      const nextDigits = cleaned.split("");
      setOtpDigits(nextDigits);
      inputRefs.current[5]?.focus();
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = cleaned.slice(-1);
    setOtpDigits(nextDigits);

    // Auto-advance
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === "Backspace" && !otpDigits[index] && index > 0) {
      const nextDigits = [...otpDigits];
      nextDigits[index - 1] = "";
      setOtpDigits(nextDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isFilled) return;

    setLoading(true);
    try {
      const response = await verifyOtp(phoneNumber, otpCode, purpose);
      const token = response.verificationToken;

      if (purpose === "signup") {
        signupStore.setVerificationToken(token);
        signupStore.setStep("signup-step-2");

        router.push({
          pathname: "/sign-up-step-2",
          params: {
            fullName: signupStore.fullName,
            phoneNumber,
            password: signupStore.password,
            verificationToken: token,
          },
        });
      } else {
        router.push({
          pathname: "/(auth)/sign-in",
          params: { verifiedPhone: phoneNumber },
        });
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Invalid or expired verification code.";
      setErrorModal({
        visible: true,
        title: "Verification Failed",
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);

    try {
      await requestOtp(phoneNumber, purpose);
      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setErrorModal({
        visible: true,
        title: "Code Sent",
        message: `A new 6-digit code has been sent via SMS to ${phoneNumber}.`,
        type: "info",
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to resend code. Please try again shortly.";
      setErrorModal({
        visible: true,
        title: "Resend Failed",
        message,
        type: "error",
      });
    } finally {
      setResending(false);
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
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View
              className={`flex-1 ${isDark ? "bg-dark" : "bg-white"} pt-10 px-6`}
            >
              <View className="items-center mb-6">
                <View
                  className={`w-14 h-14 rounded-full items-center justify-center mb-3 ${
                    isDark ? "bg-zinc-800" : "bg-orange-50"
                  }`}
                >
                  <AuthIcon name="lock" size={28} color="#ff6719" />
                </View>
                <Text
                  className={`text-2xl font-bold mb-1 text-center ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Verification Code
                </Text>
                <Text
                  className={`text-sm text-center px-4 leading-5 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  We have sent a 6-digit secure code via SMS to{" "}
                  <Text className="font-bold text-primary">{phoneNumber}</Text>
                </Text>
              </View>

              {/* 6 Digit OTP input */}
              <View className="flex-row justify-between items-center my-4 px-1">
                {otpDigits.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(val) => handleDigitChange(index, val)}
                    onKeyPress={(e) => handleKeyPress(index, e)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    style={[
                      styles.otpBox,
                      {
                        borderColor: digit
                          ? "#ff6719"
                          : isDark
                            ? "#334155"
                            : "#e2e8f0",
                        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                        color: isDark ? "#ffffff" : "#0f172a",
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Resend Cooldown */}
              <View className="flex-row justify-center items-center mt-3">
                <Text
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Didn&apos;t receive code?{" "}
                </Text>
                {resendCooldown > 0 ? (
                  <Text className="text-primary font-bold text-sm">
                    Resend in {resendCooldown}s
                  </Text>
                ) : (
                  <Pressable
                    onPress={handleResend}
                    disabled={resending}
                    className="px-1 py-0.5"
                  >
                    <Text className="text-primary font-bold text-sm">
                      {resending ? "Sending..." : "Resend Code"}
                    </Text>
                  </Pressable>
                )}
              </View>

              <View className="mt-8 mb-6">
                <AppButton
                  title="Verify & Continue"
                  icon="checkmark-circle"
                  iconPosition="right"
                  onPress={handleVerify}
                  loading={loading}
                  disabled={isButtonDisabled}
                  isDark={isDark}
                  variant="primary"
                  size="lg"
                />

                <View className="flex-row justify-center mt-5 items-center">
                  <Pressable
                    onPress={() => router.back()}
                    className="px-2 py-1"
                  >
                    <Text
                      className={`${
                        isDark ? "text-slate-400" : "text-slate-600"
                      } font-medium text-sm`}
                    >
                      Change Phone Number
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
        type={errorModal.type || "error"}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
  },
});
