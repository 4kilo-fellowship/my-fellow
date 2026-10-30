import { Video } from "@/constants/videos";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface VideoItemProps {
  item: Video;
  isDark?: boolean;
  onPress?: () => void;
}

const VideoItem: React.FC<VideoItemProps> = ({
  item,
  isDark = false,
  onPress,
}) => {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onPress?.();
  };

  const rippleColor = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <View
      style={[
        styles.outer,
        {
          backgroundColor: isDark ? "#121212" : "#ffffff",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Watch video: ${item.title}`}
        onPress={handlePress}
        unstable_pressDelay={0}
        android_ripple={{
          color: rippleColor,
          borderless: false,
          foreground: true,
        }}
        style={({ pressed }) => [
          styles.pressable,
          { backgroundColor: isDark ? "#121212" : "#ffffff" },
          Platform.OS === "ios" && pressed && { opacity: 0.75 },
        ]}
      >
        <View style={styles.contentRow}>
          {/* Thumbnail on Left */}
          <View
            style={[
              styles.thumbnailWrap,
              { backgroundColor: isDark ? "#1f1f1f" : "#f1f5f9" },
            ]}
          >
            <ExpoImage
              source={{ uri: item.thumbnail }}
              style={styles.thumbnail}
              contentFit="cover"
              transition={150}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.35)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.playIconBadge}>
              <Ionicons name="play" size={13} color="#ffffff" style={{ marginLeft: 2 }} />
            </View>
          </View>

          {/* Text content on Right */}
          <View style={styles.textWrap}>
            <Text
              numberOfLines={2}
              style={[
                styles.title,
                { color: isDark ? "#ffffff" : "#0f172a" },
              ]}
            >
              {item.title}
            </Text>

            <Text
              numberOfLines={1}
              style={[
                styles.desc,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              {item.desc}
            </Text>

            <View style={styles.durationWrap}>
              <Ionicons
                name="time-outline"
                size={12}
                color={isDark ? "#94a3b8" : "#64748b"}
              />
              <Text
                style={[
                  styles.durationText,
                  { color: isDark ? "#94a3b8" : "#64748b" },
                ]}
              >
                {item.duration}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  pressable: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    width: "100%",
  },
  thumbnailWrap: {
    width: 110,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playIconBadge: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  textWrap: {
    flex: 1,
    flexShrink: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  durationWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "500",
  },
});

export default VideoItem;
