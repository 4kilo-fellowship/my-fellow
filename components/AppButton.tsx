import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Text,
  Pressable,
} from "react-native";

export type AppButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "ghost";
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
  iconSize = 20,
  iconColor,
  isDark = false,
  fullWidth = true,
  className = "",
  width,
}: AppButtonProps) {
  const text = label ?? title ?? "";
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return isDark
          ? "bg-slate-800"
          : "bg-slate-100";
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
    if (variant === "secondary") return isDark ? "text-slate-200" : "text-slate-800";
    return "text-primary";
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "min-h-11 px-4";
      case "md":
        return "min-h-12 px-5";
      case "lg":
      default:
        return "min-h-[52px] px-6";
    }
  };

  const finalIconColor =
    iconColor || (variant === "primary" ? "white" : "#ff6719");

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${fullWidth ? "w-full" : ""} ${getVariantStyles()} ${getSizeStyles()} rounded-2xl flex-row justify-center items-center gap-2 ${
        isDisabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "white" : "#ff6719"}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons name={icon} size={iconSize} color={finalIconColor} />
          )}
          <Text className={`${getTextColor()} font-semibold text-base`}>
            {text}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons name={icon} size={iconSize} color={finalIconColor} />
          )}
        </>
      )}
    </Pressable>
  );
}




