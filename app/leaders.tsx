import { InfoModal, LeaderCard, Placeholder } from "@/components";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useLeadersStore } from "@/stores/leaders.store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
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
  const FILTER_SECTION_HEIGHT = 115;
  const TOTAL_HEADER_HEIGHT = STATIC_HEADER_HEIGHT + FILTER_SECTION_HEIGHT;

  const scrollY = useRef(new Animated.Value(0)).current;

  // Use a clamped value for diffClamp to prevent glitches during scroll bouncing
  const clampedScrollY = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolateLeft: "clamp",
  });

  const diffClamp = Animated.diffClamp(
    clampedScrollY,
    0,
    FILTER_SECTION_HEIGHT,
  );

  const translateY = diffClamp.interpolate({
    inputRange: [0, FILTER_SECTION_HEIGHT],
    outputRange: [0, -FILTER_SECTION_HEIGHT],
    extrapolate: "clamp",
  });

  const [selectedFilter, setSelectedFilter] = useState("All");
  const filters = ["All", "Main", "Team"];

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const showInfoModal = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "error",
  ) => {
    setInfoModal({ visible: true, title, message, type });
  };

  const { leaders, loading, refreshing, loadLeaders } = useLeadersStore();

  useEffect(() => {
    loadLeaders();
  }, []);

  const onRefresh = () => {
    loadLeaders(true);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      showInfoModal(
        "Error",
        "Could not open dialer. Please make sure your device supports calls.",
      );
    });
  };

  const handleOpenTelegram = (username: string) => {
    const cleanUsername = username.replace("@", "");
    Linking.openURL(`https://t.me/${cleanUsername}`).catch(() => {
      showInfoModal(
        "Error",
        "Could not open Telegram. Please ensure you have the app installed.",
      );
    });
  };

  const filteredLeaders = leaders
    .filter((leader) => {
      if (selectedFilter === "All") return true;
      const type = leader.type || "";
      return type.toLowerCase() === selectedFilter.toLowerCase();
    })
    .sort((a: any, b: any) => {
      // Sort by createdAt if available, otherwise by id (oldest first)
      if (a.createdAt && b.createdAt) {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return String(a.id || a._id).localeCompare(String(b.id || b._id));
    });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

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
                className={`mb-4 rounded-[24px] p-5 border ${
                  isDark
                    ? "bg-[#111] border-[#222]"
                    : "bg-[#f9fafb] border-gray-200"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isDark ? 0.3 : 0.05,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center">
                  <Placeholder width={56} height={56} borderRadius={28} />
                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-2">
                        <Placeholder
                          width="60%"
                          height={18}
                          style={{ marginBottom: 6 }}
                        />
                        <Placeholder width="40%" height={12} />
                      </View>
                      <Placeholder width={70} height={24} borderRadius={8} />
                    </View>
                  </View>
                </View>
                <View className="mt-4 mb-5">
                  <Placeholder
                    width="100%"
                    height={14}
                    style={{ marginBottom: 6 }}
                  />
                  <Placeholder
                    width="100%"
                    height={14}
                    style={{ marginBottom: 6 }}
                  />
                  <Placeholder width="70%" height={14} />
                </View>
                <View className="flex-row gap-3">
                  <Placeholder width="48%" height={44} borderRadius={12} />
                  <Placeholder width="48%" height={44} borderRadius={12} />
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
              <View style={{ height: TOTAL_HEADER_HEIGHT }} />
            }
            renderItem={({ item }) => (
              <View style={{ paddingTop: 10 }}>
                <LeaderCard
                  item={item}
                  isDark={isDark}
                  onCall={() => handleCall(item.phoneNumber)}
                  onTelegram={() => handleOpenTelegram(item.telegram)}
                />
              </View>
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

        {/* Animated Filters and Description */}
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
          <Text
            className={`text-base leading-6 pr-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            style={{ paddingHorizontal: 20 }}
          >
            Connect with our dedicated leaders who are passionately serving and
            building the kingdom.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.7}
                onPress={() => setSelectedFilter(filter)}
                className={`px-5 py-2 mr-3 rounded-xl border flex-row items-center h-[42px] ${
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

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
    </>
  );
}
