import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface NativeViewAllButtonProps {
  onPress: () => void;
  isDark: boolean;
  label?: string;
  accessibilityLabel?: string;
}

export const NativeViewAllButton: React.FC<NativeViewAllButtonProps> = ({
  onPress,
  isDark,
  label = "View all",
  accessibilityLabel = "View all",
}) => {
  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    onPress();
  };

  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(0, 0, 0, 0.06)";
  const pillBg = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(0, 0, 0, 0.05)";
  const textColor = isDark ? "#e2e8f0" : "#334155";
  const chevronColor = isDark ? "#94a3b8" : "#64748b";
  const rippleColor = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <View style={[styles.outerContainer, { borderColor, backgroundColor: pillBg }]}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        android_ripple={{
          color: rippleColor,
          borderless: false,
          foreground: true,
        }}
        style={styles.pressableInner}
      >
        <View style={styles.contentRow}>
          <Text numberOfLines={1} style={[styles.labelText, { color: textColor }]}>
            {label}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={12}
            color={chevronColor}
            style={styles.chevronIcon}
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 9999,
    borderWidth: 1,
    overflow: "hidden",
    alignSelf: "center",
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  pressableInner: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
  },
  labelText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  chevronIcon: {
    marginLeft: 3,
    flexShrink: 0,
  },
});
