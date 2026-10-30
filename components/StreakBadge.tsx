import { useTheme } from "@/context/ThemeContext";
import { useStreakStore } from "@/stores/streak.store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
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
    <View
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
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Devotion streak: ${currentStreak} days`}
        android_ripple={{
          color: isDark ? "rgba(255, 102, 25, 0.22)" : "rgba(255, 102, 25, 0.14)",
          borderless: false,
        }}
        style={({ pressed }) => [
          styles.pressableInner,
          pressed && Platform.OS === "ios" && { opacity: 0.75 },
        ]}
      >
        <View style={styles.contentRow}>
          <Ionicons
            name="flame"
            size={21}
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
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
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
  pressableInner: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "nowrap",
  },
  streakText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
    includeFontPadding: false,
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
