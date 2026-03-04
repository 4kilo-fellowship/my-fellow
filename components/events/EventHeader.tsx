import { EventDetail } from "@/types/events.types";
import {
  formatEventDate,
  formatEventTime,
  getImageSource,
} from "@/utils/event.utils";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface EventHeaderProps {
  event: EventDetail;
  isGoingBack: boolean;
  onBack: () => void;
}

const EventHeader = ({ event, isGoingBack, onBack }: EventHeaderProps) => {
  const { top } = useSafeAreaInsets();
  const imageSource = getImageSource(event.image || event.imageUrl);
  const formattedDate = formatEventDate(event.startDate, event.endDate);
  const formattedTime = formatEventTime(event.startDate);

  return (
    <View className="h-[45vh] w-full relative">
      <ExpoImage
        source={imageSource}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.8)"]}
        className="absolute inset-0"
      />

      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.8}
        className="absolute left-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md"
        style={{ top: top + 10 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        {isGoingBack ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="arrow-back" size={24} color="#fff" />
        )}
      </TouchableOpacity>

      <View className="absolute bottom-6 left-5 right-5">
        <View className="flex-row items-center mb-2">
          <View className="bg-[#ff6619] px-2.5 py-1 rounded-md mr-2">
            <Text className="text-white text-xs font-bold uppercase tracking-wider">
              Event
            </Text>
          </View>
          {event.startDate && (
            <Text className="text-gray-300 font-medium text-sm">
              {formattedDate}
            </Text>
          )}
        </View>

        <Text className="text-white text-3xl font-extrabold leading-tight shadow-sm">
          {event.title}
        </Text>

        {event.startDate && (
          <View className="flex-row items-center mt-2">
            <Ionicons
              name="time-outline"
              size={16}
              color="rgba(255,255,255,0.8)"
            />
            <Text className="text-gray-200 ml-1.5 font-medium">
              {formattedTime}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default memo(EventHeader);
