import { AppBottomSheet } from "@/components/AppBottomSheet";
import { PRIMARY } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  TouchableOpacity,
  View,
} from "react-native";

interface ReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isDark?: boolean;
}

export const ReasonModal = ({
  visible,
  onClose,
  onSubmit,
  isDark = false,
}: ReasonModalProps) => {
  const [reason, setReason] = useState<string>("Gift");
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setReason("Gift");
      setIsFocused(true);
      // Slight delay so the native bottom sheet entrance animation finishes before requesting focus
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleSubmit = () => {
    Keyboard.dismiss();
    const trimmed = reason.trim();
    onSubmit(trimmed || "Gift");
  };

  const cardBg = isDark ? "#27272A" : "#F4F4F5";
  const textColor = isDark ? "#FFFFFF" : "#09090B";
  const subTextColor = isDark ? "#A1A1AA" : "#71717A";
  const borderColor = isDark ? "#3F3F46" : "#E4E4E7";

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      snapPoints={["full"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: textColor }]}>
                Provide a Reason
              </Text>
              <Text style={[styles.subtitle, { color: subTextColor }]}>
                What is this payment or contribution for?
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: cardBg }]}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={subTextColor} />
            </TouchableOpacity>
          </View>

          {/* Text Input Box */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: cardBg,
                borderColor: isFocused ? PRIMARY : borderColor,
                borderWidth: isFocused ? 1.5 : 1,
              },
            ]}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={isFocused ? PRIMARY : subTextColor}
              style={{ marginRight: 10 }}
            />
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: textColor }]}
              placeholder="e.g. Gift, Tithe, Offering..."
              placeholderTextColor={isDark ? "#71717A" : "#A1A1AA"}
              value={reason}
              onChangeText={setReason}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              selectionColor={PRIMARY}
            />
            {reason.length > 0 && (
              <TouchableOpacity
                onPress={() => setReason("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={subTextColor}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Continue Button */}
          <View style={styles.buttonOuter}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {},
                  );
                }
                handleSubmit();
              }}
              unstable_pressDelay={0}
              accessibilityRole="button"
              accessibilityLabel="Continue to payment"
              android_ripple={{
                color: "rgba(255, 255, 255, 0.28)",
                borderless: false,
                foreground: true,
              }}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: PRIMARY },
                Platform.OS === "ios" &&
                  pressed && {
                    opacity: 0.88,
                    transform: [{ scale: 0.99 }],
                  },
              ]}
            >
              <Text style={styles.buttonText}>Continue to Payment</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBottomSheet>
  );
};

export default ReasonModal;

const styles = StyleSheet.create({
  keyboardAvoid: {
    width: "100%",
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 0,
  },
  buttonOuter: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  button: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
