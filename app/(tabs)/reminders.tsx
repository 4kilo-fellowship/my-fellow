import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Reminder = () => {
  const { theme } = useTheme();
  const { top } = useSafeAreaInsets();
  const isDark = theme === "dark";
  return (
    <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ paddingTop: top + 10, paddingBottom: 100 }}>
        {/* HEADER */}
        <View className="px-5 mb-4">
          <Text
            className={`text-4xl font-extrabold ${isDark ? "text-white" : "text-black"}`}
          >
            Reminders
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Reminder;
