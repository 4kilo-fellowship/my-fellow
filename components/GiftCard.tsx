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
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        transition={1000}
      />
      <View style={styles.content}>
        <Text
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
    width: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardLight: {
    backgroundColor: "#fff",
  },
  cardDark: {
    backgroundColor: "#262626",
  },
  image: {
    width: "100%",
    height: 120,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  textLight: {
    color: "#000",
  },
  textDark: {
    color: "#fff",
  },
  price: {
    fontSize: 14,
    color: "#ff6719",
    fontWeight: "700",
    marginBottom: 12,
  },
  buyButton: {
    backgroundColor: "#ff6719",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  buyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default GiftCard;
