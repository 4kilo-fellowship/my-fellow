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

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isDark
            ? notification.read
              ? "#0f0f0f"
              : "#1a1a2e"
            : notification.read
              ? "#ffffff"
              : "#fef9f0",
          borderColor: isDark
            ? notification.read
              ? "#1f1f1f"
              : "rgba(255,103,25,0.15)"
            : notification.read
              ? "#f1f5f9"
              : "rgba(255,103,25,0.12)",
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {!notification.read && <View style={styles.unreadDot} />}

      <View style={styles.row}>
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

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.typeLabel, { color: config.color }]}>
              {notification.title}
            </Text>
            <Text
              style={[styles.time, { color: isDark ? "#6b7280" : "#9ca3af" }]}
            >
              {timeAgo}
            </Text>
          </View>
          <Text
            style={[
              styles.body,
              {
                color: isDark ? "#e5e7eb" : "#1f2937",
                fontWeight: notification.read ? "400" : "600",
              },
            ]}
            numberOfLines={2}
          >
            {notification.body}
          </Text>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onDismiss();
          }}
          hitSlop={10}
          style={styles.dismissBtn}
        >
          <Ionicons
            name="close"
            size={16}
            color={isDark ? "#4b5563" : "#d1d5db"}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    position: "relative",
    overflow: "hidden",
  },
  unreadDot: {
    position: "absolute",
    top: 14,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ff6719",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  time: {
    fontSize: 11,
    fontWeight: "500",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  dismissBtn: {
    padding: 4,
  },
});
