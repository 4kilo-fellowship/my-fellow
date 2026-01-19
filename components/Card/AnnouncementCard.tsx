import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

import {
  Dimensions,
  Image,
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
}

const AnnouncementCard = ({ item, isDark }: AnnouncementCardProps) => {
  const handlePrimary = () => {
    console.log("CTA pressed:", item.title);
  };

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.32)", "rgba(0,0,0,0.56)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={styles.subtitle}>
          {item.subtitle}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            className="bg-primary"
            onPress={handlePrimary}
            accessibilityLabel={`Primary action for ${item.title}`}
          >
            <View style={styles.primaryTextWrapper}>
              <Text style={styles.primaryButtonText}>{item.cta}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  primaryTextWrapper: {
    flex: 1,
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
