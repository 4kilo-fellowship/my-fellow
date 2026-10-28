import { InfoModal } from "@/components/Modals/InfoModal";
import { PRIMARY } from "@/constants/colors";
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
  type ScrollViewInstance,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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
  const scrollViewRef = useRef<ScrollViewInstance | null>(null);
  const submittingRef = useRef(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Track keyboard state for compact layout
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      setTimeout(
        () => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        },
        Platform.OS === "ios" ? 40 : 100,
      );
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Redirect back if phone is missing
  useEffect(() => {
    if (!phone) {
      router.replace("/(auth)/sign-in");
    }
  }, [phone, router]);

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Cooldown countdown timer
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
        toValue: 6,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 4,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -4,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatDisplayPhone = (raw: string) => {
    const digits = (raw || "").replace(/\D/g, "");
    let local = digits;
    if (local.startsWith("251")) local = local.slice(3);
    if (local.startsWith("0")) local = local.slice(1);
    if (!local) return "+251";
    return `+251 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 9)}`.trim();
  };

  const handleVerify = async (candidateCode?: string) => {
    const finalCode = (candidateCode ?? code).trim();
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

  const handleEditPhone = () => {
    if (Platform.OS !== "web") {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    Keyboard.dismiss();
    router.back();
  };

  return (
    <SafeAreaView
      edges={isKeyboardVisible ? ["top"] : ["top", "bottom"]}
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#09090B" : "#FFFFFF" },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Phone Number"
          onPress={handleEditPhone}
          hitSlop={8}
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)",
            borderless: true,
            radius: 20,
          }}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
              opacity: pressed ? 0.7 : 1,
              transform:
                Platform.OS === "ios" && pressed
                  ? [{ scale: 0.94 }]
                  : undefined,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#FFFFFF" : "#0F172A"}
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 48 : 0}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentCard}>
              {/* Icon badge inspired by TNT Ethiopia */}
              <View
                style={[
                  styles.iconBadge,
                  isKeyboardVisible && styles.iconBadgeCompact,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 103, 25, 0.15)"
                      : "#FFF7ED",
                    borderColor: isDark
                      ? "rgba(255, 103, 25, 0.25)"
                      : "#FED7AA",
                  },
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={isKeyboardVisible ? 24 : 32}
                  color={PRIMARY}
                />
              </View>

              {/* Title & Subtitle */}
              <Text
                style={[
                  styles.title,
                  { color: isDark ? "#FFFFFF" : "#111827" },
                ]}
              >
                Enter verification code
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? "#A1A1AA" : "#6B7280" },
                ]}
              >
                We sent a 6-digit verification code to
              </Text>

              {/* Phone display with Interactive Edit badge */}
              <Pressable
                onPress={handleEditPhone}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Edit phone number"
                style={({ pressed }) => [
                  styles.phoneRow,
                  isKeyboardVisible && styles.phoneRowCompact,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.06)"
                      : "rgba(0, 0, 0, 0.04)",
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.06)",
                  },
                  pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={14}
                  color={isDark ? "#94A3B8" : "#64748B"}
                />
                <Text
                  style={[
                    styles.phoneText,
                    { color: isDark ? "#FFFFFF" : "#111827" },
                  ]}
                >
                  {formatDisplayPhone(phone)}
                </Text>
                <View
                  style={[
                    styles.editBadge,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 103, 25, 0.15)"
                        : "#FFF7ED",
                    },
                  ]}
                >
                  <Ionicons name="pencil" size={11} color={PRIMARY} />
                  <Text style={styles.editText}>Edit</Text>
                </View>
              </Pressable>

              {/* Unified Clean OTP Input Box */}
              <Animated.View
                style={[
                  styles.otpWrapper,
                  { transform: [{ translateX: shakeAnim }] },
                ]}
              >
                <Pressable
                  onPress={() => inputRef.current?.focus()}
                  accessible={false}
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                      borderColor: isDark ? "#27272A" : "#E2E8F0",
                    },
                    isFocused && [
                      styles.inputWrapperFocused,
                      {
                        borderColor: PRIMARY,
                        backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                      },
                    ],
                    Boolean(error) && [
                      styles.inputWrapperError,
                      {
                        backgroundColor: isDark
                          ? "rgba(239, 68, 68, 0.08)"
                          : "#FEF2F2",
                      },
                    ],
                    loading && styles.inputWrapperDisabled,
                  ]}
                >
                  <TextInput
                    ref={inputRef}
                    value={code}
                    onChangeText={(text) => {
                      const cleaned = text
                        .replace(/\D/g, "")
                        .slice(0, CODE_LENGTH);
                      setCode(cleaned);
                      if (error) setError(null);
                      if (cleaned.length === CODE_LENGTH) {
                        void handleVerify(cleaned);
                      }
                    }}
                    placeholder="Code"
                    placeholderTextColor={isDark ? "#71717A" : "#94A3B8"}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    maxLength={CODE_LENGTH}
                    editable={!loading}
                    selectTextOnFocus
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    selectionColor={PRIMARY}
                    cursorColor={PRIMARY}
                    style={[
                      styles.input,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                      code.length > 0
                        ? styles.inputWithDigits
                        : styles.inputEmpty,
                      Boolean(error) && styles.inputError,
                    ]}
                  />
                </Pressable>

                {Boolean(error) && (
                  <View style={styles.errorRow}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={15}
                      color="#EF4444"
                    />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </Animated.View>

              {/* Verify Button */}
              <View style={styles.buttonWrapper}>
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    void handleVerify();
                  }}
                  disabled={loading || code.length !== CODE_LENGTH}
                  style={({ pressed }) => [
                    styles.verifyButton,
                    (loading || code.length !== CODE_LENGTH) &&
                      styles.verifyButtonDisabled,
                    pressed &&
                      !(loading || code.length !== CODE_LENGTH) && {
                        opacity: 0.9,
                        transform: [{ scale: 0.99 }],
                      },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                  )}
                </Pressable>
              </View>

              {/* Resend Code Section */}
              <View style={styles.resendSection}>
                {cooldown > 0 ? (
                  <Text style={styles.cooldownText}>
                    Resend code in{" "}
                    <Text style={styles.cooldownNumber}>{cooldown}s</Text>
                  </Text>
                ) : (
                  <Pressable
                    onPress={handleResend}
                    disabled={resending}
                    hitSlop={10}
                    style={styles.resendButton}
                  >
                    {resending ? (
                      <ActivityIndicator size="small" color={PRIMARY} />
                    ) : (
                      <Text style={styles.resendText}>Resend code</Text>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    minHeight: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    justifyContent: "flex-start",
  },
  contentCard: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconBadgeCompact: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 22,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  phoneRowCompact: {
    marginTop: 4,
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  phoneText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  editBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  editText: {
    fontSize: 12,
    fontWeight: "700",
    color: PRIMARY,
    includeFontPadding: false,
  },
  otpWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  inputWrapper: {
    width: "100%",
    minHeight: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  inputWrapperFocused: {
    borderWidth: 2,
  },
  inputWrapperError: {
    borderColor: "#EF4444",
    borderWidth: 2,
  },
  inputWrapperDisabled: {
    opacity: 0.6,
  },
  input: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    paddingVertical: 0,
    margin: 0,
    includeFontPadding: false,
  },
  inputEmpty: {
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0,
  },
  inputWithDigits: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 8,
  },
  inputError: {
    color: "#EF4444",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "500",
    marginLeft: 5,
  },
  buttonWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  verifyButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  verifyButtonDisabled: {
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resendSection: {
    alignItems: "center",
    paddingVertical: 8,
    width: "100%",
  },
  cooldownText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY,
    textAlign: "center",
  },
  cooldownNumber: {
    fontWeight: "800",
    color: PRIMARY,
  },
  resendButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY,
    textAlign: "center",
  },
});
