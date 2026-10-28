import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { PRIMARY } from "@/constants/colors";

export interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "dark";
  shape?: "pill" | "rounded";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  haptic?: boolean;
  isDark?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  shape = "pill",
  fullWidth = true,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  haptic = true,
  isDark = false,
}) => {
  const isActionDisabled = disabled || loading;

  const handlePress = () => {
    if (isActionDisabled) return;
    if (haptic && Platform.OS !== "web") {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onPress();
  };

  const getContainerStyle = (): StyleProp<ViewStyle> => {
    if (isActionDisabled && !loading) {
      return [
        styles.disabledPillContainer,
        {
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "#ECECF1",
        },
      ];
    }
    switch (variant) {
      case "dark":
        return styles.darkContainer;
      case "secondary":
        return [
          styles.secondaryContainer,
          { backgroundColor: isDark ? "#27272A" : "#F1F5F9" },
        ];
      case "outline":
        return [
          styles.outlineContainer,
          { borderColor: isDark ? "#3F3F46" : "#E2E8F0" },
        ];
      case "primary":
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    if (isActionDisabled && !loading) {
      return [
        styles.disabledPillText,
        { color: isDark ? "#52525B" : "#8E8EA0" },
      ];
    }
    switch (variant) {
      case "dark":
        return styles.darkText;
      case "secondary":
        return [
          styles.secondaryText,
          { color: isDark ? "#F4F4F5" : "#0F172A" },
        ];
      case "outline":
        return [
          styles.outlineText,
          { color: isDark ? "#F4F4F5" : "#334155" },
        ];
      case "primary":
      default:
        return styles.primaryText;
    }
  };

  const rippleColor =
    variant === "outline" || variant === "secondary" || (isActionDisabled && !loading)
      ? isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.08)"
      : "rgba(255, 255, 255, 0.25)";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isActionDisabled, busy: loading }}
      onPress={handlePress}
      disabled={isActionDisabled}
      style={({ pressed }) => [
        styles.baseContainer,
        shape === "pill" ? styles.pillShape : styles.roundedShape,
        fullWidth && styles.fullWidth,
        getContainerStyle(),
        !isActionDisabled && variant === "primary" && styles.primaryShadow,
        loading && styles.loadingContainer,
        pressed &&
          Platform.OS === "ios" &&
          !isActionDisabled &&
          styles.iosPressed,
        style,
      ]}
      android_ripple={{
        color: rippleColor,
        borderless: false,
        foreground: true,
      }}
    >
      <View style={styles.contentRow}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              variant === "outline" || variant === "secondary"
                ? isDark
                  ? "#FFFFFF"
                  : "#0F172A"
                : "#FFFFFF"
            }
            style={styles.spinner}
          />
        ) : (
          leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>
        )}

        <Text style={[getTextStyle(), textStyle]}>
          {loading ? "Please wait..." : title}
        </Text>

        {!loading && rightIcon && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    overflow: "hidden",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  pillShape: {
    borderRadius: 9999,
  },
  roundedShape: {
    borderRadius: 14,
  },
  primaryContainer: {
    backgroundColor: PRIMARY,
  },
  primaryShadow: {
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.32,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  darkContainer: {
    backgroundColor: "#0F172A",
  },
  secondaryContainer: {
    backgroundColor: "#F1F5F9",
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  disabledPillContainer: {
    backgroundColor: "#ECECF1",
  },
  loadingContainer: {
    opacity: 0.85,
  },
  iosPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  primaryText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#FFFFFF",
  },
  darkText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#FFFFFF",
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#0F172A",
  },
  outlineText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#334155",
  },
  disabledPillText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#8E8EA0",
  },
  leftIconContainer: {
    marginRight: 10,
  },
  rightIconContainer: {
    marginLeft: 10,
  },
  spinner: {
    marginRight: 8,
  },
});

export default AuthButton;
