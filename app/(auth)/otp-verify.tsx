import { InfoModal } from "@/components/Modals/InfoModal";
import { NativeRipplePressable } from "@/components/NativeRipplePressable";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSignupStore } from "@/stores/signup.store";
import { formatErrorMessage } from "@/utils/alertUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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

const CODE_LENGTH = 6;
const DEFAULT_RESEND_SECONDS = 60;
const ERROR_FLASH_MILLIS = 2000;

const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

export default function OtpVerify() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { verifyOtp, requestOtp } = useAuth();
  const signupStore = useSignupStore();

  const initialPhone =
    (params.phoneNumber as string) || signupStore.phoneNumber || "";
  const purpose =
    ((params.purpose as "signup" | "reset-password") || "signup") as
      | "signup"
      | "reset-password";

  const [currentPhone, setCurrentPhone] = useState<string>(initialPhone);
  const [code, setCode] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(DEFAULT_RESEND_SECONDS);
  const [resending, setResending] = useState<boolean>(false);

  // Edit Phone Modal States with real-time "Checking..." validation
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editPhoneValue, setEditPhoneValue] = useState<string>(initialPhone);
  const [checkingState, setCheckingState] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [checkingMessage, setCheckingMessage] = useState<string>("");
  const [isUpdatingPhone, setIsUpdatingPhone] = useState<boolean>(false);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "error" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  const inputRef = useRef<TextInput | null>(null);
  const submitLock = useRef<boolean>(false);
  const flashClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkingDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animations from prime-capital
  const caretOpacity = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnims = useRef(
    Array.from({ length: CODE_LENGTH }, () => new Animated.Value(0.35)),
  ).current;

  // Auto focus input on mount and keep it focused
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(t);
  }, []);

  // Countdown timer effect
  const isCountingDown = cooldown > 0;
  useEffect(() => {
    if (!isCountingDown) return;
    const interval = setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCountingDown]);

  // Caret blinking animation
  useEffect(() => {
    if (!focused) {
      caretOpacity.setValue(1);
      return;
    }
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(caretOpacity, {
          toValue: 0.15,
          duration: 430,
          useNativeDriver: true,
        }),
        Animated.timing(caretOpacity, {
          toValue: 1,
          duration: 430,
          useNativeDriver: true,
        }),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, [focused, caretOpacity]);

  // Wave pulse loading animation
  useEffect(() => {
    if (!loading) {
      pulseAnims.forEach((anim) => anim.setValue(0.35));
      return;
    }
    const animations = pulseAnims.map((anim, i) =>
      Animated.sequence([
        Animated.delay(i * 90),
        Animated.timing(anim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0.35,
          duration: 260,
          useNativeDriver: false,
        }),
      ]),
    );
    const loop = Animated.loop(Animated.parallel(animations));
    loop.start();
    return () => loop.stop();
  }, [loading, pulseAnims]);

  // Shake animation on error
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 7,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -7,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 5,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -5,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 3,
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

  const clearError = () => {
    if (flashClearTimer.current) clearTimeout(flashClearTimer.current);
    flashClearTimer.current = null;
    setError(null);
  };

  const flashError = (message: string, clearInputs = false) => {
    setError(message);
    triggerShake();
    if (flashClearTimer.current) clearTimeout(flashClearTimer.current);
    flashClearTimer.current = setTimeout(() => {
      setError(null);
      if (clearInputs) {
        setCode("");
        inputRef.current?.focus();
      }
    }, ERROR_FLASH_MILLIS);
  };

  const handleVerify = async (codeToVerify: string) => {
    if (submitLock.current) return;
    if (codeToVerify.length !== CODE_LENGTH) {
      flashError(`Enter the complete ${CODE_LENGTH}-digit verification code.`);
      return;
    }

    submitLock.current = true;
    setLoading(true);
    clearError();
    Keyboard.dismiss();

    try {
      const response = await verifyOtp(currentPhone, codeToVerify, purpose);
      const token = response.verificationToken;

      if (purpose === "signup") {
        signupStore.setVerificationToken(token);
        signupStore.setStep("personalization");

        router.push({
          pathname: "/personalization",
          params: {
            fullName: signupStore.fullName,
            phoneNumber: currentPhone,
            password: signupStore.password,
            verificationToken: token,
          },
        });
      } else {
        router.push({
          pathname: "/(auth)/sign-in",
          params: { verifiedPhone: currentPhone },
        });
      }
    } catch (err: any) {
      const formatted = formatErrorMessage(err, "Incorrect verification code. Try again.");
      flashError(formatted.message, true);
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  };

  // High-speed text handler with auto-submit on 6 digits
  const handleChangeText = (text: string) => {
    const rawClean = text.replace(/[^0-9]/g, "");
    const clean = rawClean.slice(0, CODE_LENGTH);
    setCode(clean);
    clearError();

    // Auto submit immediately when 6 digits are typed
    if (clean.length === CODE_LENGTH) {
      void handleVerify(clean);
    }
  };

  const handleBoxPress = () => {
    inputRef.current?.focus();
    setFocused(true);
  };

  const handleResend = async () => {
    if (isCountingDown || resending || loading) return;
    if (!currentPhone) {
      flashError("Phone number is missing.");
      return;
    }

    setResending(true);
    clearError();

    try {
      await requestOtp(currentPhone, purpose);
      setCode("");
      setCooldown(DEFAULT_RESEND_SECONDS);
      inputRef.current?.focus();
      setInfoModal({
        visible: true,
        title: "Code Sent",
        message: "Verification code sent.",
        type: "info",
      });
    } catch (err: any) {
      const formatted = formatErrorMessage(err, "Could not resend code. Try again.");
      flashError(formatted.message);
    } finally {
      setResending(false);
    }
  };

  const handleVerifyLater = () => {
    if (purpose === "signup") {
      signupStore.setStep("personalization");
      router.push({
        pathname: "/personalization",
        params: {
          fullName: signupStore.fullName,
          phoneNumber: currentPhone,
          password: signupStore.password,
        },
      });
    } else {
      router.push({
        pathname: "/(auth)/sign-in",
        params: { verifiedPhone: currentPhone },
      });
    }
  };

  // Real-time "Checking..." state logic for editing phone number
  const handleEditPhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, "");
    setEditPhoneValue(raw);

    if (raw.length === 0) {
      setCheckingState("idle");
      setCheckingMessage("");
      return;
    }

    // Show immediate checking state
    setCheckingState("checking");
    setCheckingMessage("Checking number format...");

    if (checkingDebounce.current) clearTimeout(checkingDebounce.current);
    checkingDebounce.current = setTimeout(() => {
      const isValid = /^(09|07)\d{8}$/.test(raw);
      if (isValid) {
        setCheckingState("valid");
        setCheckingMessage("Valid Ethiopian phone number");
      } else {
        setCheckingState("invalid");
        if (!raw.startsWith("09") && !raw.startsWith("07")) {
          setCheckingMessage("Must start with 09 or 07");
        } else if (raw.length !== 10) {
          setCheckingMessage(`${raw.length}/10 digits entered`);
        } else {
          setCheckingMessage("Invalid phone number format");
        }
      }
    }, 250);
  };

  const handleConfirmPhoneChange = async () => {
    if (checkingState !== "valid" || isUpdatingPhone) return;

    setIsUpdatingPhone(true);
    try {
      await requestOtp(editPhoneValue, purpose);
      setCurrentPhone(editPhoneValue);

      // Persist in signupStore
      signupStore.start({
        fullName: signupStore.fullName,
        phoneNumber: editPhoneValue,
        password: signupStore.password,
      });

      setCode("");
      setCooldown(DEFAULT_RESEND_SECONDS);
      setIsEditModalOpen(false);

      setInfoModal({
        visible: true,
        title: "Phone Updated",
        message: "Phone number updated.",
        type: "info",
      });
      inputRef.current?.focus();
    } catch (err: any) {
      const formatted = formatErrorMessage(err, "Failed to update phone number.");
      setCheckingState("invalid");
      setCheckingMessage(formatted.message);
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const cells = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? "");
  const canResend = cooldown <= 0 && !resending;

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
        screenContent: {
          flexGrow: 1,
          paddingHorizontal: 24,
        },
        body: {
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 32,
        },
        title: {
          fontSize: 28,
          fontWeight: "800",
          lineHeight: 34,
          letterSpacing: -0.4,
          textAlign: "center",
          color: isDark ? "#ffffff" : "#0f172a",
          marginBottom: 8,
        },
        // Unified Horizontal Subtitle Row with Edit Pill
        subtitleRow: {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 26,
          marginTop: 2,
          paddingHorizontal: 4,
        },
        subtitleText: {
          fontSize: 15,
          lineHeight: 22,
          textAlign: "center",
          color: isDark ? "#94a3b8" : "#64748b",
          marginRight: 8,
          includeFontPadding: false,
          textAlignVertical: "center",
        },
        phoneBoxWrapper: {
          borderRadius: 16,
          overflow: "hidden",
        },
        phoneBox: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "nowrap",
          height: 32,
          paddingHorizontal: 10,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#e2e8f0",
          backgroundColor: isDark ? "#1e293b" : "#f8fafc",
        },
        phoneText: {
          fontSize: 14,
          fontWeight: "700",
          lineHeight: 18,
          color: isDark ? "#ffffff" : "#0f172a",
          includeFontPadding: false,
          textAlignVertical: "center",
          marginRight: 6,
        },
        subtitle: {
          fontSize: 15,
          lineHeight: 22,
          textAlign: "center",
          color: isDark ? "#94a3b8" : "#64748b",
        },
        phoneIconWrap: {
          marginRight: 4,
          justifyContent: "center",
          alignItems: "center",
        },
        phoneDivider: {
          width: 1,
          height: 14,
          backgroundColor: isDark ? "#334155" : "#e2e8f0",
          marginHorizontal: 6,
        },
        editIconWrap: {
          marginRight: 2,
          justifyContent: "center",
          alignItems: "center",
        },
        editActionRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "nowrap",
        },
        editText: {
          fontSize: 12,
          fontWeight: "700",
          lineHeight: 16,
          color: "#ff6719",
          includeFontPadding: false,
          textAlignVertical: "center",
          marginLeft: 3,
        },
        otpWrap: {
          position: "relative",
          width: "100%",
          height: 62,
          justifyContent: "center",
          marginBottom: 8,
        },
        cells: {
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "space-between",
          gap: 8,
        },
        cell: {
          flex: 1,
          height: 58,
          borderRadius: 14,
          borderWidth: 1.5,
          alignItems: "center",
          justifyContent: "center",
        },
        // Native input spans entire container with zIndex on top to guarantee instant native focus
        hiddenInput: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          opacity: 0.01,
          zIndex: 99,
          color: "transparent",
        },
        digit: {
          fontSize: 22,
          fontWeight: "800",
        },
        caret: {
          width: 2,
          height: 28,
          borderRadius: 1,
          backgroundColor: isDark ? "#ffffff" : "#0f172a",
        },
        // Right below boxes row: left has error/loading, right has Verify Later
        belowBoxesRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minHeight: 36,
          marginBottom: 20,
          paddingHorizontal: 2,
        },
        statusArea: {
          flex: 1,
          justifyContent: "center",
          paddingRight: 8,
        },
        errorText: {
          fontSize: 13,
          fontWeight: "600",
          color: "#ef4444",
        },
        verifyingRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        },
        verifyingText: {
          fontSize: 13,
          fontWeight: "600",
          color: "#ff6719",
        },
        // Verify Later Button at the right of below the boxes
        verifyLaterWrapper: {
          borderRadius: 10,
          overflow: "hidden",
        },
        verifyLaterButton: {
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 10,
        },
        verifyLaterText: {
          fontSize: 14,
          fontWeight: "700",
          color: "#ff6719",
        },
        resendRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: 6,
        },
        resendHint: {
          fontSize: 14,
          color: isDark ? "#94a3b8" : "#64748b",
        },
        resendButtonText: {
          fontSize: 14,
          fontWeight: "700",
          color: "#ff6719",
        },
        resendCountdown: {
          fontSize: 14,
          fontWeight: "700",
          color: "#ff6719",
        },
        // Modal Styles
        modalOverlay: {
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        },
        modalCard: {
          width: "100%",
          maxWidth: 380,
          borderRadius: 24,
          padding: 24,
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 10,
        },
        modalTitle: {
          fontSize: 20,
          fontWeight: "800",
          color: isDark ? "#ffffff" : "#0f172a",
          marginBottom: 6,
          textAlign: "center",
        },
        modalSubtitle: {
          fontSize: 14,
          lineHeight: 20,
          color: isDark ? "#94a3b8" : "#64748b",
          marginBottom: 20,
          textAlign: "center",
        },
        modalInputWrap: {
          flexDirection: "row",
          alignItems: "center",
          height: 52,
          borderRadius: 14,
          borderWidth: 1.5,
          paddingHorizontal: 14,
          backgroundColor: isDark ? "#0f172a" : "#f8fafc",
          marginBottom: 8,
        },
        modalInput: {
          flex: 1,
          fontSize: 16,
          fontWeight: "600",
          color: isDark ? "#ffffff" : "#0f172a",
          marginLeft: 8,
          paddingVertical: 0,
          textAlignVertical: "center",
        },
        checkingRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 6,
          minHeight: 22,
          marginBottom: 20,
          paddingHorizontal: 4,
        },
        checkingText: {
          fontSize: 12,
          fontWeight: "600",
          lineHeight: 16,
          includeFontPadding: false,
          textAlignVertical: "center",
        },
        modalButtonsRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        },
        modalCancelButton: {
          flex: 1,
          height: 46,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "#334155" : "#e2e8f0",
          backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
          alignItems: "center",
          justifyContent: "center",
        },
        modalCancelText: {
          fontSize: 15,
          fontWeight: "600",
          color: isDark ? "#94a3b8" : "#64748b",
        },
        modalConfirmButton: {
          flex: 1,
          height: 46,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 6,
        },
        modalConfirmText: {
          color: "#ffffff",
          fontWeight: "700",
          fontSize: 15,
        },
      }),
    [isDark],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar matching prime-capital */}
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
          contentContainerStyle={styles.screenContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.body}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code we sent to
            </Text>

            {/* Single Horizontal Pill Badge for Phone Number with Edit Trigger */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                setEditPhoneValue(currentPhone);
                setCheckingState("valid");
                setCheckingMessage("Current phone number");
                setIsEditModalOpen(true);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                height: 36,
                paddingHorizontal: 14,
                borderRadius: 9999,
                borderWidth: 1.5,
                borderColor: isDark ? "#334155" : "#e2e8f0",
                backgroundColor: isDark ? "#1e293b" : "#f8fafc",
                marginTop: 12,
                marginBottom: 26,
              }}
            >
              <Ionicons
                name="call-outline"
                size={14}
                color={isDark ? "#94a3b8" : "#64748b"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isDark ? "#ffffff" : "#0f172a",
                  letterSpacing: 0.3,
                }}
              >
                {currentPhone}
              </Text>
              <View
                style={{
                  width: 1.5,
                  height: 14,
                  backgroundColor: isDark ? "#334155" : "#cbd5e1",
                  marginHorizontal: 8,
                }}
              />
              <Ionicons
                name="pencil"
                size={12}
                color="#ff6719"
                style={{ marginRight: 3 }}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#ff6719",
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>

            {/* High-Performance Fast Input Boxes with 100% Reliable Native Touch Capture */}
            <Animated.View
              style={[
                styles.otpWrap,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              {/* Native TextInput with zIndex: 99 sits on top and catches EVERY tap immediately */}
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={code}
                onChangeText={handleChangeText}
                keyboardType="number-pad"
                inputMode="numeric"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={CODE_LENGTH}
                autoFocus={true}
                editable={!loading}
                caretHidden={true}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />

              {/* Visual Boxes rendered below with pointerEvents="none" so they never intercept touches */}
              <View style={styles.cells} pointerEvents="none">
                {cells.map((digit, index) => {
                  const isCaret =
                    focused &&
                    (index === code.length ||
                      (index === CODE_LENGTH - 1 && code.length === CODE_LENGTH));
                  const isFilled = digit !== "";

                  return (
                    <Animated.View
                      key={index}
                      style={[
                        styles.cell,
                        {
                          backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                          borderColor: error
                            ? "#ef4444"
                            : loading
                              ? "#ff6719"
                              : isCaret
                                ? "#ff6719"
                                : isFilled
                                  ? "#ff6719"
                                  : isDark
                                    ? "#334155"
                                    : "#e2e8f0",
                          borderWidth: isCaret || isFilled ? 2 : 1.5,
                          opacity: loading ? pulseAnims[index] : 1,
                        },
                      ]}
                    >
                      {isFilled ? (
                        <Text
                          style={[
                            styles.digit,
                            {
                              color: error
                                ? "#ef4444"
                                : isDark
                                  ? "#ffffff"
                                  : "#0f172a",
                            },
                          ]}
                        >
                          {digit}
                        </Text>
                      ) : isCaret && !loading ? (
                        <Animated.View
                          style={[
                            styles.caret,
                            { opacity: caretOpacity },
                          ]}
                        />
                      ) : null}
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>

            {/* Right below the boxes: Left has status/error, Right has "Verify Later →" */}
            <View style={styles.belowBoxesRow}>
              <View style={styles.statusArea}>
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : loading ? (
                  <View style={styles.verifyingRow}>
                    <ActivityIndicator size="small" color="#ff6719" />
                    <Text style={styles.verifyingText}>Verifying code...</Text>
                  </View>
                ) : null}
              </View>

              {/* Verify Later positioned at the RIGHT of the area right below the boxes */}
              <View style={styles.verifyLaterWrapper}>
                <NativeRipplePressable
                  onPress={handleVerifyLater}
                  isDark={isDark}
                >
                  <Text style={styles.verifyLaterText}>
                    {purpose === "signup"
                      ? "Verify Later →"
                      : "Skip to Sign In →"}
                  </Text>
                </NativeRipplePressable>
              </View>
            </View>

            {/* Resend Row matching prime-capital */}
            <View style={styles.resendRow}>
              <Text style={styles.resendHint}>Didn&apos;t get the code?</Text>
              {canResend ? (
                <NativeRipplePressable
                  onPress={handleResend}
                  disabled={resending || loading}
                  isDark={isDark}
                >
                  <Text style={styles.resendButtonText}>
                    {resending ? "Sending..." : "Resend code"}
                  </Text>
                </NativeRipplePressable>
              ) : (
                <Text style={styles.resendCountdown}>
                  Resend in {formatCountdown(cooldown)}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Interactive Edit Phone Number Modal with Real-time "Checking..." State */}
      <Modal
        visible={isEditModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Phone Number</Text>
            <Text style={styles.modalSubtitle}>
              Update your number to receive a new 6-digit verification code.
            </Text>

            <View
              style={[
                styles.modalInputWrap,
                {
                  borderColor:
                    checkingState === "valid"
                      ? "#22c55e"
                      : checkingState === "invalid"
                        ? "#ef4444"
                        : checkingState === "checking"
                          ? "#ff6719"
                          : isDark
                            ? "#334155"
                            : "#e2e8f0",
                },
              ]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={
                  checkingState === "valid"
                    ? "#22c55e"
                    : checkingState === "invalid"
                      ? "#ef4444"
                      : "#ff6719"
                }
              />
              <TextInput
                style={styles.modalInput}
                value={editPhoneValue}
                onChangeText={handleEditPhoneChange}
                placeholder="0911223344"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                keyboardType="phone-pad"
                maxLength={10}
                autoFocus
              />
            </View>

            {/* Real-time "Checking..." State Indicator */}
            <View style={styles.checkingRow}>
              {checkingState === "checking" ? (
                <>
                  <ActivityIndicator size="small" color="#ff6719" />
                  <Text
                    style={[styles.checkingText, { color: "#ff6719" }]}
                  >
                    {checkingMessage}
                  </Text>
                </>
              ) : checkingState === "valid" ? (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#22c55e"
                  />
                  <Text
                    style={[styles.checkingText, { color: "#22c55e" }]}
                  >
                    {checkingMessage}
                  </Text>
                </>
              ) : checkingState === "invalid" ? (
                <>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text
                    style={[styles.checkingText, { color: "#ef4444" }]}
                  >
                    {checkingMessage}
                  </Text>
                </>
              ) : null}
            </View>

            <View style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={handleConfirmPhoneChange}
                disabled={checkingState !== "valid" || isUpdatingPhone}
                style={{
                  height: 48,
                  borderRadius: 14,
                  backgroundColor:
                    checkingState === "valid" && !isUpdatingPhone
                      ? "#ff6719"
                      : isDark
                        ? "#334155"
                        : "#cbd5e1",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                {isUpdatingPhone ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : null}
                <Text
                  style={{
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {isUpdatingPhone
                    ? "Sending Code..."
                    : "Update & Send Code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                disabled={isUpdatingPhone}
                style={{
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: isDark ? "#94a3b8" : "#64748b",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type || "info"}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}
