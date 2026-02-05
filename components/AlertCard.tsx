import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Switch, Text, TouchableOpacity, View } from "react-native";
import { AlertItem } from "../hooks/useAlerts";

interface AlertCardProps {
  alert: AlertItem;
  isDark: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export const AlertCard = ({
  alert,
  isDark,
  onToggle,
  onDelete,
  onEdit,
}: AlertCardProps) => {
  const date = new Date(alert.time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

  const dayString = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Alert",
      "Are you sure you want to delete this alert? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ],
      { cancelable: true },
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onEdit}
      className={`mb-3 px-6 py-5 rounded-[20px] flex-row items-center justify-between ${
        isDark ? "bg-[#1C1C1E]" : "bg-white"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View className="flex-row items-baseline">
        <Text
          className={`text-4xl font-medium tracking-tight ${
            isDark ? "text-white/90" : "text-gray-500"
          }`}
        >
          {displayHours}:{displayMinutes}
        </Text>
        <Text
          className={`ml-1 text-lg font-medium ${
            isDark ? "text-white/40" : "text-gray-300"
          }`}
        >
          {ampm}
        </Text>
      </View>

      <Text
        className={`ml-4 text-sm font-medium flex-1 text-right mr-3 ${
          isDark ? "text-white/30" : "text-gray-400"
        }`}
      >
        {alert.repeats === "none"
          ? dayString
          : alert.repeats === "daily"
            ? "Every day"
            : `${new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)}, ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)}`}
      </Text>

      <TouchableOpacity
        onPress={handleDelete}
        className="w-10 h-10 items-center justify-center mr-1"
      >
        <Ionicons
          name="trash-outline"
          size={22}
          color={isDark ? "#ff453a" : "#ef4444"}
        />
      </TouchableOpacity>

      <Switch
        value={alert.enabled}
        onValueChange={onToggle}
        trackColor={{
          false: isDark ? "#3A3A3C" : "#E2E8F0",
          true: "#f97316",
        }}
        thumbColor="#fff"
        ios_backgroundColor={isDark ? "#3A3A3C" : "#E2E8F0"}
      />
    </TouchableOpacity>
  );
};
