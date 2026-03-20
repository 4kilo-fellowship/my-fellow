import NotificationCard from "@/components/NotificationCard";
import { useTheme } from "@/context/ThemeContext";
import { useNetwork } from "@/hooks/useNetwork";
import { checkForNewNotifications } from "@/services/notificationService";
import { useNotificationsStore } from "@/stores/notifications.store";
import { AppNotification, NotificationType } from "@/types/notification.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTER_TABS: {
  key: NotificationType | "all";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "all", label: "All", icon: "grid" },
  { key: "event", label: "Events", icon: "calendar" },
  { key: "product", label: "Store", icon: "bag-handle" },
  { key: "devotion", label: "Devotions", icon: "book" },
];

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";
  const { isConnected } = useNetwork();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getUnreadCount,
  } = useNotificationsStore();

  const [activeFilter, setActiveFilter] = useState<NotificationType | "all">(
    "all",
  );
  const [refreshing, setRefreshing] = useState(false);
  const [checking, setChecking] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listLayoutAnim = useRef(new Animated.Value(20)).current;

  // Added beautiful entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(listLayoutAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isConnected) {
      setChecking(true);
      checkForNewNotifications().finally(() => setChecking(false));
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await checkForNewNotifications();
    }
    setRefreshing(false);
  }, [isConnected]);

  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      markAsRead(notification.id);
      if (notification.targetRoute) {
        router.push(notification.targetRoute as any);
      }
    },
    [markAsRead, router],
  );

  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const unreadCount = getUnreadCount();

  const renderItem = useCallback(
    ({ item, index }: { item: AppNotification; index: number }) => (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <NotificationCard
          notification={item}
          isDark={isDark}
          onPress={() => handleNotificationPress(item)}
          onDismiss={() => removeNotification(item.id)}
        />
      </Animated.View>
    ),
    [isDark, handleNotificationPress, removeNotification, fadeAnim],
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#ffffff" },
      ]}
    >
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top + 10,
            backgroundColor: isDark
              ? "rgba(0,0,0,0.8)"
              : "rgba(255,255,255,0.9)",
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => router.back()}
              android_ripple={{
                color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                borderless: true,
              }}
              style={styles.backBtn}
            >
              <Ionicons
                name="arrow-back"
                size={26}
                color={isDark ? "white" : "#111827"}
              />
            </Pressable>
            <View>
              <Text
                style={[
                  styles.headerTitle,
                  { color: isDark ? "#ffffff" : "#111827" },
                ]}
              >
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Text style={[styles.unreadLabel, { color: "#ff6619" }]}>
                  {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
                </Text>
              )}
            </View>
          </View>

          {notifications.length > 0 && (
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <Pressable
                  onPress={markAllAsRead}
                  hitSlop={8}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.04)",
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-done"
                    size={20}
                    color={isDark ? "#d1d5db" : "#4b5563"}
                  />
                </Pressable>
              )}
              <Pressable
                onPress={clearAll}
                hitSlop={8}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.04)",
                    marginLeft: 8,
                  },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={isDark ? "#d1d5db" : "#4b5563"}
                />
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveFilter(tab.key)}
                  style={[
                    styles.filterTab,
                    isActive
                      ? { backgroundColor: "#ff6619" }
                      : { backgroundColor: isDark ? "#1a1a1a" : "#f1f5f9" },
                  ]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={isActive ? "#fff" : isDark ? "#9ca3af" : "#64748b"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.filterLabel,
                      {
                        color: isActive
                          ? "#fff"
                          : isDark
                            ? "#d1d5db"
                            : "#4b5563",
                        fontWeight: isActive ? "600" : "500",
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {checking && notifications.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#ff6619" />
          <Text
            style={[
              styles.loadingText,
              { color: isDark ? "#9ca3af" : "#64748b" },
            ]}
          >
            Checking for updates…
          </Text>
        </View>
      )}

      {filteredNotifications.length === 0 && !checking ? (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIconContainer,
              {
                backgroundColor: isDark
                  ? "rgba(255,102,25,0.1)"
                  : "rgba(255,102,25,0.05)",
              },
            ]}
          >
            <Ionicons name="notifications-outline" size={48} color="#ff6619" />
          </View>
          <Text
            style={[
              styles.emptyTitle,
              { color: isDark ? "#ffffff" : "#111827" },
            ]}
          >
            {activeFilter === "all"
              ? "All caught up!"
              : `No ${activeFilter} updates`}
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: isDark ? "#9ca3af" : "#6b7280" },
            ]}
          >
            {isConnected
              ? "When you get notifications, they'll show up here."
              : "Connect to the internet to receive notifications."}
          </Text>
          {!isConnected && (
            <View style={styles.offlineBadge}>
              <Ionicons
                name="cloud-offline-outline"
                size={14}
                color="#f97316"
              />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 60,
          }}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 12,
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#ff6619"
              colors={["#ff6619"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150,150,150,0.2)",
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  unreadLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  filterWrapper: {
    // marginBottom: 0,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterLabel: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(249,115,22,0.1)",
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f97316",
  },
});
