import { WEEKLY_PROGRAMS } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { Program } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProgramProps {
  item: Program;
  isDark: boolean;
}
const openGoogleMaps = (lat: number, lng: number, label: string) => {
  const scheme = Platform.select({
    ios: "maps:0,0?q=",
    android: "geo:0,0?q=",
  });
  const latLng = `${lat},${lng}`;
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`,
  });

  if (url) {
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      );
    });
  }
};

const ProgramCard = ({ item, isDark }: ProgramProps) => {
  return (
    <View className="flex-1">
      <View
        className={`mb-6 rounded-[28px] overflow-hidden ${
          isDark ? "bg-[#1C1C1E]" : "bg-white"
        }`}
        style={{
          shadowColor: isDark ? "#000" : "#64748b",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.5 : 0.12,
          shadowRadius: 24,
          elevation: 10,
        }}
      >
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor="transparent"
        />
        {/* Image Section */}
        <View className="h-52 w-full relative">
          <Image
            source={item.image}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={400}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />
          {/* Category Badge */}
          <View
            className="absolute top-4 left-4 px-4 py-2 rounded-full"
            style={{ backgroundColor: "rgba(255,102,25,0.9)" }}
          >
            <Text className="text-white text-xs font-bold uppercase tracking-widest">
              {item.category}
            </Text>
          </View>
          {/* Title on Image */}
          <View className="absolute bottom-4 left-5 right-5">
            <Text
              className="text-white text-2xl font-extrabold"
              style={{
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {item.title}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="p-5">
          <Text
            className={`text-[15px] mb-5 leading-6 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          {/* Info Row */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center bg-orange-500/10 px-4 py-2 rounded-xl">
              <Ionicons
                name="calendar"
                size={15}
                color="#f97316"
                style={{ marginRight: 8 }}
              />
              <Text className="text-orange-500 font-bold text-xs">
                {item.day}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons
                name="time-outline"
                size={16}
                color={isDark ? "#9ca3af" : "#94a3b8"}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`text-xs font-semibold ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {item.time}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View
            className={`h-[1px] w-full mb-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
          />

          {/* Location Row */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              openGoogleMaps(
                item.coordinates.lat,
                item.coordinates.lng,
                item.location,
              )
            }
            className={`flex-row items-center justify-between py-3 px-4 rounded-2xl ${
              isDark ? "bg-gray-800/50" : "bg-slate-50"
            }`}
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? "#374151" : "#e2e8f0" }}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={isDark ? "#fff" : "#000"}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-xs font-medium mb-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Location
                </Text>
                <Text
                  className={`text-sm font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                  numberOfLines={1}
                >
                  {item.location}
                </Text>
              </View>
            </View>
            <View
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: "#f97316" }}
            >
              <Ionicons name="navigate" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function WeeklyPrograms() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className={`flex-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
        {/* Custom Header */}
        <View
          className={`px-5 pb-4 flex-row items-center ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}
          style={{ paddingTop: top + 10 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: isDark ? "#1C1C1E" : "#e2e8f0" }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "white" : "#0f172a"}
            />
          </TouchableOpacity>
          <Text
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Weekly Programs
          </Text>
        </View>

        <FlatList
          data={WEEKLY_PROGRAMS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProgramCard item={item} isDark={isDark} />}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="mb-6 mt-2">
              <Text
                className={`text-base leading-6 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Discover our weekly gatherings. Tap the location to get
                directions.
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}
