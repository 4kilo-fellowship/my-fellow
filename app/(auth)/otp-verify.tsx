import AppButton from "@/components/AppButton";
import { InfoModal } from "@/components/Modals/InfoModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSignupStore } from "@/stores/signup.store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OTP_TIMEOUT = 60; // 60 seconds resend countdown

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? `0${s}` : s}`;
};

export default function OtpVerify() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { verifyOtp, requestOtp } = useAuth();
  const signupStore = useSignupStore();

  const phoneNumber =
    (params.phoneNumber as string) || signupStore.phoneNumber || "";
  const purpose =
    ((params.purpose as "signup" | "reset-password") || "signup") as
      | "signup"
      | "reset-password";

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const submittingRef = useRef<boolean>(false);
  const verifiedRef = useRef<boolean>(false);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(OTP_TIMEOUT);
  const [canResend, setCanResend] = useState<boolean>(false);
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

  // Countdown timer effect matching primely-uat
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const otpCode = otp.join("");
  const isFilled = otpCode.length === 6 && /^\d{6}$/.test(otpCode);

  const handleChangeText = (text: string, index: number) => {
    if (submittingRef.current || verifiedRef.current) return;
    const cleanText = text.replace(/[^0-9]/g, "");

    // Paste behavior: if the user pastes 6 digits
    if (cleanText.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        if (i < cleanText.length) {
          newOtp[i] = cleanText[i];
        }
      }
      setOtp(newOtp);
      const targetIndex = Math.min(cleanText.length - 1, 5);
      inputRefs.current[targetIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleanText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async () => {
    if (submittingRef.current || verifiedRef.current) return;
    if (otpCode.length !== 6) {
      setErrorModal({
        visible: true,
        title: "Invalid Code",
        message: "Please enter the 6-digit code sent to your phone.",
        type: "error",
      });
      return;
    }

    submittingRef.current = true;
    setIsLoading(true);

    try {
      const response = await verifyOtp(phoneNumber, otpCode, purpose);
      const token = response.verificationToken;
      verifiedRef.current = true;

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
      submittingRef.current = false;
      const message =
        err.response?.data?.message ||
        err.message ||
        "Invalid OTP code. Please try again.";
      setErrorModal({
        visible: true,
        title: "Verification Failed",
        message: `${message}\n\nYou can also tap 'Verify Later' below to continue.`,
        type: "error",
      });
    } finally {
      if (!verifiedRef.current) {
        setIsLoading(false);
      }
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
    if (isLoading || verifiedRef.current) return;
    if (!phoneNumber) {
      setErrorModal({
        visible: true,
        title: "Error",
        message: "Phone number is missing. Please try registering again.",
        type: "error",
      });
      return;
    }

    try {
      await requestOtp(phoneNumber, purpose);
      setTimer(OTP_TIMEOUT);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
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
        "Could not resend code. Please try again later.";
      setErrorModal({
        visible: true,
        title: "Resend Failed",
        message: `${message}\n\nYou can tap 'Verify Later' below if SMS delivery is delayed.`,
        type: "error",
      });
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: isDark ? "#1A1A1B" : "#ffffff",
        },
        topBar: {
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 4,
        },
        backButton: {
          width: 44,
          height: 44,
          justifyContent: "center",
          alignItems: "center",
          marginLeft: -10,
          borderRadius: 22,
        },
        scrollContent: {
          flexGrow: 1,
          justifyContent: "center",
          paddingBottom: 40,
        },
        content: {
          paddingHorizontal: 24,
        },
        header: {
          marginBottom: 36,
          alignItems: "center",
        },
        title: {
          fontSize: 26,
          fontWeight: "700",
          textAlign: "center",
          color: isDark ? "#ffffff" : "#0f172a",
          letterSpacing: -0.5,
        },
        subtitle: {
          fontSize: 15,
          marginTop: 8,
          color: isDark ? "#94a3b8" : "#64748b",
          lineHeight: 22,
          textAlign: "center",
        },
        phoneText: {
          color: isDark ? "#ffffff" : "#0f172a",
          fontWeight: "700",
        },
        otpContainer: {
          marginBottom: 32,
        },
        otpInputs: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        // Circular input boxes
        otpBox: {
          width: 48,
          height: 48,
          borderRadius: 24, // Perfect circle
          borderWidth: 1.5,
          borderColor: isDark ? "#334155" : "#e2e8f0",
          backgroundColor: isDark ? "#0f172a" : "#f8fafc",
          fontSize: 22,
          fontWeight: "700",
          textAlign: "center",
          color: isDark ? "#ffffff" : "#0f172a",
          includeFontPadding: false,
          textAlignVertical: "center",
        },
        otpBoxFocused: {
          borderColor: "#ff6719",
          borderWidth: 2,
          backgroundColor: isDark
            ? "rgba(255, 103, 25, 0.08)"
            : "rgba(255, 103, 25, 0.04)",
        },
        otpBoxFilled: {
          borderColor: "#ff6719",
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
        },
        timerSection: {
          alignItems: "center",
          marginBottom: 32,
        },
        captionText: {
          fontSize: 14,
          color: isDark ? "#94a3b8" : "#64748b",
        },
        timerText: {
          color: "#ff6719",
          fontWeight: "700",
        },
      }),
    [isDark],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Back Button matching primely-uat */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#ffffff" : "#0f172a"}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header section matching primely-uat */}
            <View style={styles.header}>
              <Text style={styles.title}>Verify Account</Text>
              <Text style={styles.subtitle}>
                A 6-digit code has been sent to{"\n"}
                <Text style={styles.phoneText}>
                  {phoneNumber || "your phone number"}
                </Text>
              </Text>
            </View>

            {/* OTP Section with Circle Input Boxes */}
            <View style={styles.otpContainer}>
              <View style={styles.otpInputs}>
                {[...Array(6)].map((_, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => {
                      inputRefs.current[i] = ref;
                    }}
                    style={[
                      styles.otpBox,
                      focusedIndex === i && styles.otpBoxFocused,
                      otp[i] !== "" && styles.otpBoxFilled,
                    ]}
                    value={otp[i]}
                    onChangeText={(text) => handleChangeText(text, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                    onFocus={() => setFocusedIndex(i)}
                    onBlur={() => setFocusedIndex(null)}
                    keyboardType="number-pad"
                    maxLength={i === 0 ? 6 : 1}
                    selectTextOnFocus
                    textAlign="center"
                    autoFocus={i === 0}
                    editable={!isLoading && !verifiedRef.current}
                    textContentType={i === 0 ? "oneTimeCode" : undefined}
                    autoComplete={i === 0 ? "sms-otp" : undefined}
                  />
                ))}
              </View>
            </View>

            {/* Timer / Resend Section matching primely-uat */}
            <View style={styles.timerSection}>
              {canResend ? (
                <Pressable
                  onPress={handleResend}
                  disabled={isLoading || verifiedRef.current}
                  android_ripple={{
                    color: "rgba(255, 103, 25, 0.15)",
                    borderless: true,
                    radius: 40,
                  }}
                  className="py-1 px-3"
                >
                  <Text className="text-primary font-bold text-sm">
                    Resend Code
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.captionText}>
                  Resend code in{" "}
                  <Text style={styles.timerText}>{formatTime(timer)}</Text>
                </Text>
              )}
            </View>

            {/* Main Verify Button */}
            <AppButton
              title="Verify"
              onPress={handleVerify}
              loading={isLoading}
              disabled={isLoading || verifiedRef.current || !isFilled}
              isDark={isDark}
              variant="primary"
              size="lg"
            />

            {/* Verify Later Button at the BOTTOM of the main verify button, centered with native ripple */}
            <View className="items-center mt-3">
              <View style={{ borderRadius: 16, overflow: "hidden" }}>
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
                      paddingVertical: 12,
                      paddingHorizontal: 28,
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
                    {purpose === "signup" ? "Verify Later" : "Skip to Sign In"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
