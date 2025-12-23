import { Ionicons } from "@expo/vector-icons"; // Expo icons
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Home = () => {
  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-6 pt-6 pb-2 h-28 bg-white shadow-sm">
        <Image
          source={require("../../assets/images/header.png")}
          className="w-24 h-24"
          resizeMode="contain"
        />

        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={36} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400">Content</Text>
      </View>
    </View>
  );
};

export default Home;
