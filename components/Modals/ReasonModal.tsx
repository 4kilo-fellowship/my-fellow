import { AppBottomSheet } from "@/components/AppBottomSheet";
import { PRIMARY } from "@/constants/colors";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ReasonModalProps {
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
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState("");

  const containerBg = isDark ? "#18181B" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#09090B";
  const subTextColor = isDark ? "#A1A1AA" : "#888888";
  const inputBg = isDark ? "#27272A" : "#F2F2F2";

  const handleContinue = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onSubmit(trimmed);
  };

  const isEnabled = reason.trim().length > 0;

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      snapPoints={["half", "full"]}
    >
      <View
        style={{
          width: "100%",
          paddingHorizontal: 4,
          paddingBottom: Math.max(insets.bottom, 12),
        }}
      >
        <Text style={[styles.title, { color: textColor }]}>
          Provide a Reason
        </Text>
        <Text
          style={{
            color: subTextColor,
            marginTop: 4,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          What is this payment or contribution for?
        </Text>

        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="e.g. Gift, Tithe, Offering"
          placeholderTextColor={isDark ? "#71717A" : "#A1A1AA"}
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              color: textColor,
            },
          ]}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          selectionColor={PRIMARY}
        />

        <View style={{ height: 20 }} />
        <Pressable
          disabled={!isEnabled}
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: isEnabled
                ? PRIMARY
                : isDark
                  ? "#3F3F46"
                  : "#FFC9A8",
              opacity: pressed && isEnabled ? 0.88 : 1,
            },
          ]}
        >
          <Text style={styles.buttonText}>Continue to Payment →</Text>
        </Pressable>
      </View>
    </AppBottomSheet>
  );
};

export default ReasonModal;

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
