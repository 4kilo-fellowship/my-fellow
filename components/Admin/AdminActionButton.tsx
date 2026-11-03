import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PRIMARY } from "@/constants";

interface Props {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const AdminActionButton: React.FC<Props> = ({
  label,
  onPress,
  icon = "add",
}) => {
  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{
        color: "rgba(255, 103, 25, 0.25)",
        borderless: false,
        foreground: true,
      }}
      style={styles.pill}
    >
      <Ionicons name={icon} size={15} color={PRIMARY} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 103, 25, 0.35)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    color: PRIMARY,
    includeFontPadding: false,
  },
});
