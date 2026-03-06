import ImageGallery from "@/components/Marketplace/ImageGallery";
import { InfoModal } from "@/components/Modals/InfoModal";
import { useTheme } from "@/context/ThemeContext";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { useUserStore } from "@/stores/user.store";
import { getProductImages, getProductPrice } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────────────────────
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/500";

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProductDetailScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;

  const { user } = useUserStore();
  const {
    currentProduct: product,
    loading,
    error,
    fetchProductById,
    addToCart,
    placeOrder,
    placingOrder,
  } = useMarketplaceStore();

  const [quantity, setQuantity] = useState(1);
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  useEffect(() => {
    if (id) fetchProductById(id);
  }, [id]);

  // Derived values
  const images = product ? getProductImages(product) : [PLACEHOLDER_IMAGE];
  const price = product ? getProductPrice(product) : 0;
  const displayName = product?.name || product?.title || "Product";
  const isOutOfStock = product?.stock === 0;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setInfoModal({
      visible: true,
      title: "Added to Cart",
      message: `${quantity}× ${displayName} added to your cart.`,
      type: "success",
    });
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (!user) {
      router.push("/(auth)/sign-in" as any);
      return;
    }

    // Add the product to cart, then immediately place the order
    addToCart(product, quantity);

    try {
      const order = await placeOrder();
      if (order) {
        setInfoModal({
          visible: true,
          title: "Order Placed! 🎉",
          message: "Your order has been placed successfully.",
          type: "success",
        });
      }
    } catch (err: any) {
      setInfoModal({
        visible: true,
        title: "Order Failed",
        message: err?.response?.data?.message || "Please try again.",
        type: "error",
      });
    }
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: isDark ? "#1A1A1B" : "#fff" },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color="#ff6719" />
      </View>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: isDark ? "#1A1A1B" : "#fff" },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="alert-circle-outline" size={64} color="#ff6719" />
        <Text
          style={[styles.errorTitle, { color: isDark ? "#fff" : "#18181b" }]}
        >
          {error || "Product not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.errorButton}
          activeOpacity={0.9}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#1A1A1B" : "#fff" }}>
      <StatusBar style="light" />

      {/* ── Floating Header ────────────────────────────────────────────── */}
      <HeaderBar
        isDark={isDark}
        top={top}
        onBack={() => router.back()}
        onShare={() => {
          setInfoModal({
            visible: true,
            title: "Share",
            message: "Share feature coming soon!",
            type: "info",
          });
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
        bounces={true}
      >
        {/* ── Image Gallery ─────────────────────────────────────────────── */}
        <ImageGallery images={images} isDark={isDark} />

        {/* ── Product Info ──────────────────────────────────────────────── */}
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: isDark ? "#1A1A1B" : "#fff" },
          ]}
        >
          {/* Category badge */}
          {product.category && (
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isDark ? "#a1a1aa" : "#71717a" },
                ]}
              >
                {product.category.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Name */}
          <Text
            style={[styles.productName, { color: isDark ? "#fff" : "#09090b" }]}
          >
            {displayName}
          </Text>

          {/* Price & Stock Row */}
          <View style={styles.priceRow}>
            <Text
              style={[
                styles.productPrice,
                { color: isDark ? "#fff" : "#09090b" },
              ]}
            >
              {price.toFixed(2)} ETB
            </Text>
            {product.stock != null && (
              <View
                style={[
                  styles.stockBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.stockDot,
                    {
                      backgroundColor: isOutOfStock ? "#ef4444" : "#22c55e",
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.stockText,
                    {
                      color: isOutOfStock
                        ? "#ef4444"
                        : isDark
                          ? "#a1a1aa"
                          : "#52525b",
                    },
                  ]}
                >
                  {isOutOfStock ? "Out of stock" : `${product.stock} in stock`}
                </Text>
              </View>
            )}
          </View>

          {/* New Badge */}
          {product.isNew && (
            <View style={styles.newBadge}>
              <Text
                style={[
                  styles.newBadgeText,
                  { color: isDark ? "#71717a" : "#a1a1aa" },
                ]}
              >
                New Arrival
              </Text>
            </View>
          )}

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#27272a" : "#f4f4f5" },
            ]}
          />

          {/* Description */}
          {(product.description || product.shortDescription) && (
            <View style={styles.descriptionSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? "#e4e4e7" : "#27272a" },
                ]}
              >
                About this product
              </Text>
              <Text
                style={[
                  styles.descriptionText,
                  { color: isDark ? "#a1a1aa" : "#52525b" },
                ]}
              >
                {product.description || product.shortDescription}
              </Text>
            </View>
          )}

          {/* Quantity Selector — inline */}
          <View style={styles.quantitySection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#e4e4e7" : "#27272a" },
              ]}
            >
              Quantity
            </Text>
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
                onPress={decrementQuantity}
                style={styles.qtyBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={isDark ? "#fff" : "#18181b"}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.qtyValue,
                  { color: isDark ? "#fff" : "#18181b" },
                ]}
              >
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={incrementQuantity}
                style={styles.qtyBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={isDark ? "#fff" : "#18181b"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Action Bar ─────────────────────────────────────────────── */}
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
        {/* Add to Cart */}
        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            isOutOfStock && { opacity: 0.5 },
            { borderColor: isDark ? "#3f3f46" : "#e4e4e7" },
          ]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          activeOpacity={0.9}
        >
          <Ionicons
            name="cart-outline"
            size={22}
            color={isDark ? "#fff" : "#18181b"}
          />
        </TouchableOpacity>

        {/* Buy Now / Place Order */}
        <TouchableOpacity
          style={[
            styles.buyNowBtn,
            isOutOfStock && { backgroundColor: "#71717a" },
            placingOrder && { opacity: 0.7 },
          ]}
          onPress={handleBuyNow}
          disabled={isOutOfStock || placingOrder}
          activeOpacity={0.9}
        >
          {placingOrder ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.buyNowText}>
                {isOutOfStock
                  ? "Out of Stock"
                  : `Buy Now · ${(price * quantity).toFixed(2)} ETB`}
              </Text>
              {!isOutOfStock && (
                <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
    </View>
  );
}

// ─── Header Component ─────────────────────────────────────────────────────────
/** Floating header bar matching event details screen style. */
const HeaderBar = ({
  isDark,
  top,
  onBack,
  onShare,
}: {
  isDark: boolean;
  top: number;
  onBack: () => void;
  onShare: () => void;
}) => (
  <View style={[styles.headerContainer, { top: top + 10 }]}>
    <TouchableOpacity
      onPress={onBack}
      activeOpacity={0.8}
      style={styles.headerButton}
    >
      <Ionicons name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={onShare}
      activeOpacity={0.8}
      style={styles.headerButton}
    >
      <Ionicons name="share-social-outline" size={22} color="#fff" />
    </TouchableOpacity>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // States
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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

  // Header
  headerContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Content
  contentContainer: {
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 14,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  productName: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "600",
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    marginTop: 20,
    marginBottom: 20,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 26,
    letterSpacing: 0.1,
  },

  // Quantity
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quantityWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    fontSize: 17,
    fontWeight: "900",
    minWidth: 30,
    textAlign: "center",
  },

  // Bottom bar
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
  addToCartBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowBtn: {
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
  buyNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
