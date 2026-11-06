import AppButton from "@/components/AppButton";
import { AppBottomSheet } from "@/components/AppBottomSheet";
import { PRIMARY } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
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

const QUICK_REASONS = ["Gift", "Tithe", "Offering", "Support"];

export const ReasonModal = ({
  visible,
  onClose,
  onSubmit,
  isDark = false,
}: ReasonModalProps) => {
  const [reason, setReason] = useState<string>("Gift");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      setReason("Gift");
      setIsFocused(false);
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

        {/* Quick Suggestions Chips */}
        <View style={styles.chipsRow}>
          {QUICK_REASONS.map((item) => {
            const isSelected = reason === item;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                      () => {},
                    );
                  }
                  setReason(item);
                }}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? "rgba(255, 103, 25, 0.2)"
                        : "rgba(255, 103, 25, 0.12)"
                      : cardBg,
                    borderColor: isSelected ? PRIMARY : borderColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? PRIMARY : subTextColor,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Text Input */}
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
            style={[
              styles.input,
              { color: textColor },
            ]}
            placeholder="e.g. Fellowship Support, Gift, etc."
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
        <View style={{ width: "100%", marginTop: 4 }}>
          <AppButton
            title="Continue to Payment"
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            icon="arrow-forward"
            iconPosition="right"
            isDark={isDark}
            fullWidth={true}
          />
        </View>
      </View>
    </AppBottomSheet>
  );
};

export default ReasonModal;

const styles = StyleSheet.create({
  sheetContainer: {
    paddingTop: 8,
    paddingBottom: 20,
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
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 0,
  },
});
