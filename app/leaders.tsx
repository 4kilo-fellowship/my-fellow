import { LeaderCard, Placeholder } from "@/components";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useLeadersStore } from "@/stores/leaders.store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  RefreshControl,
  ScrollView,
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

  // Header Heights
  const STATIC_HEADER_HEIGHT = top + 80;
  const FILTER_SECTION_HEIGHT = 100;
  const TOTAL_HEADER_HEIGHT = STATIC_HEADER_HEIGHT + FILTER_SECTION_HEIGHT;

  const scrollY = useRef(new Animated.Value(0)).current;
  const diffClamp = Animated.diffClamp(scrollY, 0, FILTER_SECTION_HEIGHT);
  const translateY = diffClamp.interpolate({
    inputRange: [0, FILTER_SECTION_HEIGHT],
    outputRange: [0, -FILTER_SECTION_HEIGHT],
  });

  const [selectedFilter, setSelectedFilter] = useState("All");
  const filters = ["All", "Main", "Team"];

  const { leaders, loading, refreshing, loadLeaders } = useLeadersStore();

  useEffect(() => {
    loadLeaders();
  }, []);

  const onRefresh = () => {
    loadLeaders(true);
  };

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

  const filteredLeaders = leaders.filter((leader) => {
    if (selectedFilter === "All") return true;
    return leader.type === selectedFilter;
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor="transparent"
      />

      <View className={`flex-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
        {loading && leaders.length === 0 ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: TOTAL_HEADER_HEIGHT + 20,
              paddingHorizontal: 20,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
          >
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                className={`mb-5 rounded-[28px] p-6 border ${
                  isDark
                    ? "bg-[#1C1C1E] border-gray-800"
                    : "bg-white border-gray-100"
                }`}
                style={{
                  height: 280,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.4 : 0.05,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-start">
                  <Placeholder width={72} height={72} borderRadius={36} />
                  <View className="flex-1 ml-4 pt-1">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-2">
                        <Placeholder
                          width="70%"
                          height={20}
                          style={{ marginBottom: 8 }}
                        />
                        <Placeholder width="40%" height={12} />
                      </View>
                      <Placeholder width={80} height={24} borderRadius={12} />
                    </View>
                  </View>
                </View>
                <View className="mt-6">
                  <Placeholder
                    width="100%"
                    height={16}
                    style={{ marginBottom: 8 }}
                  />
                  <Placeholder
                    width="90%"
                    height={16}
                    style={{ marginBottom: 8 }}
                  />
                  <Placeholder width="60%" height={16} />
                </View>
                <View className="mt-6 flex-row gap-3">
                  <Placeholder width="48%" height={48} borderRadius={16} />
                  <Placeholder width="48%" height={48} borderRadius={16} />
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Animated.FlatList
            data={filteredLeaders}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            ListHeaderComponent={
              <View style={{ height: TOTAL_HEADER_HEIGHT + 20 }}>
                <View className="mb-4 mt-6 px-1">
                  <Text
                    className={`text-2xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Meet Our Leaders
                  </Text>
                  <Text
                    className={`text-base leading-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Connect with our dedicated leaders who are passionately
                    serving and building the kingdom.
                  </Text>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <LeaderCard
                item={item}
                isDark={isDark}
                onCall={() => handleCall(item.phoneNumber)}
                onTelegram={() => handleOpenTelegram(item.telegram)}
              />
            )}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 40,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={PRIMARY}
                colors={[PRIMARY]}
                progressViewOffset={TOTAL_HEADER_HEIGHT}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Static Header: Back and Title */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            height: STATIC_HEADER_HEIGHT,
            backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
            paddingTop: top + 10,
            paddingHorizontal: 20,
          }}
        >
          <View className="flex-row items-center">
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
        </View>

        {/* Animated Filters */}
        <Animated.View
          style={{
            position: "absolute",
            top: STATIC_HEADER_HEIGHT,
            left: 0,
            right: 0,
            zIndex: 5,
            height: FILTER_SECTION_HEIGHT,
            backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
            transform: [{ translateY }],
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.7}
                onPress={() => setSelectedFilter(filter)}
                className={`px-5 py-2 mr-3 rounded-xl border flex-row items-center h-[40px] ${
                  selectedFilter === filter
                    ? "bg-orange-500 border-orange-500"
                    : isDark
                      ? "bg-[#1C1C1E] border-gray-800"
                      : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedFilter === filter
                      ? "text-white"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-600"
                  }`}
                >
                  {filter} {filter !== "All" ? "Leaders" : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </>
  );
}
