import { AppBottomSheet } from "@/components/AppBottomSheet";
import { MainTabHeader } from "@/components/MainTabHeader";
import NotificationCard from "@/components/NotificationCard";
import {
  AnnouncementCard,
  DevotionCard,
  NativeViewAllButton,
  NoInternetScreen,
  Placeholder,
  QuickAction,
  StreakModal,
  VideoItem,
  VideoPlayerModal,
  WhoToFollowSection,
} from "@/components";
import { PRIMARY, QUICK_ACTIONS, VIDEOS } from "@/constants";
import { Video } from "@/constants/videos";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useNetwork } from "@/hooks/useNetwork";
import { devotionsService } from "@/services/devotionsService";
import { eventsService } from "@/services/eventsService";
import { checkForNewNotifications } from "@/services/notificationService";
import { useAppStore } from "@/stores/app.store";
import { useDevotionsStore } from "@/stores/devotions.store";
import { useEventsStore } from "@/stores/events.store";
import { useNotificationsStore } from "@/stores/notifications.store";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Home = () => {
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const { hasSeenFeatures, setHasSeenFeatures } = useAppStore();
  const isDark = theme === "dark";
  const [activeIndex, setActiveIndex] = useState(0);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showNotificationsSheet, setShowNotificationsSheet] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const cardWidth = width - 48;
  const itemWidth = cardWidth + 16;

  const router = useRouter();

  const { eventsList: events, setEventsList } = useEventsStore();
  const { devotionsList, setDevotionsList } = useDevotionsStore();
  const { isConnected } = useNetwork();
  const { user } = useUserStore();
  const isAdmin = useIsAdmin();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    getUnreadCount,
  } = useNotificationsStore();
  const unreadCount = getUnreadCount();

  const devotions = (devotionsList || []).map((d) => ({
    id: d._id,
    image: { uri: d.image },
    title: d.title,
    date: d.date,
    views: d.views,
    likes: d.likes,
  }));

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [wasOffline, setWasOffline] = useState(!isConnected);

  const fetchEvents = async () => {
    try {
      const [eventsData, devotionsData] = await Promise.all([
        eventsService.fetchEvents(),
        devotionsService.getDevotions({ limit: 6, page: 1 }),
      ]);

      setEventsList(eventsData);
      setDevotionsList(devotionsData.data || []);
      setVideos(VIDEOS);
      setError(null);

      if (Array.isArray(eventsData) && eventsData.length > 0) {
        const imageUris = eventsData
          .slice(0, 3)
          .map((e: any) => e.imageUrl || e.image)
          .filter(
            (uri: string): uri is string => !!uri && typeof uri === "string",
          );

        if (imageUris.length > 0) {
          try {
            await Promise.all(
              imageUris.map((url: string) => {
                if (url.startsWith("http")) return ExpoImage.prefetch(url);
                return Promise.resolve();
              }),
            );
          } catch (prefetchError) {
            console.warn("Image prefetch failed:", prefetchError);
          }
        }
      }
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

  // Sync when returning online
  useEffect(() => {
    if (isConnected && wasOffline) {
      console.log("Returned online, refreshing data...");
      onRefresh();
      // Check for new notifications when reconnecting
      checkForNewNotifications().catch(console.warn);
      setWasOffline(false);
    } else if (!isConnected) {
      setWasOffline(true);
    }
  }, [isConnected]);

  // Also check for notifications on initial mount
  useEffect(() => {
    if (isConnected) {
      checkForNewNotifications().catch(console.warn);
    }
  }, []);

  // Show No Internet screen if offline and no cached data exists
  if (
    !isConnected &&
    events.length === 0 &&
    devotions.length === 0 &&
    !loading
  ) {
    return <NoInternetScreen onRetry={onRefresh} isRetrying={refreshing} />;
  }

  return (
    <View className="flex-1">
      <View
        className={`${isDark ? "bg-dark" : "bg-background"} absolute inset-0`}
      />

      <View className="flex-1">
        <StatusBar style={isDark ? "light" : "dark"} />

        <MainTabHeader
          showStreak={true}
          showNotification={true}
          onNotificationPress={() => setShowNotificationsSheet(true)}
          onStreakPress={() => setShowStreakModal(true)}
          borderBottom={false}
        />

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
          <View className="mb-2">
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {!hasSeenFeatures ||
              ((loading || refreshing) && events.length === 0) ? (
                <Placeholder width={150} height={24} borderRadius={4} />
              ) : (
                <Text
                  numberOfLines={1}
                  className={`text-lg font-extrabold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{ includeFontPadding: false }}
                >
                  Upcoming Events
                </Text>
              )}

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {isAdmin && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      router.push("/events/manage");
                    }}
                    android_ripple={{
                      color: "rgba(255, 103, 25, 0.2)",
                      borderless: false,
                      foreground: true,
                    }}
                    style={{
                      height: 30,
                      paddingHorizontal: 10,
                      borderRadius: 15,
                      backgroundColor: "rgba(255, 103, 25, 0.12)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 103, 25, 0.35)",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      overflow: "hidden",
                    }}
                    accessibilityLabel="Create Event"
                  >
                    <Ionicons name="add" size={16} color="#ff6719" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#ff6719",
                        includeFontPadding: false,
                      }}
                    >
                      New
                    </Text>
                  </Pressable>
                )}

                {events.length > 0 && (
                  <NativeViewAllButton
                    onPress={() => router.push("/events")}
                    isDark={isDark}
                    accessibilityLabel="View all upcoming events"
                  />
                )}
              </View>
            </View>

            {!hasSeenFeatures ||
            ((loading || refreshing) && events.length === 0) ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={itemWidth}
                snapToAlignment="start"
                disableIntervalMomentum={true}
                overScrollMode="never"
                contentContainerStyle={{ paddingHorizontal: 20 }}
                onScroll={(e) => {
                  const offset = e.nativeEvent.contentOffset.x;
                  // Fast transition threshold: triggers earlier at 25% of card swipe
                  const newIndex = Math.min(
                    Math.max(0, Math.floor((offset + itemWidth * 0.25) / itemWidth)),
                    events.length - 1,
                  );
                  setActiveIndex((prev) => (prev !== newIndex ? newIndex : prev));
                }}
                onMomentumScrollEnd={(e) => {
                  const newIndex = Math.min(
                    Math.max(0, Math.round(e.nativeEvent.contentOffset.x / itemWidth)),
                    events.length - 1,
                  );
                  setActiveIndex((prev) => (prev !== newIndex ? newIndex : prev));
                }}
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
              </ScrollView>
            )}

            {/* Pagination Dots indicator for Events */}
            {events.length > 1 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 8,
                  gap: 6,
                }}
              >
                {events.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor:
                        activeIndex === i
                          ? PRIMARY
                          : isDark
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.15)",
                    }}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Features Section - pulled upper */}
          <View style={{ marginTop: 10 }}>
            <View className="px-5 flex-row justify-between items-center mb-3">
              {!hasSeenFeatures || (loading && events.length === 0) ? (
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
                overScrollMode="never"
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
                overScrollMode="never"
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
                      } else if (action.id === "store") {
                        router.push("/marketplace");
                      } else if (action.id === "4") {
                        router.push("/teams");
                      } else if (action.id === "5") {
                        Linking.openURL("https://t.me/AAU_4Killo_Fellowship");
                      } else if (action.id === "6") {
                        Linking.openURL("https://tiktok.com/@4kilofellowship");
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

          {/* Recent Devotions - spaced lower */}
          <View style={{ marginTop: 36 }}>
            <View
              style={{
                paddingHorizontal: 20,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {!hasSeenFeatures ||
              ((loading || refreshing) && devotions.length === 0) ? (
                <Placeholder width={150} height={24} borderRadius={4} />
              ) : (
                <Text
                  numberOfLines={1}
                  className={`text-lg font-extrabold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{ includeFontPadding: false, flexShrink: 1, marginRight: 8 }}
                >
                  Recent Devotions
                </Text>
              )}
              {!hasSeenFeatures ||
              ((loading || refreshing) && devotions.length === 0) ? (
                <Placeholder width={60} height={20} borderRadius={4} />
              ) : (
                <NativeViewAllButton
                  onPress={() => router.push("/devotions")}
                  isDark={isDark}
                  accessibilityLabel="View all devotions"
                />
              )}
            </View>

            {!hasSeenFeatures ||
            ((loading || refreshing) && devotions.length === 0) ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
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
                overScrollMode="never"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {devotions.map((d) => (
                  <DevotionCard
                    key={d.id}
                    item={d as any}
                    isDark={isDark}
                    onPress={() => router.push(`/devotion/${d.id}` as any)}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Latest Videos Section */}
          <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              {!hasSeenFeatures ||
              ((loading || refreshing) && videos.length === 0) ? (
                <Placeholder
                  width={140}
                  height={24}
                  borderRadius={4}
                />
              ) : (
                <Text
                  className={`text-lg font-extrabold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Latest Videos
                </Text>
              )}

              {videos.length > 3 && (
                <NativeViewAllButton
                  label={showAllVideos ? "Show less" : "View all"}
                  onPress={() => setShowAllVideos((prev) => !prev)}
                  isDark={isDark}
                  accessibilityLabel={showAllVideos ? "Show fewer videos" : "View all fellowship videos"}
                />
              )}
            </View>

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
              (showAllVideos ? videos : videos.slice(0, 3)).map((v) => (
                <VideoItem
                  key={v.id}
                  item={v}
                  isDark={isDark}
                  onPress={() => {
                    setSelectedVideo(v);
                    setShowVideoModal(true);
                  }}
                />
              ))
            )}
          </View>

          {/* Who to Follow Section */}
          <WhoToFollowSection isDark={isDark} />
        </ScrollView>
      </View>

      <StreakModal
        visible={showStreakModal}
        onClose={() => setShowStreakModal(false)}
      />

      {/* Native Notifications BottomSheet */}
      <AppBottomSheet
        visible={showNotificationsSheet}
        onClose={() => setShowNotificationsSheet(false)}
        isDark={isDark}
        snapPoints={["half", "full"]}
      >
        <View style={{ paddingBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? "#27272a" : "#f1f5f9",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: isDark ? "#ffffff" : "#0f172a",
                }}
              >
                Notifications
              </Text>
              {unreadCount > 0 && (
                <View
                  style={{
                    backgroundColor: PRIMARY,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "700" }}>
                    {unreadCount} new
                  </Text>
                </View>
              )}
            </View>

            {unreadCount > 0 && (
              <Pressable
                onPress={() => markAllAsRead()}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={{ fontSize: 13, color: PRIMARY, fontWeight: "700" }}>
                  Mark all read
                </Text>
              </Pressable>
            )}
          </View>

          <ScrollView
            style={{ maxHeight: 380 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, gap: 10 }}
            showsVerticalScrollIndicator={false}
          >
            {notifications.slice(0, 5).map((item) => (
              <NotificationCard
                key={item.id}
                notification={item}
                isDark={isDark}
                onPress={() => {
                  markAsRead(item.id);
                  setShowNotificationsSheet(false);
                  if (item.targetRoute) {
                    router.push(item.targetRoute as any);
                  }
                }}
                onDismiss={() => removeNotification(item.id)}
              />
            ))}

            {notifications.length === 0 && (
              <View style={{ paddingVertical: 32, alignItems: "center" }}>
                <Ionicons
                  name="notifications-off-outline"
                  size={36}
                  color={isDark ? "#52525b" : "#a1a1aa"}
                />
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 14,
                    color: isDark ? "#71717a" : "#71717a",
                    fontWeight: "600",
                  }}
                >
                  No notifications right now
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <View
              style={{
                borderRadius: 14,
                overflow: "hidden",
                borderWidth: 1.5,
                borderColor: isDark ? "#27272a" : "#e2e8f0",
                backgroundColor: isDark ? "#18181b" : "#f8fafc",
              }}
            >
              <Pressable
                onPress={() => {
                  setShowNotificationsSheet(false);
                  router.push("/notifications");
                }}
                android_ripple={{
                  color: isDark ? "rgba(255, 102, 25, 0.2)" : "rgba(255, 102, 25, 0.12)",
                  borderless: false,
                }}
                style={({ pressed }) => [
                  {
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  pressed && Platform.OS === "ios" && { opacity: 0.75 },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: isDark ? "#ffffff" : "#0f172a",
                  }}
                >
                  View All Notifications
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </AppBottomSheet>

      {/* Production-Quality Video Player Modal */}
      <VideoPlayerModal
        visible={showVideoModal}
        video={selectedVideo}
        videos={videos}
        onClose={() => setShowVideoModal(false)}
        onSelectVideo={(v) => setSelectedVideo(v)}
        isDark={isDark}
      />
    </View>
  );
};

export default Home;
