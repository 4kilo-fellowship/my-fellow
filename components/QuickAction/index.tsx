import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuickActionItem {
  id: string | number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface QuickActionProps {
  item: QuickActionItem;
  isDark?: boolean;
  onPress?: () => void;
}

const QuickAction = ({ item, isDark = false, onPress }: QuickActionProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.container}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: isDark ? "#262626" : "#f1f5f9" },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={40}
          color={isDark ? "white" : "#121212"}
        />
      </View>
      <Text style={[styles.label, { color: isDark ? "#cbd5e1" : "#475569" }]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginRight: 16,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
  },
});

export default QuickAction;
