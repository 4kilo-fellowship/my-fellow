import {
  Product,
  getProductImage,
  getProductPrice,
} from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
  product: Product;
  isDark: boolean;
  onPress: () => void;
  onAddToCart: () => void;
}

const ProductCard = ({
  product,
  isDark,
  onPress,
  onAddToCart,
}: ProductCardProps) => {
  const imageUri = getProductImage(product);
  const price = getProductPrice(product);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
    >
      {product.isNew && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
      )}

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={400}
        />
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[styles.name, isDark ? styles.textDark : styles.textLight]}
        >
          {product.title || product.name || "Product"}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#ffb800" />
          <Text
            style={[
              styles.ratingText,
              { color: isDark ? "#a1a1aa" : "#71717a" },
            ]}
          >
            {(4.5 + Math.random() * 0.5).toFixed(1)}
          </Text>
        </View>

        {product.shortDescription && (
          <Text
            numberOfLines={2}
            style={[
              styles.description,
              { color: isDark ? "#a1a1aa" : "#71717a" },
            ]}
          >
            {product.shortDescription}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.price}>{price.toFixed(2)} ETB</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onAddToCart();
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardLight: {
    backgroundColor: "#fff",
    borderColor: "#f4f4f5",
  },
  cardDark: {
    backgroundColor: "#262626",
    borderColor: "#3f3f46",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#ff6719",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    backgroundColor: "#f4f4f5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  textLight: { color: "#18181b" },
  textDark: { color: "#fafafa" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
  },
  description: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    color: "#ff6719",
    fontWeight: "900",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#ff6719",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
});

export default ProductCard;
