import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Text,
  TouchableOpacity,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps {
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

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "right",
  iconSize = 22,
  iconColor,
  isDark = false,
  fullWidth = true,
  className = "",
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return isDark
          ? "bg-slate-800"
          : "bg-slate-100";
      case "outline":
        return "bg-transparent border-2 border-primary";
      case "ghost":
        return "bg-transparent";
      case "primary":
      default:
        return "bg-primary shadow-lg shadow-primary/40";
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
        return "py-3 px-4";
      case "md":
        return "py-4 px-5";
      case "lg":
      default:
        return "py-5 px-6";
    }
  };

  const finalIconColor =
    iconColor || (variant === "primary" ? "white" : "#ff6719");

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={isDisabled}
      className={`${fullWidth ? "w-full" : ""} ${getVariantStyles()} ${getSizeStyles()} rounded-2xl flex-row justify-center items-center space-x-2 active:scale-[0.98] ${
        isDisabled ? "opacity-60" : ""
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
          <Text className={`${getTextColor()} font-bold text-lg tracking-wide`}>
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons name={icon} size={iconSize} color={finalIconColor} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
