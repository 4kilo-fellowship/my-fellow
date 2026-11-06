import { AppBottomSheet } from "@/components/AppBottomSheet";
import { PRIMARY } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
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
      const t1 = setTimeout(() => inputRef.current?.focus(), 120);
      const t2 = setTimeout(() => inputRef.current?.focus(), 350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
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
      snapPoints={["half", "full"]}
    >
      <View style={styles.sheetContainer}>
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

        {/* Input Box */}
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
            autoFocus={true}
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

        {/* Action Button */}
        <View style={styles.actionSection}>
          <View
            style={[
              styles.nativeButtonOuter,
              { backgroundColor: PRIMARY },
              styles.buttonShadow,
            ]}
          >
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
              accessibilityLabel="Continue to Payment"
              android_ripple={{
                color: "rgba(255, 255, 255, 0.28)",
                borderless: false,
                foreground: true,
              }}
              style={({ pressed }) => [
                styles.nativeButtonInner,
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
              />
            </Pressable>
          </View>
        </View>
      </View>
    </AppBottomSheet>
  );
};

export default ReasonModal;

const styles = StyleSheet.create({
  sheetContainer: {
    width: "100%",
    paddingTop: 4,
    paddingBottom: Platform.OS === "ios" ? 16 : 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
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
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 0,
  },
  actionSection: {
    width: "100%",
    marginTop: 4,
  },
  nativeButtonOuter: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
  },
  nativeButtonInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#ff6719",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
