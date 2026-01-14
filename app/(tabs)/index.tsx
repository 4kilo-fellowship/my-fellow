import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
      {/* HEADER */}
      <View
        className={`flex-row justify-between items-center px-6 pt-6 pb-2 h-28 ${
          isDark ? "bg-[#1A1A1B]" : "bg-white"
        } shadow-sm`}
      >
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
          <Ionicons
            name="person-circle-outline"
            size={36}
            color={isDark ? "#f1f5f9" : "#1e293b"}
          />
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <View className="flex-1 items-center justify-center">
        <Text className={isDark ? "text-gray-300" : "text-gray-400"}>
          Content
        </Text>
        <TouchableOpacity>
          <Text>Click here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Home;
