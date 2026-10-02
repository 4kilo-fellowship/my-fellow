import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Platform,
  Pressable,
  Text,
} from "react-native";

export type AppButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps {
  title?: string;
  label?: string;
  onPress: () => void;
  variant?: AppButtonVariant;
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

export default function AppButton({
  title,
  label,
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
  className = "",
  width,
}: AppButtonProps) {
  const text = label ?? title ?? "";
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return isDark ? "bg-slate-800" : "bg-slate-100";
      case "outline":
        return "bg-transparent border border-primary";
      case "ghost":
        return "bg-transparent";
      case "primary":
      default:
        return "bg-primary";
    }
  };

  const getTextColor = () => {
    if (variant === "primary") return "text-white";
    if (variant === "secondary")
      return isDark ? "text-slate-200" : "text-slate-800";
    return "text-primary";
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "h-11 px-4";
      case "md":
        return "h-12 px-5";
      case "lg":
      default:
        return "h-14 px-6";
    }
  };

  const buttonHeight = size === "sm" ? 38 : size === "md" ? 48 : 56;

  const finalIconColor =
    iconColor || (variant === "primary" ? "white" : "#ff6719");

  const fontSize = size === "sm" ? 14 : 16;
  const defaultIconSize = size === "sm" ? 16 : 18;

  const onLightBackground =
    variant === "outline" || variant === "ghost" || variant === "secondary";
  const rippleColor = onLightBackground
    ? "rgba(0, 0, 0, 0.12)"
    : "rgba(255, 255, 255, 0.28)";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      pointerEvents={isDisabled ? "none" : "auto"}
      onPress={handlePress}
      pressRetentionOffset={8}
      android_ripple={
        !isDisabled
          ? {
              color: rippleColor,
              borderless: false,
              foreground: true,
            }
          : undefined
      }
      style={({ pressed }) => [
        {
          height: buttonHeight,
          minHeight: buttonHeight,
          borderRadius: 9999,
          overflow: "hidden",
          opacity: isDisabled ? 0.5 : Platform.OS === "ios" && pressed ? 0.85 : 1,
        },
        width ? { width } : undefined,
        !isDisabled && variant === "primary"
          ? {
              shadowColor: "#ff6719",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
              elevation: 4,
            }
          : undefined,
      ]}
      className={`${fullWidth ? "w-full" : ""} ${getVariantStyles()} ${getSizeStyles()} ${
        isDisabled ? "opacity-50" : "opacity-100"
      } rounded-full flex-row justify-center items-center gap-2.5 ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "white" : "#ff6719"}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={iconSize ?? defaultIconSize}
              color={finalIconColor}
            />
          )}
          <Text
            style={{
              fontSize,
              fontWeight: "700",
              lineHeight: 22,
            }}
            className={`${getTextColor()} text-center`}
          >
            {text}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={iconSize ?? defaultIconSize}
              color={finalIconColor}
            />
          )}
        </>
      )}
    </Pressable>
  );
}
