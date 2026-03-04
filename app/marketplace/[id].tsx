import { useTheme } from "@/context/ThemeContext";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { getProductImage, getProductPrice } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;

  const [quantity, setQuantity] = useState(1);

  const { currentProduct, loading, error, fetchProductById, addToCart } =
    useMarketplaceStore();

  useEffect(() => {
    if (id) fetchProductById(id);
  }, [id]);

  const product = currentProduct;
  const imageUri = product
    ? getProductImage(product)
    : "https://via.placeholder.com/500";
  const price = product ? getProductPrice(product) : 0;
  const displayName = product?.name || product?.title || "Product";

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    Toast.show({
      type: "success",
      text1: "Added to Cart 🛒",
      text2: `${quantity}x ${displayName} added to your cart.`,
      visibilityTime: 2000,
    });
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: isDark ? "#1A1A1B" : "#fff" },
        ]}
      >
        <ActivityIndicator size="large" color="#ff6719" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: isDark ? "#1A1A1B" : "#fff" },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={64} color="#ff6719" />
        <Text
          style={[styles.errorTitle, { color: isDark ? "#fff" : "#18181b" }]}
        >
          {error || "Product not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#1A1A1B" : "#fff" }}>
      <StatusBar style="light" />

      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.heroImage}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.7)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={[styles.backButton, { top: top + 10 }]}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Badge */}
        {product.isNew && (
          <View style={[styles.heroBadge, { top: top + 10 }]}>
            <Text style={styles.heroBadgeText}>NEW</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View
        style={[
          styles.contentContainer,
          { backgroundColor: isDark ? "#1A1A1B" : "#fff" },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View style={styles.contentInner}>
            {product.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {product.category.toUpperCase()}
                </Text>
              </View>
            )}

            <Text
              style={[
                styles.productName,
                { color: isDark ? "#fff" : "#18181b" },
              ]}
            >
              {displayName}
            </Text>

            <Text style={styles.productPrice}>{price.toFixed(2)} ETB</Text>

            {product.stock != null && (
              <View style={styles.stockRow}>
                <Ionicons
                  name={product.stock > 0 ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={product.stock > 0 ? "#22c55e" : "#ef4444"}
                />
                <Text
                  style={[
                    styles.stockText,
                    { color: product.stock > 0 ? "#22c55e" : "#ef4444" },
                  ]}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </Text>
              </View>
            )}

            {(product.description || product.shortDescription) && (
              <View style={{ marginTop: 24 }}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: isDark ? "#fff" : "#18181b" },
                  ]}
                >
                  Description
                </Text>
                <Text
                  style={[
                    styles.descriptionText,
                    { color: isDark ? "#a1a1aa" : "#71717a" },
                  ]}
                >
                  {product.description || product.shortDescription}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark ? "#1A1A1B" : "#fff",
            borderTopColor: isDark ? "#27272a" : "#f4f4f5",
            paddingBottom: bottom > 0 ? bottom + 4 : 20,
          },
        ]}
      >
        {/* Quantity Selector */}
        <View
          style={[
            styles.quantityWrapper,
            {
              backgroundColor: isDark ? "#27272a" : "#f4f4f5",
              borderColor: isDark ? "#3f3f46" : "#e4e4e7",
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.qtyBtnDetail}
          >
            <Ionicons
              name="remove"
              size={20}
              color={isDark ? "#fff" : "#18181b"}
            />
          </TouchableOpacity>
          <Text
            style={[styles.qtyValue, { color: isDark ? "#fff" : "#18181b" }]}
          >
            {quantity}
          </Text>
          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={styles.qtyBtnDetail}
          >
            <Ionicons
              name="add"
              size={20}
              color={isDark ? "#fff" : "#18181b"}
            />
          </TouchableOpacity>
        </View>

        {/* Add to Cart */}
        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            product.stock === 0 && { backgroundColor: "#71717a" },
          ]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
          activeOpacity={0.9}
        >
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.addToCartText}>
            Add · {(price * quantity).toFixed(2)} ETB
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.85,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadge: {
    position: "absolute",
    right: 16,
    backgroundColor: "#ff6719",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  contentInner: {
    padding: 24,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,103,25,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  categoryText: {
    color: "#ff6719",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  productName: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ff6719",
    marginBottom: 4,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  stockText: {
    fontSize: 13,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  quantityWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtnDetail: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    fontSize: 17,
    fontWeight: "900",
    minWidth: 28,
    textAlign: "center",
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: "#ff6719",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    elevation: 4,
    shadowColor: "#ff6719",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  errorButton: {
    marginTop: 16,
    backgroundColor: "#ff6719",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  errorButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
