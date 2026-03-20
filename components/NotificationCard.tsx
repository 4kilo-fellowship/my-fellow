import { getRelativeTime } from "@/services/notificationService";
import { AppNotification } from "@/types/notification.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const TYPE_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }
> = {
  event: {
    icon: "calendar",
    color: "#f97316",
    bgColor: "rgba(249,115,22,0.12)",
  },
  product: {
    icon: "bag-handle",
    color: "#8b5cf6",
    bgColor: "rgba(139,92,246,0.12)",
  },
  devotion: { icon: "book", color: "#06b6d4", bgColor: "rgba(6,182,212,0.12)" },
  announcement: {
    icon: "megaphone",
    color: "#ec4899",
    bgColor: "rgba(236,72,153,0.12)",
  },
  general: {
    icon: "notifications",
    color: "#64748b",
    bgColor: "rgba(100,116,139,0.12)",
  },
};

interface Props {
  notification: AppNotification;
  isDark: boolean;
  onPress: () => void;
  onDismiss: () => void;
}

export default function NotificationCard({
  notification,
  isDark,
  onPress,
  onDismiss,
}: Props) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.general;
  const timeAgo = getRelativeTime(notification.createdAt);
  const isUnread = !notification.read;

  return (
    <View style={styles.outerWrapper}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: isUnread
              ? isDark
                ? "rgba(255,102,25,0.06)"
                : "rgba(255,102,25,0.04)"
              : isDark
                ? "#121212"
                : "#ffffff",
            borderColor: isUnread
              ? isDark
                ? "rgba(255,102,25,0.15)"
                : "rgba(255,102,25,0.1)"
              : isDark
                ? "#1f1f1f"
                : "#f1f5f9",
            borderWidth: 1,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.leftColumn}>
            <View style={[styles.iconBox, { backgroundColor: config.bgColor }]}>
              {notification.imageUrl ? (
                <Image
                  source={{ uri: notification.imageUrl }}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Ionicons name={config.icon} size={22} color={config.color} />
              )}
            </View>
            {isUnread && (
              <View
                style={[
                  styles.unreadDot,
                  {
                    borderColor: isDark ? "#121212" : "#ffffff",
                  },
                ]}
              />
            )}
          </View>

          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.title,
                  {
                    color: isDark
                      ? isUnread
                        ? "#ffffff"
                        : "#f3f4f6"
                      : isUnread
                        ? "#111827"
                        : "#374151",
                  },
                ]}
                numberOfLines={1}
              >
                {notification.title.replace(/🗓\s*|🛍\s*/g, "")}
              </Text>
              <View style={styles.rightHeader}>
                <Text
                  style={[
                    styles.time,
                    { color: isDark ? "#6b7280" : "#9ca3af" },
                  ]}
                >
                  {timeAgo}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.body, { color: isDark ? "#9ca3af" : "#4b5563" }]}
              numberOfLines={2}
            >
              {notification.body}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginHorizontal: 16,
    position: "relative",
  },
  container: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: "100%",
    borderWidth: 1,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftColumn: {
    position: "relative",
    marginRight: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  unreadDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ff6619",
    borderWidth: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    marginTop: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 13,
    fontWeight: "400",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});
