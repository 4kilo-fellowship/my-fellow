import {
  AnnouncementCard,
  DevotionCard,
  QuickAction,
  VideoItem,
} from "@/components";
import { DEVOTIONS, QUICK_ACTIONS, VIDEOS } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useEventsStore } from "@/stores/events.store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Home = () => {
  const { top } = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get("window");
  const cardWidth = width - 48;
  const itemWidth = cardWidth + 16;

  const router = useRouter();

  const { events, fetchEvents } = useEventsStore((s: any) => ({
    events: s.events,
    fetchEvents: s.fetchEvents,
  }));
  const { loading, error } = useEventsStore((s: any) => ({
    loading: s.loading,
    error: s.error,
  }));
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchEvents();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <View className="flex-1">
      <View
        className={`${isDark ? "bg-[#1A1A1B]" : "bg-white"} absolute inset-0`}
      />

      <View className="flex-1" style={{ paddingTop: top * 0.95 }}>
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor="transparent"
        />

        {/* header */}
        <View className="px-4 flex-row justify-between items-center">
          <Image
            source={require("@/assets/images/logo-primary.png")}
            className="w-64 h-20"
            resizeMode="contain"
            style={{ transform: [{ scale: 2 }, { translateX: -12 }] }}
          />

          <TouchableOpacity onPress={toggleTheme} activeOpacity={0.9}>
            <View
              className={`${isDark ? "bg-gray-800" : "bg-white"} w-9 h-9 rounded-xl flex items-center justify-center`}
            >
              <Ionicons
                name="person"
                size={24}
                color={isDark ? "#fff" : "#121212"}
              />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? "#fff" : "#0369A1"}
            />
          }
        >
          {/* Upcoming Events */}
          <View className="mb-2">
            <View className="px-5 mb-2">
              <Text
                className={`text-lg font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Upcoming Events
              </Text>
            </View>

            {loading ? (
              <View
                style={{
                  height: 320,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator
                  size="large"
                  color={isDark ? "#fff" : "#0369A1"}
                />
              </View>
            ) : error ? (
              <View
                style={{
                  height: 320,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#fff" : "#0f172a",
                    marginBottom: 8,
                  }}
                >
                  {String(error)}
                </Text>
                <TouchableOpacity
                  onPress={() => fetchEvents()}
                  style={{
                    backgroundColor: isDark ? "#0ea5a3" : "#14B8A6",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : events.length === 0 ? (
              <View
                style={{
                  height: 320,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("@/assets/images/header.png")}
                  style={{
                    width: 180,
                    height: 120,
                    marginBottom: 18,
                    opacity: 0.95,
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    color: isDark ? "#fff" : "#0f172a",
                    fontSize: 18,
                    fontWeight: "800",
                    marginBottom: 6,
                  }}
                >
                  No upcoming events
                </Text>
                <Text
                  style={{
                    color: isDark ? "#9ca3af" : "#64748b",
                    textAlign: "center",
                    maxWidth: 300,
                  }}
                >
                  Stay fed — feed your soul. Pull down to refresh and check
                  again.
                </Text>
              </View>
            ) : (
              <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={itemWidth}
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: 20 }}
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.round(
                    e.nativeEvent.contentOffset.x / itemWidth,
                  );
                  setActiveIndex(newIndex);
                }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true },
                )}
                scrollEventThrottle={16}
              >
                {Array.isArray(events) &&
                  events.map((item: any) => (
                    <AnnouncementCard
                      key={item.id}
                      item={item}
                      isDark={isDark}
                      onPress={() => router.push(`/events/${item.id}` as any)}
                    />
                  ))}
              </Animated.ScrollView>
            )}
          </View>
          {/* Quick Actions */}
          <View className="mt-7">
            <View className="px-5 flex-row justify-between items-center mb-3">
              <Text
                className={`text-lg font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Features
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {QUICK_ACTIONS.map((action) => (
                <QuickAction
                  key={action.id}
                  item={action as any}
                  isDark={isDark}
                />
              ))}
            </ScrollView>
          </View>

          {/* Recent Devotions */}
          <View className="mt-7">
            <View className="px-5 flex-row justify-between items-center mb-3">
              <Text
                className={`text-lg font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Recent Devotions
              </Text>
              <TouchableOpacity
                activeOpacity={0.88}
                className="flex-row items-center"
              >
                <Text className="text-primary font-semibold mr-2">
                  View All
                </Text>
                <Ionicons name="arrow-forward" size={16} color={"#ff6719"} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {DEVOTIONS.map((d) => (
                <DevotionCard key={d.id} item={d as any} isDark={isDark} />
              ))}
            </ScrollView>
          </View>

          {/* Latest Sermons */}
          <View className="mt-7 px-5">
            <Text
              className={`text-lg font-extrabold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Latest Sermons
            </Text>
            {VIDEOS.map((v) => (
              <VideoItem key={v.id} item={v} isDark={isDark} />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Home;
