import {
  AnnouncementCard,
  DevotionCard,
  Placeholder,
  QuickAction,
  UserProfileMenu,
  VideoItem,
} from "@/components";
import { DEVOTIONS, PRIMARY, QUICK_ACTIONS, VIDEOS } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { eventsService } from "@/services/eventsService";
import { useAppStore } from "@/stores/app.store";
import { EventSummary } from "@/types/events.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Home = () => {
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const { hasSeenFeatures, setHasSeenFeatures } = useAppStore();
  const isDark = theme === "dark";
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get("window");
  const cardWidth = width - 48;
  const itemWidth = cardWidth + 16;

  const router = useRouter();

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [devotions, setDevotions] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await eventsService.fetchEvents();
      setEvents(data);
      setDevotions(DEVOTIONS);
      setVideos(VIDEOS);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      if (!hasSeenFeatures) {
        setHasSeenFeatures(true);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <View className="flex-1">
      <View
        className={`${isDark ? "bg-dark" : "bg-background"} absolute inset-0`}
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
            style={{ transform: [{ scale: 2.1 }, { translateX: -13 }] }}
          />

          <UserProfileMenu />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
        >
          {/* Upcoming Events */}
          <View className="mb-2">
            <View className="px-5 mb-2">
              {!hasSeenFeatures ? (
                <Placeholder width={150} height={24} borderRadius={4} />
              ) : (
                <Text
                  className={`text-lg font-extrabold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Upcoming Events
                </Text>
              )}
            </View>

            {!hasSeenFeatures ||
            ((loading || refreshing) && events.length === 0) ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {[1, 2, 3].map((_, i) => (
                  <Placeholder
                    key={i}
                    width={width - 48}
                    height={400}
                    borderRadius={20}
                    style={{ marginRight: 16 }}
                  />
                ))}
              </ScrollView>
            ) : error ? (
              <View
                style={{
                  height: 400,
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
                    backgroundColor: "#ff6619",
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
                  events.map((item: any, index) => {
                    const eventId = item._id;
                    return (
                      <AnnouncementCard
                        key={eventId ?? index}
                        item={item}
                        isDark={isDark}
                        onPress={() => {
                          router.push(`/events/${eventId}` as any);
                        }}
                      />
                    );
                  })}
              </Animated.ScrollView>
            )}
          </View>

          {/* Quick Actions */}
          <View className="mt-7">
            <View className="px-5 flex-row mb-3">
              {!hasSeenFeatures ? (
                <Placeholder width={100} height={24} borderRadius={4} />
              ) : (
                <Text
                  className={`text-lg font-extrabold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Features
                </Text>
              )}
            </View>
            {!hasSeenFeatures || (loading && events.length === 0) ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <View
                    key={i}
                    style={{ alignItems: "center", marginRight: 16 }}
                  >
                    <Placeholder width={56} height={56} borderRadius={12} />
                    <Placeholder
                      width={40}
                      height={12}
                      borderRadius={4}
                      style={{ marginTop: 8 }}
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {QUICK_ACTIONS.map((action, index) => (
                  <QuickAction
                    key={action.id}
                    item={action as any}
                    isDark={isDark}
                    onPress={() => {
                      if (action.id === "1") {
                        router.push("/programs");
                      } else if (action.id === "2") {
                        router.push("/locations");
                      } else if (action.id === "3") {
                        router.push("/leaders");
                      } else if (action.id === "4") {
                        router.push("/teams");
                      } else if (action.id === "5") {
                        Linking.openURL("https://t.me/4kilo_fellow");
                      } else if (action.id === "6") {
                        Linking.openURL("https:://tiktok.com/4kilo_fellowship");
                      } else if (action.id === "7") {
                        router.push("/gifts");
                      } else if (action.id === "8") {
                        Linking.openURL(
                          "https://instagram.com/4kilo_fellowship",
                        );
                      }
                    }}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Recent Devotions */}
          <View className="mt-7">
            <View className="px-5 flex-row justify-between items-center mb-3">
              {!hasSeenFeatures ? (
                <Placeholder width={150} height={24} borderRadius={4} />
              ) : (
                <Text
                  className={`text-lg font-extrabold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Recent Devotions
                </Text>
              )}
              {!hasSeenFeatures ? (
                <Placeholder width={60} height={20} borderRadius={4} />
              ) : (
                <TouchableOpacity
                  onPress={() => router.push("/devotions")}
                  activeOpacity={0.6}
                  className="flex-row items-center"
                >
                  <Text className="text-primary font-semibold mr-2">
                    View All
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={PRIMARY} />
                </TouchableOpacity>
              )}
            </View>

            {!hasSeenFeatures ||
            ((loading || refreshing) && devotions.length === 0) ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {[1, 2, 3].map((_, i) => (
                  <Placeholder
                    key={i}
                    width={180}
                    height={220}
                    borderRadius={16}
                    style={{ marginRight: 16 }}
                  />
                ))}
              </ScrollView>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {devotions.map((d, index) => (
                  <DevotionCard key={d.id} item={d as any} isDark={isDark} />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Latest Sermons */}
          <View className="mt-7 px-5">
            {!hasSeenFeatures ? (
              <Placeholder
                width={140}
                height={24}
                borderRadius={4}
                style={{ marginBottom: 12 }}
              />
            ) : (
              <Text
                className={`text-lg font-extrabold mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Latest Videos
              </Text>
            )}
            {!hasSeenFeatures ||
            ((loading || refreshing) && videos.length === 0) ? (
              <View>
                {[1, 2, 3].map((_, i) => (
                  <Placeholder
                    key={i}
                    width={width - 40}
                    height={100}
                    borderRadius={12}
                    style={{ marginBottom: 16 }}
                  />
                ))}
              </View>
            ) : (
              videos.map((v) => (
                <VideoItem key={v.id} item={v} isDark={isDark} />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Home;
