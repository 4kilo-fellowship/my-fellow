import AppButton from "@/components/AppButton";
import { InfoModal } from "@/components/Modals/InfoModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSignupStore } from "@/stores/signup.store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useEffect, useRef, useState } from "react";
import {
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
import { SafeAreaView } from "react-native-safe-area-context";

const OTP_LENGTH = 6;

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

  const [otpCode, setOtpCode] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [resending, setResending] = useState<boolean>(false);
  const [cursorVisible, setCursorVisible] = useState<boolean>(true);
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

  const textInputRef = useRef<TextInput | null>(null);

  // Blinking cursor effect for active dash slot
  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 550);
    return () => clearInterval(timer);
  }, []);

  // Auto countdown for resend timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const isFilled = otpCode.length === OTP_LENGTH && /^\d{6}$/.test(otpCode);
  const isButtonDisabled = !isFilled || loading;

  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtpCode(cleaned);

    if (cleaned.length === OTP_LENGTH) {
      Keyboard.dismiss();
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
        message: `${message}\n\nYou can also choose to continue now and verify your phone number later.`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLater = () => {
    if (purpose === "signup") {
      signupStore.setStep("signup-step-2");
      router.push({
        pathname: "/sign-up-step-2",
        params: {
          fullName: signupStore.fullName,
          phoneNumber,
          password: signupStore.password,
        },
      });
    } else {
      router.push({
        pathname: "/(auth)/sign-in",
        params: { verifiedPhone: phoneNumber },
      });
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);

    try {
      await requestOtp(phoneNumber, purpose);
      setResendCooldown(60);
      setOtpCode("");
      textInputRef.current?.focus();
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
        message: `${message}\n\nYou can tap 'Verify Later' below if SMS delivery is delayed.`,
        type: "error",
      });
    } finally {
      setResending(false);
    }
  };

  const handleSlotPress = () => {
    textInputRef.current?.focus();
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 20}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "space-between",
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 28,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Top Section */}
            <View>
              {/* Simple black & white dash indicator at the top */}
              <View
                style={[
                  styles.topDash,
                  {
                    backgroundColor: isDark ? "#ffffff" : "#0f172a",
                  },
                ]}
              />

              {/* Title & Centered Symmetrical Text Positioning */}
              <View className="items-center mb-6">
                <Text
                  className={`text-2xl sm:text-3xl font-bold tracking-tight text-center mb-2.5 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Verification Code
                </Text>

                <Text
                  className={`text-sm text-center leading-6 px-4 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Enter the 6-digit code sent to{"\n"}
                  <Text
                    className={`text-base font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {phoneNumber || "your phone number"}
                  </Text>
                </Text>

                {/* Symmetrical Edit Phone Action */}
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={8}
                  android_ripple={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(0, 0, 0, 0.08)",
                    borderless: true,
                    radius: 20,
                  }}
                  style={({ pressed }) => [
                    Platform.OS === "ios" && pressed
                      ? { opacity: 0.6 }
                      : undefined,
                  ]}
                  className="mt-2 py-1 px-3.5 rounded-full"
                >
                  <Text className="text-primary font-semibold text-xs tracking-wide">
                    Wrong number? Edit
                  </Text>
                </Pressable>
              </View>

              {/* Center Dash OTP Slots */}
              <View className="my-6 items-center justify-center">
                <Pressable
                  onPress={handleSlotPress}
                  className="flex-row items-center justify-center gap-3 relative py-2"
                >
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                    const char = otpCode[index] || "";
                    const isSlotActive =
                      isFocused &&
                      (index === otpCode.length ||
                        (index === OTP_LENGTH - 1 &&
                          otpCode.length === OTP_LENGTH));
                    const isFilledSlot = Boolean(char);

                    return (
                      <View
                        key={index}
                        style={styles.slotContainer}
                        className="items-center justify-end"
                      >
                        {/* Digit or Cursor */}
                        <View className="h-12 justify-center items-center">
                          {isFilledSlot ? (
                            <Text
                              className={`text-3xl font-bold ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {char}
                            </Text>
                          ) : isSlotActive && cursorVisible ? (
                            <View className="w-[2.5px] h-7 bg-primary rounded-full" />
                          ) : (
                            <View
                              className={`w-2 h-0.5 rounded-full ${
                                isDark ? "bg-zinc-700" : "bg-slate-300"
                              }`}
                            />
                          )}
                        </View>

                        {/* Underline Dash Line */}
                        <View
                          style={[
                            styles.dashLine,
                            {
                              backgroundColor: isSlotActive
                                ? "#ff6719"
                                : isFilledSlot
                                  ? "#ff6719"
                                  : isDark
                                    ? "#3f3f46"
                                    : "#cbd5e1",
                              height: isSlotActive ? 3.5 : isFilledSlot ? 3 : 2.5,
                              transform: [
                                { scaleX: isSlotActive ? 1.08 : 1 },
                              ],
                            },
                          ]}
                        />
                      </View>
                    );
                  })}

                  {/* Hidden native input for seamless accessibility and keyboard handling */}
                  <TextInput
                    ref={textInputRef}
                    value={otpCode}
                    onChangeText={handleOtpChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    maxLength={OTP_LENGTH}
                    autoFocus
                    style={styles.hiddenInput}
                    caretHidden
                  />
                </Pressable>

                {/* Resend Countdown */}
                <View className="flex-row justify-center items-center mt-6">
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
                      hitSlop={8}
                      className="px-1 py-0.5"
                    >
                      <Text className="text-primary font-bold text-sm">
                        {resending ? "Sending..." : "Resend Code"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            {/* Bottom Actions: Verify Later placed ABOVE Verify button */}
            <View className="mt-6 mb-2">
              {/* Native transparent ripple "Verify Later" button placed ABOVE */}
              <View className="mb-3 rounded-2xl overflow-hidden">
                <Pressable
                  onPress={handleVerifyLater}
                  android_ripple={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(0, 0, 0, 0.08)",
                    borderless: false,
                    foreground: true,
                  }}
                  style={({ pressed }) => [
                    Platform.OS === "ios" && pressed
                      ? { opacity: 0.65 }
                      : undefined,
                    {
                      height: 50,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text
                    className={`font-semibold text-base ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {purpose === "signup"
                      ? "Verify Later"
                      : "Skip to Sign In"}
                  </Text>
                </Pressable>
              </View>

              {/* Primary action button: "Verify" only */}
              <AppButton
                title="Verify"
                icon="checkmark-circle"
                iconPosition="right"
                onPress={handleVerify}
                loading={loading}
                disabled={isButtonDisabled}
                isDark={isDark}
                variant="primary"
                size="lg"
              />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topDash: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 24,
    marginTop: 6,
  },
  slotContainer: {
    width: 44,
    height: 60,
  },
  dashLine: {
    width: "100%",
    borderRadius: 2,
    marginTop: 6,
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
});
