import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
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
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dayString = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return (
    <View
      className={`mb-4 px-5 py-5 rounded-[32px] overflow-hidden border ${
        isDark ? "bg-[#1C1C1E] border-gray-800" : "bg-white border-gray-100"
      } flex-row items-center justify-between`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <TouchableOpacity
        onPress={onEdit}
        activeOpacity={0.7}
        className="flex-1 mr-4"
      >
        <View className="flex-row items-center mb-1.5">
          <Text
            className={`text-2xl font-black ${isDark ? "text-white" : "text-black"}`}
          >
            {timeString}
          </Text>
          <View
            className={`ml-3 px-3 py-1 rounded-full ${
              isDark ? "bg-orange-500/10" : "bg-orange-50"
            }`}
          >
            <Text
              className={`text-[10px] font-black uppercase tracking-widest ${
                isDark ? "text-orange-400" : "text-orange-600"
              }`}
            >
              {alert.repeats === "none" ? dayString : alert.repeats}
            </Text>
          </View>
        </View>

        <View className="pr-4">
          <Text
            className={`text-base font-bold mb-0.5 ${
              isDark ? "text-gray-200" : "text-gray-900"
            }`}
            numberOfLines={1}
          >
            {alert.title}
          </Text>
        </View>

        {alert.remindBefore > 0 && (
          <View className="flex-row items-center mt-2">
            <Ionicons
              name="notifications-outline"
              size={12}
              color={isDark ? "#4b5563" : "#9ca3af"}
            />
            <Text
              className={`text-[10px] font-bold ml-1 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Alert {alert.remindBefore}m before
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View className="flex-row items-center">
        <Switch
          value={alert.enabled}
          onValueChange={onToggle}
          trackColor={{
            false: isDark ? "#3A3A3C" : "#D1D1D6",
            true: "#f97316",
          }}
          thumbColor="#fff"
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
        <TouchableOpacity
          onPress={onDelete}
          className={`ml-1 p-3 rounded-full ${
            isDark ? "bg-red-500/10" : "bg-red-50"
          }`}
        >
          <Ionicons name="trash" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
