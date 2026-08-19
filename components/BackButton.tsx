import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

interface BackButtonProps {
  onPress: () => void;
  isDark?: boolean;
  overlay?: boolean;
}

export default function BackButton({
  onPress,
  isDark = false,
  overlay = false,
}: BackButtonProps) {
  const bg = overlay
    ? "bg-white/25 border border-white/30"
    : isDark
      ? "bg-slate-800 border border-slate-700"
      : "bg-slate-100 border border-slate-200";
  const color = overlay ? "white" : isDark ? "white" : "#0f172a";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      className={`w-11 h-11 rounded-full items-center justify-center shadow-md ${bg}`}
    >
      <Ionicons name="arrow-back" size={24} color={color} />
    </TouchableOpacity>
  );
}