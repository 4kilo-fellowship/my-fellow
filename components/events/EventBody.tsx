import { EventDetail } from "@/types/events.types";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { ScrollView, Text, View } from "react-native";

interface EventBodyProps {
  event: EventDetail;
  isDark: boolean;
}

const EventBody = ({ event, isDark }: EventBodyProps) => {
  const description =
    event.fullDescription ||
    event.shortDescription ||
    event.description ||
    "No description available for this event.";

  return (
    <View
      className={`flex-1 -mt-6 rounded-t-3xl px-6 pt-8 ${
        isDark ? "bg-[#1A1A1B]" : "bg-white"
      }`}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="mb-6">
          <Text
            className={`text-lg font-bold mb-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            About this Event
          </Text>
          <Text
            className={`text-base leading-7 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {description}
          </Text>
        </View>

        {event.location && (
          <View
            className={`p-4 rounded-xl border mb-6 flex-row items-start ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Ionicons name="location" size={20} color="#0369A1" />
            </View>
            <View className="flex-1">
              <Text
                className={`font-bold text-base mb-1 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Location
              </Text>
              <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {event.location}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default memo(EventBody);
