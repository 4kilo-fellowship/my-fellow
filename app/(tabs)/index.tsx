import { Ionicons } from "@expo/vector-icons"; // Assuming you are using Expo, otherwise use your preferred icon lib
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Home = () => {
  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-6 pt-6 pb-1 bg-white shadow-sm">
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/images/header.png")}
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity>
          <Ionicons name="settings-outline" size={28} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Body*/}
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400">Content</Text>
      </View>
    </View>
  );
};

export default Home;
