import { LeaderCard } from "@/components";
import { LEADERS } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Alert,
  Linking,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LeadersScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  const mainLeaders = LEADERS.filter((l) => l.type === "Main");
  const teamLeaders = LEADERS.filter((l) => l.type === "Team");

  const sections = [
    { title: "Main Leaders", data: mainLeaders },
    { title: "Team Leaders", data: teamLeaders },
  ];

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert(
        "Error",
        "Could not open dialer. Please make sure your device supports calls.",
      );
    });
  };

  const handleOpenTelegram = (username: string) => {
    const cleanUsername = username.replace("@", "");
    Linking.openURL(`https://t.me/${cleanUsername}`).catch(() => {
      Alert.alert(
        "Error",
        "Could not open Telegram. Please ensure you have the app installed.",
      );
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className={`flex-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
        <StatusBar style={isDark ? "light" : "dark"} />
        {/* Header */}
        <View
          className={`px-5 pb-4 flex-row items-center border-b ${isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"}`}
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
            Fellowship Leaders
          </Text>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LeaderCard
              item={item}
              isDark={isDark}
              onCall={() => handleCall(item.phoneNumber)}
              onTelegram={() => handleOpenTelegram(item.telegram)}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View
              className={`py-4 px-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-5 w-1.5 bg-orange-500 rounded-full mr-3" />
                  <Text
                    className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}
                  >
                    {title}
                  </Text>
                </View>
                <View
                  className={`h-[1px] flex-1 ml-4 ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
                />
              </View>
            </View>
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View className="mb-4 mt-6">
              <Text
                className={`text-2xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Meet Our Leaders
              </Text>
              <Text
                className={`text-base leading-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Connect with our dedicated leaders who are passionately serving
                and building the kingdom.
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}
