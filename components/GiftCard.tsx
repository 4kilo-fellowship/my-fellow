import { GiftItem } from "@/constants/gifts";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

interface GiftCardProps {
  item: GiftItem;
  onPress: (item: GiftItem) => void;
  isDark: boolean;
}

const GiftCard = ({ item, onPress, isDark }: GiftCardProps) => {
  const handlePress = () => {
    if (Platform.OS === "android") {
      ToastAndroid.show("Coming Soon...", ToastAndroid.SHORT);
    } else {
      onPress(item);
    }
  };

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {item.isNew && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
      )}
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        transition={1000}
      />
      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[styles.name, isDark ? styles.textDark : styles.textLight]}
        >
          {item.name}
        </Text>
        <Text style={styles.price}>{item.price} ETB</Text>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={styles.buyButtonText}>Buy</Text>
          <Ionicons name="cart-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 240,
    borderRadius: 24,
    marginRight: 18,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardLight: {
    backgroundColor: "#fff",
  },
  cardDark: {
    backgroundColor: "#262626",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#ff6719",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  image: {
    width: "100%",
    height: 160,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  textLight: {
    color: "#1a1a1a",
  },
  textDark: {
    color: "#f0f0f0",
  },
  price: {
    fontSize: 16,
    color: "#ff6719",
    fontWeight: "800",
    marginBottom: 16,
  },
  buyButton: {
    backgroundColor: "#ff6719",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default GiftCard;
