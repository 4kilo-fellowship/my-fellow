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
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
      </View>
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
    // Removed overflow: hidden here to prevent shadow clipping
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: "#fff",
    borderColor: "#f4f4f5", // zinc-100 equivalent for a subtle edge
  },
  cardDark: {
    backgroundColor: "#262626",
    borderColor: "#3f3f46", // zinc-700 equivalent
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#ff6719",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  imageContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden", // Only hide overflow on the top part to allow shadows on bottom
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
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  textLight: {
    color: "#18181b",
  },
  textDark: {
    color: "#fafafa",
  },
  price: {
    fontSize: 16,
    color: "#ff6719",
    fontWeight: "900",
    marginBottom: 16,
  },
  buyButton: {
    backgroundColor: "#ff6719",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    elevation: 2,
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});

export default GiftCard;
