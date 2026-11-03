import { PRIMARY } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface QuickActionItem {
  id: string | number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isNew?: boolean;
}

interface QuickActionProps {
  item: QuickActionItem;
  isDark?: boolean;
  onPress?: () => void;
}

const QuickAction = ({ item, isDark = false, onPress }: QuickActionProps) => {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onPress?.();
  };

  const rippleColor = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(0, 0, 0, 0.08)";

  const isSocial = item.id === "5" || item.id === "6" || item.id === "8";
  const isNew = !!item.isNew;

  return (
    <View style={styles.container}>
      <View style={styles.iconBoxRelative}>
        <View
          style={[
            styles.iconBoxOuter,
            { backgroundColor: isDark ? "#262626" : "#f1f5f9" },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={handlePress}
            unstable_pressDelay={0}
            android_ripple={{
              color: rippleColor,
              borderless: false,
              foreground: true,
            }}
            style={styles.iconPressable}
          >
            <View style={styles.iconCenterWrapper}>
              {isSocial ? (
                <FontAwesome5
                  name={item.icon}
                  size={31}
                  color={isDark ? "#f1f5f9" : "#0f172a"}
                />
              ) : (
                <Ionicons
                  name={item.icon}
                  size={33}
                  color={isDark ? "#f1f5f9" : "#0f172a"}
                />
              )}
            </View>
          </Pressable>
        </View>

        {isNew && (
          <View
            pointerEvents="none"
            style={[
              styles.badgeContainer,
              {
                borderColor: isDark ? "#121212" : "#ffffff",
              },
            ]}
          >
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
      </View>
      <Pressable
        onPress={handlePress}
        unstable_pressDelay={0}
        hitSlop={{ top: 4, bottom: 8, left: 8, right: 8 }}
        style={styles.labelContainer}
      >
        <Text
          numberOfLines={1}
          style={[styles.label, { color: isDark ? "#cbd5e1" : "#475569" }]}
        >
          {item.label}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: 68,
    marginRight: 8,
  },
  iconBoxRelative: {
    position: "relative",
    width: 56,
    height: 56,
  },
  badgeContainer: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: PRIMARY,
    paddingHorizontal: 4.5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    zIndex: 10,
    elevation: 3,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  iconBoxOuter: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  iconPressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCenterWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    marginTop: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },
});

export default QuickAction;
