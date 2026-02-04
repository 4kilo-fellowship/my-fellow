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
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dayString = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  const handleDelete = () => {
    Alert.alert("Delete Alert", "Are you sure you want to delete this alert?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View
      className={`mb-4 px-5 py-5 rounded-[32px] overflow-hidden border ${
        isDark ? "bg-[#1C1C1E] border-gray-800" : "bg-white border-gray-100"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.7}
          className="flex-row items-center"
        >
          <Text
            className={`text-3xl font-black ${isDark ? "text-white" : "text-black"}`}
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
        </TouchableOpacity>

        <Switch
          value={alert.enabled}
          onValueChange={onToggle}
          trackColor={{
            false: isDark ? "#3A3A3C" : "#D1D1D6",
            true: "#f97316",
          }}
          thumbColor="#fff"
          style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }] }}
        />
      </View>

      <TouchableOpacity onPress={onEdit} activeOpacity={0.7} className="mb-3">
        <Text
          className={`text-lg font-bold mb-1 ${
            isDark ? "text-gray-200" : "text-gray-900"
          }`}
          numberOfLines={1}
        >
          {alert.title}
        </Text>
        {alert.description ? (
          <Text
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
            numberOfLines={2}
          >
            {alert.description}
          </Text>
        ) : null}
      </TouchableOpacity>

      <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-gray-100/10">
        <View className="flex-row items-center">
          {alert.remindBefore > 0 && (
            <View className="flex-row items-center bg-gray-500/10 px-2 py-1 rounded-lg">
              <Ionicons
                name="notifications-outline"
                size={12}
                color={isDark ? "#f97316" : "#f97316"}
              />
              <Text
                className={`text-[10px] font-bold ml-1 ${
                  isDark ? "text-orange-400" : "text-orange-600"
                }`}
              >
                {alert.remindBefore}m before
              </Text>
            </View>
          )}
          <View className="flex-row items-center ml-2 bg-gray-500/10 px-2 py-1 rounded-lg">
            <Ionicons
              name="volume-high-outline"
              size={12}
              color={isDark ? "#f97316" : "#f97316"}
            />
            <Text
              className={`text-[10px] font-bold ml-1 ${
                isDark ? "text-orange-400" : "text-orange-600"
              }`}
            >
              Sound On
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleDelete}
          className={`p-4 rounded-2xl ${
            isDark ? "bg-red-500/20" : "bg-red-50"
          }`}
        >
          <Ionicons name="trash" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
