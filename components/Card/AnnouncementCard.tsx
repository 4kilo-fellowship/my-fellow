import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";

import { Image as ExpoImage } from "expo-image";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface AnnouncementItem {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaIcon: keyof typeof Ionicons.glyphMap;
}

interface AnnouncementCardProps {
  item: AnnouncementItem;
  isDark?: boolean;
  onPress?: () => void;
}

const AnnouncementCard = ({ item, isDark, onPress }: AnnouncementCardProps) => {
  const handlePrimary = () => {
    console.log(item);
  };

  const imageUri = (item as any).imageUrl || null;
  const subtitleText =
    item.subtitle ||
    (item as any).shortDescription ||
    (item as any).short_description ||
    "";
  const ctaText = (item as any).cta || (item as any).buttonText || "Register";

  const [loading, setLoading] = useState(true);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.card}
    >
      <ExpoImage
        source={
          imageUri && typeof imageUri === "string"
            ? imageUri
            : require("@/assets/images/header.png")
        }
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        cachePolicy="memory-disk"
      />

      {loading && (
        <View
          style={[styles.skeleton, StyleSheet.absoluteFill]}
          pointerEvents="none"
        >
          <Animated.View
            style={[styles.shimmer, { transform: [{ translateX }] }]}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0)",
                "rgba(255,255,255,0.4)",
                "rgba(255,255,255,0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.32)", "rgba(0,0,0,0.56)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text numberOfLines={3} style={styles.subtitle}>
          {subtitleText}
        </Text>


        <View style={styles.actionsRow} className="w-full mt-4 items-center justify-center">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePrimary}
            accessibilityLabel={`Primary action for ${item.title}`}
            className="w-full bg-[#ff6719] py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-500/30"
          >
            <Text className="text-white text-lg font-bold mr-2">{ctaText}</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginRight: 16,
    overflow: "hidden",
    borderRadius: 20,
    width: width - 48,
    height: 400,
    backgroundColor: "#1a1a1a",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "600",
    marginRight: 6,
  },
  skeleton: {
    backgroundColor: "#1a1a1a",
    zIndex: -1,
    opacity: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: width * 2,
    opacity: 0.6,
  },
});

export default AnnouncementCard;
