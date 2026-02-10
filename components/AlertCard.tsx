import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { AlertItem } from "../hooks/useAlerts";
import { ConfirmModal } from "./Modals/ConfirmModal";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeletePress = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onEdit}
        className={`mb-3 px-6 h-32 rounded-xl flex-row items-center justify-between border  ${
          isDark ? "bg-zinc-800 border-gray-800" : "bg-gray-50 border-gray-200"
        }`}
      >
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className={`text-sm font-bold uppercase tracking-wider mb-1 ${
              isDark ? "text-orange-400" : "text-orange-500"
            }`}
          >
            {alert.title}
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className={`text-4xl font-black tracking-tight ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {displayHours}:{displayMinutes}
            </Text>
            <Text
              className={`ml-1 text-lg font-bold ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {ampm}
            </Text>
          </View>
        </View>

        <View className="items-end mr-3">
          <Text
            className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Schedule
          </Text>
          <Text
            className={`text-xs font-bold ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {alert.repeats === "none"
              ? dayString
              : alert.repeats === "daily"
                ? "Every day"
                : `${new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)}, ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)}`}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDeletePress}
          className="w-10 h-10 items-center justify-center mr-1"
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color={isDark ? "#ef4444" : "#dc2626"}
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

      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        isDark={isDark}
        icon="trash-outline"
        title="Delete Reminder"
        description="This action will permanently remove this alert from your schedule."
        buttons={[
          {
            label: "Delete",
            onPress: handleConfirmDelete,
            variant: "danger",
          },
        ]}
        cancelButton={{
          label: "Cancel",
        }}
      />
    </>
  );
};
