import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface AuthButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  iconSize?: number;
  iconColor?: string;
  isDark?: boolean;
  fullWidth?: boolean;
  className?: string;
  width?: DimensionValue;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { bg: string; text: string; border?: string; ripple: string }
> = {
  primary: { bg: "#ff6719", text: "#ffffff", ripple: "rgba(255, 255, 255, 0.25)" },
  secondary: { bg: "#f1f5f9", text: "#1e293b", ripple: "rgba(0, 0, 0, 0.1)" },
  outline: { bg: "transparent", text: "#ff6719", border: "#ff6719", ripple: "rgba(255, 103, 25, 0.15)" },
  ghost: { bg: "transparent", text: "#ff6719", ripple: "rgba(255, 103, 25, 0.15)" },
};

const VARIANT_DARK_STYLES: Record<
  ButtonVariant,
  { bg: string; text: string; border?: string; ripple: string }
> = {
  primary: { bg: "#ff6719", text: "#ffffff", ripple: "rgba(255, 255, 255, 0.25)" },
  secondary: { bg: "#1e293b", text: "#e2e8f0", ripple: "rgba(255, 255, 255, 0.1)" },
  outline: { bg: "transparent", text: "#ff6719", border: "#ff6719", ripple: "rgba(255, 103, 25, 0.2)" },
  ghost: { bg: "transparent", text: "#ff6719", ripple: "rgba(255, 103, 25, 0.2)" },
};

const SIZE_STYLES: Record<ButtonSize, { py: number; text: number }> = {
  sm: { py: 12, text: 14 },
  md: { py: 16, text: 16 },
  lg: { py: 20, text: 18 },
};

export default function AuthButton({
  title,
  onPress,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "right",
  iconSize,
  iconColor,
  isDark = false,
  fullWidth = true,
  width,
}: AuthButtonProps) {
  const colors = isDark ? VARIANT_DARK_STYLES[variant] : VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;
  const finalIconColor = iconColor || colors.text;
  const finalIconSize = iconSize || sizeStyle.text + 4;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      android_ripple={{
        color: colors.ripple,
        borderless: false,
        foreground: true,
      }}
      style={({ pressed }) => [
        styles.button,
        {
          width: width ? width : fullWidth ? "100%" : "auto",
          backgroundColor: colors.bg,
          paddingVertical: sizeStyle.py,
          opacity: isDisabled ? 0.6 : pressed && Platform.OS === "ios" ? 0.85 : 1,
          borderWidth: colors.border ? 2 : 0,
          borderColor: colors.border || "transparent",
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={finalIconSize}
              color={finalIconColor}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeStyle.text,
                color: colors.text,
              },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={finalIconSize}
              color={finalIconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff6719",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
