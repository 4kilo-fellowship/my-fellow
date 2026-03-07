import NotificationCard from "@/components/NotificationCard";
import { useTheme } from "@/context/ThemeContext";
import { useNetwork } from "@/hooks/useNetwork";
import { checkForNewNotifications } from "@/services/notificationService";
import { useNotificationsStore } from "@/stores/notifications.store";
import { AppNotification, NotificationType } from "@/types/notification.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
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
        { backgroundColor: isDark ? "#000000" : "#f9fafb" },
      ]}
    >
      <LinearGradient
        colors={isDark ? ["#1a1a1a", "#000000"] : ["#f8fafc", "#ffffff"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        className={`px-5 pb-4 flex-row items-center justify-between border-b ${isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"}`}
        style={{ paddingTop: insets.top + 10 }}
      >
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            android_ripple={{
              color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              borderless: true,
            }}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.03)",
            }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "white" : "#0f172a"}
            />
          </Pressable>
          <View>
            <Text
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text
                style={[
                  styles.unreadLabel,
                  { color: isDark ? "#9ca3af" : "#64748b" },
                ]}
              >
                {unreadCount} unread
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
                  styles.headerBtn,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-done"
                  size={18}
                  color={isDark ? "#9ca3af" : "#64748b"}
                />
              </Pressable>
            )}
            <Pressable
              onPress={clearAll}
              hitSlop={8}
              style={[
                styles.headerBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                  marginLeft: 8,
                },
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={isDark ? "#9ca3af" : "#64748b"}
              />
            </Pressable>
          </View>
        )}
      </View>

      <View
        style={[
          styles.filterRow,
          {
            backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
            borderBottomColor: isDark ? "#1f1f1f" : "#f1f5f9",
          },
        ]}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={[
                styles.filterTab,
                isActive && {
                  backgroundColor: "#ff6619",
                  borderColor: "#ff6619",
                },
                !isActive && {
                  backgroundColor: isDark ? "#1a1a1a" : "#f1f5f9",
                  borderColor: isDark ? "#262626" : "#e2e8f0",
                },
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
                    color: isActive ? "#fff" : isDark ? "#d1d5db" : "#475569",
                    fontWeight: isActive ? "600" : "500",
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {checking && notifications.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#ff6719" />
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
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.02)",
              },
            ]}
          >
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"}
            />
          </View>
          <Text
            style={[styles.emptyTitle, { color: isDark ? "#fff" : "#1f2937" }]}
          >
            {activeFilter === "all"
              ? "No notifications yet"
              : `No ${activeFilter} notifications`}
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: isDark ? "#6b7280" : "#9ca3af" },
            ]}
          >
            {isConnected
              ? "You're all caught up! Pull down to check for updates."
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
            paddingTop: 16,
            paddingBottom: insets.bottom + 60,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#ff6719"
              colors={["#ff6719"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 12,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
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
