import { StreakModal } from "@/components/StreakModal";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useNotificationsStore } from "@/stores/notifications.store";
import { useStreakStore } from "@/stores/streak.store";
import { useUserStore } from "@/stores/user.store";
import { getPrefilledAvatar } from "@/utils/avatar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface MainTabHeaderProps {
  showAvatar?: boolean;
  showNotification?: boolean;
  onNotificationPress?: () => void;
  onStreakPress?: () => void;
  rightExtra?: React.ReactNode;
  showStreak?: boolean;
  borderBottom?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function MainTabHeader({
  showAvatar = true,
  showNotification = true,
  onNotificationPress,
  onStreakPress,
  rightExtra,
  showStreak = false,
  borderBottom = false,
  style,
}: MainTabHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useUserStore();
  const router = useRouter();

  const [internalStreakModalVisible, setInternalStreakModalVisible] =
    useState(false);
  const unreadCount = useNotificationsStore((s) => s.getUnreadCount());
  const { currentStreak, isCompletedToday, checkStreak, syncServerStreak } =
    useStreakStore();
  const syncServerUnreadCount = useNotificationsStore(
    (s) => s.syncServerUnreadCount,
  );

  useEffect(() => {
    checkStreak();
    syncServerStreak();
    syncServerUnreadCount();
  }, [checkStreak, syncServerStreak, syncServerUnreadCount]);

  const completed = isCompletedToday();

  const handleStreakPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (onStreakPress) {
      onStreakPress();
    } else {
      setInternalStreakModalVisible(true);
    }
  };

  const handleNotificationPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push("/notifications" as any);
    }
  };

  const avatarUri =
    user?.profileImage ||
    getPrefilledAvatar(user?.phoneNumber || user?.id || "fellow");

  // Consistent theme colors across all elements
  const headerBg = isDark ? "#000000" : "#ffffff";
  const borderColor = isDark ? "#27272a" : "#f1f5f9";
  const elementBorder = isDark ? "#27272a" : "#e4e4e7";
  const elementBg = isDark ? "#18181b" : "#ffffff";

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "android" ? 4 : 2),
            backgroundColor: headerBg,
            borderBottomWidth: borderBottom ? StyleSheet.hairlineWidth : 0,
            borderBottomColor: borderColor,
          },
          style,
        ]}
      >
        <View style={styles.navBarRow}>
          {/* Left: User Avatar (Hidden on Profile Tab) */}
          {showAvatar ? (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Go to profile"
              style={[
                styles.avatarContainer,
                {
                  borderColor: elementBorder,
                  backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                },
              ]}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="person"
                  size={18}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}

          {/* Center: Fellowship Logo (Optically balanced 32px height) */}
          <View style={styles.centerLogoWrapper} pointerEvents="none">
            <Image
              source={require("@/assets/images/fellowship-logo.png")}
              style={[
                styles.centerLogo,
                {
                  tintColor: isDark ? "#ffffff" : "#09090b",
                },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* Right Actions: Matching 36px Height Streak & Notification */}
          <View style={styles.rightActionsRow}>
            {/* Devotion Streak Pill (Height 36, Radius 18) */}
            {showStreak && (
              <TouchableOpacity
                onPress={handleStreakPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Devotion streak: ${currentStreak} days`}
                style={[
                  styles.streakPillBtn,
                  {
                    backgroundColor: isDark
                      ? completed
                        ? "rgba(255, 103, 25, 0.16)"
                        : elementBg
                      : completed
                        ? "#fff7ed"
                        : elementBg,
                    borderColor: completed ? PRIMARY : elementBorder,
                  },
                ]}
              >
                <Ionicons
                  name="flame"
                  size={18}
                  color={completed ? PRIMARY : "#ff8533"}
                />
                <Text
                  style={[
                    styles.streakCountText,
                    {
                      color: completed
                        ? PRIMARY
                        : isDark
                          ? "#ffffff"
                          : "#0f172a",
                    },
                  ]}
                >
                  {currentStreak}
                </Text>
              </TouchableOpacity>
            )}

            {/* Notification Bell Button (36x36 circle, Radius 18) */}
            {showNotification && (
              <TouchableOpacity
                onPress={handleNotificationPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                style={[
                  styles.notificationBtn,
                  {
                    backgroundColor: elementBg,
                    borderColor: elementBorder,
                  },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={19}
                  color={
                    unreadCount > 0
                      ? isDark
                        ? "#ffffff"
                        : "#09090b"
                      : isDark
                        ? "#a1a1aa"
                        : "#52525b"
                  }
                />

                {/* Floating Notification Badge sharing PRIMARY brand accent */}
                {unreadCount > 0 && (
                  <View
                    style={[
                      styles.notificationBadge,
                      {
                        backgroundColor: PRIMARY,
                        borderColor: headerBg,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {rightExtra}
          </View>
        </View>
      </View>

      {/* Devotion Streak Modal */}
      {!onStreakPress && (
        <StreakModal
          visible={internalStreakModalVisible}
          onClose={() => setInternalStreakModalVisible(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 20,
  },
  navBarRow: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    position: "relative",
  },
  avatarContainer: {
    width: 39,
    height: 39,
    borderRadius: 19.5,
    overflow: "hidden",
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  avatarPlaceholder: {
    width: 39,
    height: 39,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  centerLogoWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  centerLogo: {
    height: 32,
    width: 72,
  },
  rightActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  streakPillBtn: {
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  streakCountText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    zIndex: 10,
  },
  notificationBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    includeFontPadding: false,
  },
});
