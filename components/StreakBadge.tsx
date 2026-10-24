import { useTheme } from "@/context/ThemeContext";
import { useStreakStore } from "@/stores/streak.store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface StreakBadgeProps {
  onPress: () => void;
}

export const StreakBadge = ({ onPress }: StreakBadgeProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { currentStreak, isCompletedToday, checkStreak } = useStreakStore();

  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  const completed = isCompletedToday();

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics optional fallback
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Devotion streak: ${currentStreak} days`}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#2c2c2e" : "#ffffff",
          borderColor: completed
            ? "#ff6619"
            : isDark
              ? "#3c3c3e"
              : "#e5e7eb",
          borderWidth: completed ? 1.8 : 1.5,
        },
      ]}
    >
      <Ionicons
        name="flame"
        size={18}
        color={completed ? "#ff6619" : "#ff8533"}
      />
      <Text
        style={[
          styles.streakText,
          {
            color: isDark ? "#ffffff" : "#1f2937",
          },
        ]}
      >
        {currentStreak}
      </Text>
      {completed && (
        <View style={styles.activeDot} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    paddingHorizontal: 11,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  streakText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff6619",
    marginLeft: 1,
  },
});

export default StreakBadge;
