import { InfoModal } from "@/components/Modals/InfoModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY_ORANGE = "#FF6719";
const CODE_LENGTH = 6;
const DEFAULT_RESEND_SECONDS = 60;

export default function OtpVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; phoneNumber?: string }>();
  const phone = params.phone || params.phoneNumber || "";

  const { sendPhoneAuthOtp, verifyPhoneAuthOtp } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(DEFAULT_RESEND_SECONDS);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const inputRef = useRef<TextInputInstance | null>(null);
  const submittingRef = useRef(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Cooldown timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerify = async (candidateCode?: string) => {
    const finalCode = (candidateCode || code).trim();
    if (finalCode.length !== CODE_LENGTH || submittingRef.current || loading) {
      return;
    }

    submittingRef.current = true;
    setError(null);
    setLoading(true);
    Keyboard.dismiss();

    try {
      const res = await verifyPhoneAuthOtp(phone, finalCode);
      if (res.success) {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});

        if (res.isNewUser || !res.user?.fullName) {
          router.replace("/(auth)/personalization");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error,
        ).catch(() => {});
        const msg = res.message || "Invalid or expired verification code.";
        setError(msg);
        triggerShake();
      }
    } catch (err: any) {
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      ).catch(() => {});
      const msg = err.message || "Verification failed. Please try again.";
      setError(msg);
      triggerShake();
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);

    try {
      const res = await sendPhoneAuthOtp(phone);
      if (res.success) {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        setCooldown(DEFAULT_RESEND_SECONDS);
        setModalConfig({
          visible: true,
          title: "Code Resent",
          message: "A new 6-digit verification code has been sent via SMS.",
          type: "success",
        });
      } else {
        setError(res.message || "Failed to resend code.");
      }
    } catch (err: any) {
      setError(err.message || "Could not resend SMS code.");
    } finally {
      setResending(false);
    }
  };

  const formatDisplayPhone = (raw: string) => {
    const digits = (raw || "").replace(/\D/g, "");
    let local = digits;
    if (local.startsWith("251")) local = local.slice(3);
    if (local.startsWith("0")) local = local.slice(1);
    if (!local) return "+251";
    return `+251 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 9)}`.trim();
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#09090B" : "#F9FAFB" },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: isDark ? "#27272A" : "#FFFFFF" },
          ]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#FFFFFF" : "#111827"}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleSection}>
            <Text
              style={[
                styles.title,
                { color: isDark ? "#FFFFFF" : "#111827" },
              ]}
            >
              Verify your phone
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? "#A1A1AA" : "#6B7280" },
              ]}
            >
              Enter the 6-digit code sent to{" "}
              <Text
                style={{
                  color: isDark ? "#FFFFFF" : "#111827",
                  fontWeight: "700",
                }}
              >
                {formatDisplayPhone(phone)}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.editPhoneBtn}
            >
              <Text style={styles.editPhoneText}>Edit phone number</Text>
            </TouchableOpacity>
          </View>

          {/* OTP Code Input Boxes */}
          <Animated.View
            style={[
              styles.otpInputContainer,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Pressable
              onPress={() => inputRef.current?.focus()}
              style={styles.boxesRow}
            >
              {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                const char = code[index] || "";
                const isCurrent = index === code.length;
                const isFilled = Boolean(char);

                return (
                  <View
                    key={index}
                    style={[
                      styles.codeBox,
                      {
                        backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                        borderColor: isCurrent
                          ? PRIMARY_ORANGE
                          : Boolean(error)
                            ? "#EF4444"
                            : isDark
                              ? "#27272A"
                              : "#E5E7EB",
                      },
                      isCurrent && styles.codeBoxCurrent,
                      isFilled && styles.codeBoxFilled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.codeBoxText,
                        { color: isDark ? "#FFFFFF" : "#111827" },
                      ]}
                    >
                      {char}
                    </Text>
                  </View>
                );
              })}
            </Pressable>

            {/* Hidden actual TextInput */}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
                setCode(cleaned);
                if (error) setError(null);
                if (cleaned.length === CODE_LENGTH) {
                  handleVerify(cleaned);
                }
              }}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              style={styles.hiddenInput}
              autoFocus
            />
          </Animated.View>

          {Boolean(error) && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* Action button */}
          <Pressable
            onPress={() => handleVerify()}
            disabled={code.length !== CODE_LENGTH || loading}
            style={({ pressed }) => [
              styles.verifyButton,
              (code.length !== CODE_LENGTH || loading) && styles.verifyButtonDisabled,
              pressed && { opacity: 0.88 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify & Continue</Text>
            )}
          </Pressable>

          {/* Resend timer */}
          <View style={styles.resendSection}>
            {cooldown > 0 ? (
              <Text
                style={[
                  styles.resendTimerText,
                  { color: isDark ? "#71717A" : "#9CA3AF" },
                ]}
              >
                Resend code in <Text style={{ fontWeight: "700" }}>{cooldown}s</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                style={styles.resendButton}
              >
                {resending ? (
                  <ActivityIndicator color={PRIMARY_ORANGE} size="small" />
                ) : (
                  <Text style={styles.resendActiveText}>Resend code via SMS</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <InfoModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type || "info"}
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  editPhoneBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  editPhoneText: {
    color: PRIMARY_ORANGE,
    fontSize: 14,
    fontWeight: "700",
  },
  otpInputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  boxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  codeBoxCurrent: {
    borderWidth: 2,
  },
  codeBoxFilled: {
    borderColor: PRIMARY_ORANGE,
  },
  codeBoxText: {
    fontSize: 22,
    fontWeight: "800",
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  verifyButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY_ORANGE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resendSection: {
    marginTop: 24,
    alignItems: "center",
  },
  resendTimerText: {
    fontSize: 14,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendActiveText: {
    color: PRIMARY_ORANGE,
    fontSize: 14,
    fontWeight: "700",
  },
});
