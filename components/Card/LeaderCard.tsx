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
      className={`mb-5 rounded-[28px] p-6 border ${
        isDark ? "bg-[#1C1C1E] border-gray-800" : "bg-white border-gray-100"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.4 : 0.05,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      {/* header section*/}
      <View className="flex-row items-start">
        <View>
          <Image
            source={item.image}
            style={{ width: 72, height: 72, borderRadius: 36 }}
            contentFit="cover"
          />
        </View>

        <View className="flex-1 ml-4 pt-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center">
                <Text
                  className={`text-lg font-bold mr-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {item.isVerified && (
                  <Ionicons name="checkmark-circle" size={18} color={PRIMARY} />
                )}
              </View>
              <Text
                className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {item.telegram}
              </Text>
            </View>
            <View className="bg-orange-500/10 px-3 py-2 rounded-full border border-orange-500/20">
              <Text className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">
                {item.role}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bio Section */}
      <View className="mt-6">
        <Text
          className={`text-[15px] leading-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}
          numberOfLines={4}
        >
          {item.bio}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="mt-6 flex-row gap-3">
        <TouchableOpacity
          onPress={onCall}
          activeOpacity={0.8}
          className="flex-1 h-12 bg-orange-500 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-500/30"
        >
          <Ionicons name="call" size={18} color="white" />
          <Text className="text-white font-bold ml-2">Call Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTelegram}
          activeOpacity={0.8}
          className={`flex-1 h-12 rounded-2xl flex-row items-center justify-center border ${
            isDark
              ? "bg-[#2A2A2C] border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <Ionicons
            name="paper-plane"
            size={18}
            color={isDark ? "#38BDF8" : "#0EA5E9"}
          />
          <Text
            className={`font-bold ml-2 ${isDark ? "text-white" : "text-gray-700"}`}
          >
            Telegram
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LeaderCard;
