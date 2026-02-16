import { PRIMARY } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  item: any;
  isDark: boolean;
  onCall: () => void;
  onTelegram: () => void;
}

const LeaderCard = ({ item, isDark, onCall, onTelegram }: Props) => {
  return (
    <View
      className={`mb-4 rounded-[24px] p-5 border ${
        isDark ? "bg-[#111] border-[#222]" : "bg-[#f9fafb] border-gray-200"
      }`}
    >
      {/* Header Section */}
      <View className="flex-row items-center">
        <Image
          source={item.image}
          style={{ width: 56, height: 56, borderRadius: 28 }}
          contentFit="cover"
          className={`border-2 ${isDark ? "border-[#333]" : "border-white"}`}
        />

        <View className="flex-1" style={{ marginLeft: 16 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-0">
                <Text
                  className={`text-[17px] font-bold mr-1.5 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={PRIMARY} />
                )}
              </View>
              <Text
                className={`text-[13px] font-medium ${
                  isDark ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {item.telegram}
              </Text>
            </View>

            <View
              className={`px-3 py-1.5 rounded-lg border ${
                isDark ? "bg-[#222] border-[#333]" : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {item.role}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bio Section */}
      <View className="mt-4 mb-5">
        <Text
          className={`text-[14px] leading-[22px] ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
          numberOfLines={3}
        >
          {item.bio}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onCall}
          activeOpacity={0.7}
          className={`flex-1 h-11 rounded-xl flex-row items-center justify-center border ${
            isDark
              ? "bg-[#1C1C1E] border-[#333]"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <Ionicons name="call" size={18} color={PRIMARY} />
          <Text
            className={`text-[13px] font-bold ml-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Call
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTelegram}
          activeOpacity={0.7}
          className={`flex-1 h-11 rounded-xl flex-row items-center justify-center border ${
            isDark
              ? "bg-[#1C1C1E] border-[#333]"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <Ionicons
            name="paper-plane-outline"
            size={18}
            color={isDark ? "#fff" : "#1f2937"}
          />
          <Text
            className={`text-[13px] font-bold ml-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Telegram
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LeaderCard;
