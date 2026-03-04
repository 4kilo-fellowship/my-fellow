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

  const isRecentlyCreated = () => {
    if (!product.createdAt) return false;
    const createdDate = new Date(product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const showNewBadge = product.isNew || isRecentlyCreated();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
    >
      {showNewBadge && (
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
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  cardLight: {
    backgroundColor: "#fff",
    borderColor: "#f1f1f1",
  },
  cardDark: {
    backgroundColor: "#1c1c1e",
    borderColor: "#2c2c2e",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  imageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.5,
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
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#ff6719",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProductCard;
