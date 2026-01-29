import { TEAMS } from "@/constants/teams";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const PRIMARY_COLOR = "#ff6619";

const TeamDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const team = TEAMS.find((t) => t.id === id);

  if (!team) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}
      >
        <Text className={isDark ? "text-white" : "text-black"}>
          Team not found
        </Text>
      </View>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${team.leader.phone}`);
  };

  const handleTelegram = () => {
    Linking.openURL(`https://t.me/${team.leader.telegram.replace("@", "")}`);
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${team.coordinates.lat},${team.coordinates.lng}`;
    Linking.openURL(url);
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-background"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View
        style={{
          position: "absolute",
          top: top + 10,
          left: 20,
          zIndex: 100,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 bg-black/30 rounded-full items-center justify-center shadow-lg"
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative">
          <Image
            source={team.image}
            style={{ width, height: 280 }}
            className="bg-zinc-200"
            resizeMode="cover"
          />

          <View className="absolute bottom-4 left-5">
            <View
              style={{ backgroundColor: PRIMARY_COLOR }}
              className="px-4 py-2 rounded-full flex-row items-center"
            >
              <Ionicons name={team.icon} size={18} color="white" />
              <Text className="text-white font-bold text-sm ml-2">
                {team.category}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5 pt-6 pb-10">
          <View className="mb-6">
            <Text
              className={`text-3xl font-extrabold mb-3 ${isDark ? "text-white" : "text-black"}`}
            >
              {team.name}
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="people"
                  size={18}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
                <Text className="text-zinc-500 ml-2 font-semibold">
                  {team.members} Members
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar"
                  size={18}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
                <Text className="text-zinc-500 ml-2 font-semibold">
                  {team.day}
                </Text>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text
              className={`text-base leading-6 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              {team.description}
            </Text>
          </View>

          <View
            className={`rounded-3xl p-6 mb-6 border ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-100"
            }`}
          >
            <Text
              className={`text-xl font-extrabold mb-5 ${isDark ? "text-white" : "text-black"}`}
            >
              Meeting Details
            </Text>

            <View className="gap-5">
              <View className="flex-row items-center">
                <View
                  className={`w-12 ${isDark ? "bg-zinc-900" : "bg-white"} h-12 rounded-2xl items-center justify-center`}
                >
                  <Ionicons
                    name="time-outline"
                    size={22}
                    color={isDark ? "white" : "black"}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Time
                  </Text>
                  <Text
                    className={`font-bold text-base ${isDark ? "text-white" : "text-black"}`}
                  >
                    {team.day}, {team.time}
                  </Text>
                </View>
              </View>

              <View
                className={`h-px ${isDark ? "bg-zinc-800" : "bg-sky-200"}`}
              />

              <View className="flex-row items-center">
                <View
                  className={`w-12 ${isDark ? "bg-zinc-900" : "bg-white"} h-12 rounded-2xl items-center justify-center`}
                >
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={isDark ? "white" : "black"}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">
                    Location
                  </Text>
                  <Text
                    className={`font-bold text-base mb-2 ${isDark ? "text-white" : "text-black"}`}
                  >
                    {team.location}
                  </Text>
                  <TouchableOpacity
                    onPress={handleGetDirections}
                    style={{ backgroundColor: PRIMARY_COLOR }}
                    className="self-start px-4 py-2 rounded-full flex-row items-center"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="navigate" size={16} color="white" />
                    <Text className="text-white font-bold text-sm ml-2">
                      Get Directions
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text
              className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-black"}`}
            >
              About This Team
            </Text>
            <Text
              className={`text-base leading-7 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              {team.about}
            </Text>
          </View>

          <View className="mb-6">
            <Text
              className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}
            >
              Team Leader
            </Text>

            <View
              className={`rounded-2xl p-5 ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}
            >
              <View className="flex-row items-center mb-5">
                <Image
                  source={{ uri: team.leader.image }}
                  className="w-16 h-16 rounded-full bg-zinc-200"
                />
                <View className="ml-4 flex-1">
                  <Text
                    className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}
                  >
                    {team.leader.name}
                  </Text>
                  <Text className="text-zinc-500 font-semibold">
                    {team.leader.role}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCall}
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  className="flex-1 py-3.5 rounded-xl flex-row items-center justify-center shadow-md"
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={18} color="white" />
                  <Text className="text-white font-bold ml-2">Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleTelegram}
                  className="flex-1 py-3.5 rounded-xl flex-row items-center justify-center shadow-md bg-[#0088cc]"
                  activeOpacity={0.8}
                >
                  <Ionicons name="paper-plane" size={18} color="white" />
                  <Text className="text-white font-bold ml-2">Telegram</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={{ backgroundColor: PRIMARY_COLOR }}
            className="py-5 rounded-2xl items-center shadow-lg mb-4"
            activeOpacity={0.9}
          >
            <Text className="text-white font-bold text-lg">Join This Team</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default TeamDetails;
