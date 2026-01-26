import { AlertCard } from "@/components/AlertCard";
import { AlertModal } from "@/components/AlertModal";
import { useTheme } from "@/context/ThemeContext";
import { AlertItem, useAlerts } from "@/hooks/useAlerts";
import { registerForPushNotificationsAsync } from "@/utils/notificationService";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Reminder = () => {
  const { theme } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const isDark = theme === "dark";
  const { alerts, loading, addAlert, updateAlert, deleteAlert, toggleAlert } =
    useAlerts();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertItem | undefined>();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const handleAddPress = () => {
    setEditingAlert(undefined);
    setModalVisible(true);
  };

  const handleEditPress = (alert: AlertItem) => {
    setEditingAlert(alert);
    setModalVisible(true);
  };

  const handleSaveAlert = (
    alertData: Omit<AlertItem, "id" | "enabled"> | AlertItem,
  ) => {
    if ("id" in alertData) {
      updateAlert(alertData as AlertItem);
    } else {
      addAlert(alertData);
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="flex-1" style={{ paddingTop: top + 10 }}>
        {/* HEADER */}
        <View className="px-6 mb-8 flex-row justify-between items-end">
          <View>
            <Text
              className={`text-4xl font-black ${isDark ? "text-white" : "text-black"}`}
            >
              Reminders
            </Text>
            <Text
              className={`text-sm font-bold mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {alerts.length} active schedule{alerts.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAddPress}
            activeOpacity={0.7}
            className="w-12 h-12 rounded-2xl bg-orange-500 items-center justify-center shadow-lg shadow-orange-500/40"
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AlertCard
                alert={item}
                isDark={isDark}
                onToggle={() => toggleAlert(item.id)}
                onDelete={() => deleteAlert(item.id)}
                onEdit={() => handleEditPress(item)}
              />
            )}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 120,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center pt-32">
                <View
                  className={`w-24 h-24 rounded-[32px] items-center justify-center mb-6 ${
                    isDark ? "bg-gray-800/50" : "bg-gray-50"
                  }`}
                >
                  <Ionicons
                    name="notifications-off-outline"
                    size={48}
                    color={isDark ? "#4b5563" : "#d1d5db"}
                  />
                </View>
                <Text
                  className={`text-xl font-black mb-2 text-center ${
                    isDark ? "text-gray-300" : "text-gray-800"
                  }`}
                >
                  Stay Notified
                </Text>
                <Text
                  className={`text-center px-12 leading-5 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Create reminders for your events and we'll alert you exactly
                  when you need.
                </Text>

                <TouchableOpacity
                  onPress={handleAddPress}
                  className="mt-8 bg-orange-500/10 px-8 py-4 rounded-2xl"
                >
                  <Text className="text-orange-500 font-bold">
                    Add Your First Alert
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      <AlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAlert}
        initialAlert={editingAlert}
        isDark={isDark}
      />
    </View>
  );
};

export default Reminder;
