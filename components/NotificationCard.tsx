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
              ? "#121212"
              : "#1a1a24"
            : notification.read
              ? "#ffffff"
              : "#fff7eb",
          borderColor: isDark
            ? notification.read
              ? "#262626"
              : "rgba(255,102,25,0.2)"
            : notification.read
              ? "#e2e8f0"
              : "rgba(255,102,25,0.15)",
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
            <Ionicons name={config.icon} size={24} color={config.color} />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.typeLabel, { color: config.color }]}>
              {notification.title.replace(/🗓\s*|🛍\s*/g, "")}
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
          hitSlop={15}
          style={styles.dismissBtn}
        >
          <Ionicons
            name="close"
            size={20}
            color={isDark ? "#6b7280" : "#9ca3af"}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 18,
    position: "relative",
    overflow: "hidden",
  },
  unreadDot: {
    position: "absolute",
    top: "30%",
    left: 0,
    width: 6,
    height: 38,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: "#ff6619",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 18,
  },
  content: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  time: {
    fontSize: 13,
    fontWeight: "600",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  dismissBtn: {
    padding: 8,
    backgroundColor: "transparent",
    borderRadius: 20,
  },
});
