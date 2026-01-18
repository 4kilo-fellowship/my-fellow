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
  isDark?: boolean; // optional if you want to handle dark mode
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  item,
  isDark,
}) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.45)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{item.cta}</Text>
          <Ionicons name={item.ctaIcon} size={16} color="#fff" />
        </TouchableOpacity>
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
    height: 200,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#14B8A6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginRight: 8,
  },
});

export default AnnouncementCard;
