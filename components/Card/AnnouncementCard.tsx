import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

import { API_URL } from "@/constants";
import { Image as ExpoImage } from "expo-image";
import {
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

  // Support multiple possible field names from backend
  const imageUri =
    (item as any).image ||
    (item as any).imageUrl ||
    (item as any).image_url ||
    null;
  const subtitleText =
    item.subtitle ||
    (item as any).shortDescription ||
    (item as any).short_description ||
    "";
  const ctaText = (item as any).cta || (item as any).cta_text || "Register";

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.card}
    >
      <ExpoImage
        source={
          imageUri && typeof imageUri === "string"
            ? imageUri.startsWith("http")
              ? imageUri
              : `${API_URL.replace(/\/api$/, "")}${imageUri}`
            : require("@/assets/images/header.png")
        }
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={250}
        // placeholder={require("@/assets/images/header.png")}
        cachePolicy="memory-disk"
      />

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

        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={handlePrimary}
            accessibilityLabel={`Primary action for ${item.title}`}
          >
            <View style={styles.primaryTextWrapper}>
              <Text style={styles.primaryButtonText}>{ctaText}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
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
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "#14B8A6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  primaryTextWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
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
});

export default AnnouncementCard;
