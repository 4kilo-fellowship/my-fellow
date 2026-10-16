import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ScreenHeaderProps = {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  borderBottom?: boolean;
};

/**
 * ScreenHeader - Standard header matching prime-capital design:
 * - Perfectly centered title (absolutely positioned with pointerEvents="none")
 * - 44x44 circular back button (Apple HIG 44pt touch target)
 * - Centered arrow-back icon with theme-aware ripple and iOS active state
 * - Balanced right slot with placeholder
 */
export function ScreenHeader({
  title,
  onBack,
  rightAction,
  style,
  containerStyle,
  borderBottom = true,
}: ScreenHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = onBack || (() => router.back());
  const headerTopInset = Math.max(insets.top + 6, 12);

  const bgColor = isDark ? "#0A0A0A" : "#ffffff";
  const borderColor = isDark ? "#1f2937" : "#e5e7eb";
  const iconColor = isDark ? "#ffffff" : "#0f172a";
  const titleColor = isDark ? "#ffffff" : "#0f172a";
  const rippleColor = isDark
    ? "rgba(255, 255, 255, 0.16)"
    : "rgba(0, 0, 0, 0.12)";
  const buttonBg = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)";

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: headerTopInset,
          backgroundColor: bgColor,
          borderBottomWidth: borderBottom ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: borderColor,
        },
        containerStyle,
      ]}
    >
      <View style={[styles.centeredRow, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          android_ripple={{
            color: rippleColor,
            borderless: true,
            radius: 22,
          }}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: buttonBg,
              ...(Platform.OS === "ios" && pressed
                ? { backgroundColor: rippleColor }
                : null),
            },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={iconColor} />
        </Pressable>

        <View style={styles.titleCenterContainer} pointerEvents="none">
          {title ? (
            <Text
              style={[styles.centeredTitle, { color: titleColor }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightSlot}>
          {rightAction || <View style={styles.placeholderBtn} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    justifyContent: "center",
    zIndex: 20,
  },
  centeredRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    position: "relative",
  },
  titleCenterContainer: {
    position: "absolute",
    left: 56,
    right: 56,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  rightSlot: {
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  placeholderBtn: {
    width: 44,
    height: 44,
  },
});

export default ScreenHeader;
