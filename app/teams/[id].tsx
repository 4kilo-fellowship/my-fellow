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

const TeamDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Find the team by ID
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
    <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={team.image}
            style={{ width, height: 280 }}
            className="bg-zinc-200"
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <View className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

          {/* Back Button */}
          <View
            style={{ paddingTop: top + 10 }}
            className="absolute top-0 left-0 right-0 px-5 flex-row items-center justify-between"
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/30 backdrop-blur-xl rounded-full items-center justify-center border border-white/20"
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-10 h-10 bg-black/30 backdrop-blur-xl rounded-full items-center justify-center border border-white/20"
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Team Badge */}
          <View className="absolute bottom-4 left-5">
            <View
              style={{ backgroundColor: team.color }}
              className="px-4 py-2 rounded-full flex-row items-center space-x-2"
            >
              <Ionicons name={team.icon} size={18} color="white" />
              <Text className="text-white font-bold text-sm ml-2">
                {team.category}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-5 pt-6 pb-10">
          {/* Title & Members */}
          <View className="mb-6">
            <Text
              className={`text-3xl font-extrabold mb-2 ${isDark ? "text-white" : "text-black"}`}
            >
              {team.name}
            </Text>
            <View className="flex-row items-center space-x-4">
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
                  name="time"
                  size={18}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
                <Text className="text-zinc-500 ml-2 font-semibold">
                  {team.day}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text
              className={`text-base leading-6 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              {team.description}
            </Text>
          </View>

          {/* Meeting Info Card */}
          <View
            className={`rounded-2xl p-5 mb-6 ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}
          >
            <Text
              className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}
            >
              Meeting Details
            </Text>

            <View className="space-y-3">
              {/* Time */}
              <View className="flex-row items-start">
                <View
                  style={{ backgroundColor: team.color }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                >
                  <Ionicons name="time-outline" size={20} color="white" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-zinc-500 text-xs font-semibold mb-1">
                    TIME
                  </Text>
                  <Text
                    className={`font-bold ${isDark ? "text-white" : "text-black"}`}
                  >
                    {team.day}, {team.time}
                  </Text>
                </View>
              </View>

              {/* Location */}
              <View className="flex-row items-start mt-4">
                <View
                  style={{ backgroundColor: team.color }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                >
                  <Ionicons name="location-outline" size={20} color="white" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-zinc-500 text-xs font-semibold mb-1">
                    LOCATION
                  </Text>
                  <Text
                    className={`font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}
                  >
                    {team.location}
                  </Text>
                  <TouchableOpacity
                    onPress={handleGetDirections}
                    className="flex-row items-center"
                  >
                    <Text style={{ color: team.color }} className="font-bold">
                      Get Directions
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={team.color}
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* About Section */}
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

          {/* Leader Card */}
          <View className="mb-6">
            <Text
              className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}
            >
              Team Leader
            </Text>

            <View
              className={`rounded-2xl p-5 ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}
            >
              <View className="flex-row items-center mb-4">
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

              {/* Contact Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={handleCall}
                  className="flex-1 bg-green-500 py-3 rounded-xl flex-row items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={18} color="white" />
                  <Text className="text-white font-bold ml-2">Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleTelegram}
                  className="flex-1 bg-blue-500 py-3 rounded-xl flex-row items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Ionicons name="paper-plane" size={18} color="white" />
                  <Text className="text-white font-bold ml-2">Telegram</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Join Team Button */}
          <TouchableOpacity
            style={{ backgroundColor: team.color }}
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
