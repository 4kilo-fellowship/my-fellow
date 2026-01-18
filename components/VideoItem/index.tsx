import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface VideoItemProps {
  item: {
    id: string | number;
    title: string;
    desc: string;
    duration: string;
    thumbnail: string;
  };
  isDark?: boolean;
}

const VideoItem: React.FC<VideoItemProps> = ({ item, isDark = false }) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#111" : "#fff",
          borderColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
        },
      ]}
    >
      {/* Text content */}
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#111" }]}>
          {item.title}
        </Text>
        <Text
          style={[styles.desc, { color: isDark ? "#94a3b8" : "#64748b" }]}
          numberOfLines={2}
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

      {/* Thumbnail */}
      <View style={styles.thumbnailWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.25)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.playIconWrap}>
          <Ionicons name="play-circle" size={28} color="white" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    padding: 12,
    borderWidth: 1,
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    marginBottom: 8,
  },
  durationWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    marginLeft: 8,
    fontSize: 12,
  },
  thumbnailWrap: {
    width: 110,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playIconWrap: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "rgba(0,0,0,0.28)",
    padding: 6,
    borderRadius: 20,
  },
});

export default VideoItem;
