import { AlertCard } from "@/components/AlertCard";
import { useTheme } from "@/context/ThemeContext";
import { useAlerts } from "@/hooks/useAlerts";
import { registerForPushNotificationsAsync } from "@/utils/notificationService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
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
  const { top } = useSafeAreaInsets();
  const isDark = theme === "dark";
  const { alerts, loading, deleteAlert, toggleAlert } = useAlerts();
  const router = useRouter();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const handleAddPress = () => {
    router.push("/reminders/manage");
  };

  const handleEditPress = (id: string) => {
    router.push({
      pathname: "/reminders/manage",
      params: { id },
    });
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="flex-1" style={{ paddingTop: top + 10 }}>
        {/* HEADER */}
        <View className="px-6 mb-8 flex-row justify-between items-end">
          <View>
            <Text
              className={`text-4xl font-black ${isDark ? "text-white" : "text-black"}`}
            >
              Alerts
            </Text>
            <Text
              className={`text-sm font-bold mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {alerts.length} active schedule{alerts.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAddPress}
            activeOpacity={0.8}
            className="w-14 h-14 rounded-2xl bg-orange-500 items-center justify-center shadow-lg shadow-orange-500/40"
          >
            <Ionicons name="add" size={32} color="white" />
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
                onEdit={() => handleEditPress(item.id)}
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
                  activeOpacity={0.8}
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
    </View>
  );
};

export default Reminder;
