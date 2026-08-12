import { OtpInput } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { otpService } from "@/services/otpService";
import { useOtpStore } from "@/stores/otp.store";
import { OtpPurpose } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.24;
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyOtp() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    purpose: OtpPurpose;
    phoneNumber: string;
    fullName?: string;
    password?: string;
  }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { updatePhone } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const purpose = params.purpose ?? "signup";
  const phoneNumber = params.phoneNumber ?? "";

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCooldown();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (code.length === OTP_LENGTH) {
      Keyboard.dismiss();
    }
  }, [code]);

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setError(null);
    try {
      await otpService.send({ phoneNumber, purpose });
      startCooldown();
      Toast.show({ type: "success", text1: "Code sent", text2: "A new code was sent to your phone." });
    } catch (err: any) {
      setError(err.message || "Failed to resend the code.");
    }
  };

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH || loading) return;
    setLoading(true);
    setError(null);
    try {
      const otpToken = await otpService.verify({
        phoneNumber,
        purpose,
        code,
      });
      useOtpStore.getState().setToken(otpToken);

      if (purpose === "update-phone") {
        const password = useOtpStore.getState().password ?? "";
        await updatePhone({
          phoneNumber,
          password,
          otpToken,
        });
        useOtpStore.getState().clear();
        Toast.show({ type: "success", text1: "Phone number updated" });
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)");
        }
        return;
      }

      router.replace({
        pathname: "/sign-up-step-2",
        params: {
          fullName: params.fullName ?? "",
          phoneNumber,
          password: params.password ?? "",
        },
      });
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/sign-up-step-1");
    }
  };

  const maskedPhone = phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2");

  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-white"}`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View
            className="bg-primary relative overflow-hidden items-center justify-center"
            style={{
              height: HEADER_HEIGHT,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="absolute top-12 left-4 w-11 h-11 bg-white/25 rounded-full items-center justify-center border border-white/30 shadow-md"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="shield-checkmark" size={40} color="white" />
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
              className={`flex-1 ${isDark ? "bg-dark" : "bg-white"} pt-10 px-6`}
            >
              <Text
                className={`${isDark ? "text-white" : "text-slate-900"} text-2xl font-extrabold text-center mb-2`}
              >
                Verify Your Phone
              </Text>
              <Text
                className={`${isDark ? "text-slate-400" : "text-slate-500"} text-center text-base leading-6 mb-8`}
              >
                Enter the 6-digit code sent to{"\n"}
                <Text className="text-primary font-bold">{maskedPhone}</Text>
              </Text>

              <OtpInput
                length={OTP_LENGTH}
                value={code}
                onChange={setCode}
                isDark={isDark}
              />

              {error ? (
                <Text className="text-red-500 text-sm text-center mt-4">
                  {error}
                </Text>
              ) : null}

              <View className="mt-8">
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleVerify}
                  disabled={code.length !== OTP_LENGTH || loading}
                  style={{
                    backgroundColor: "#ff6719",
                    height: 56,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity:
                      code.length !== OTP_LENGTH || loading ? 0.5 : 1,
                    shadowColor: "#ff6719",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className="text-white text-lg font-bold">
                    {loading ? "Verifying..." : "Verify"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center items-center mt-6">
                <Text
                  className={`${isDark ? "text-slate-400" : "text-slate-600"} font-medium`}
                >
                  Didn&apos;t get the code?{" "}
                </Text>
                {cooldown > 0 ? (
                  <Text className="text-primary font-bold">
                    Resend in {cooldown}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.8}>
                    <Text className="text-primary font-bold">Resend</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}
