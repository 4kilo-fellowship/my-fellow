import { AppBottomSheet } from "@/components/AppBottomSheet";
import { PRIMARY } from "@/constants/colors";
import {
  Product,
  getProductImage,
  getProductPrice,
} from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProductBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  product: Product | null;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductBottomSheet = ({
  visible,
  onClose,
  isDark,
  product,
  onAddToCart,
  onBuyNow,
}: ProductBottomSheetProps) => {
  const [quantity, setQuantity] = useState(1);

  const textColor = isDark ? "#FAFAFA" : "#18181B";
  const subTextColor = isDark ? "#A1A1AA" : "#71717A";
  const cardBg = isDark ? "#27272A" : "#F4F4F5";
  const borderColor = isDark ? "#3F3F46" : "#E4E4E7";
  const qtyBtnBg = isDark ? "#3F3F46" : "#E4E4E7";

  useEffect(() => {
    if (visible) {
      setQuantity(1);
    }
  }, [visible]);

  const incrementQty = () => setQuantity((prev) => Math.min(prev + 1, 99));
  const decrementQty = () => setQuantity((prev) => Math.max(prev - 1, 1));

  if (!product) return null;

  const imageUri = getProductImage(product);
  const unitPrice = getProductPrice(product);
  const totalPrice = unitPrice * quantity;

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      snapPoints={["half", "full"]}
    >
      <View style={styles.sheetContainer}>
        {/* Product Info Row */}
        <View style={[styles.productRow, { borderBottomColor: borderColor }]}>
          <View style={[styles.imageWrapper, { backgroundColor: cardBg }]}>
            <Image
              source={{ uri: imageUri }}
              style={styles.productImage}
              contentFit="cover"
              transition={300}
            />
          </View>
          <View style={styles.productInfo}>
            <Text
              numberOfLines={2}
              style={[styles.productName, { color: textColor }]}
            >
              {product.title || product.name || "Product"}
            </Text>
            {product.category && (
              <Text style={[styles.categoryText, { color: subTextColor }]}>
                {product.category}
              </Text>
            )}
            <Text style={styles.unitPrice}>{unitPrice.toFixed(2)} ETB</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: cardBg }]}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color={subTextColor} />
          </TouchableOpacity>
        </View>

        {/* Quantity Controller */}
        <View
          style={[styles.quantitySection, { borderBottomColor: borderColor }]}
        >
          <Text style={[styles.sectionLabel, { color: subTextColor }]}>
            QUANTITY
          </Text>
          <View style={styles.quantityRow}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={decrementQty}
                style={[
                  styles.qtyBtn,
                  {
                    backgroundColor:
                      quantity <= 1
                        ? isDark
                          ? "#27272A"
                          : "#F4F4F5"
                        : qtyBtnBg,
                    opacity: quantity <= 1 ? 0.5 : 1,
                  },
                ]}
                activeOpacity={0.7}
                disabled={quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity <= 1 ? subTextColor : textColor}
                />
              </TouchableOpacity>

              <View style={[styles.qtyDisplay, { backgroundColor: cardBg }]}>
                <Text style={[styles.qtyText, { color: textColor }]}>
                  {quantity}
                </Text>
              </View>

              <TouchableOpacity
                onPress={incrementQty}
                style={[styles.qtyBtn, { backgroundColor: PRIMARY }]}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.totalPriceContainer}>
              <Text style={[styles.totalLabel, { color: subTextColor }]}>
                Total
              </Text>
              <Text style={[styles.totalPrice, { color: textColor }]}>
                {totalPrice.toFixed(2)} ETB
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <View
            style={[
              styles.nativeButtonOuter,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
                borderWidth: 1.5,
              },
            ]}
          >
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {},
                  );
                }
                onAddToCart(product, quantity);
                onClose();
              }}
              unstable_pressDelay={0}
              accessibilityRole="button"
              accessibilityLabel="Add to Cart"
              android_ripple={{
                color: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.08)",
                borderless: false,
                foreground: true,
              }}
              style={({ pressed }) => [
                styles.nativeButtonInner,
                Platform.OS === "ios" &&
                  pressed && {
                    opacity: 0.85,
                    transform: [{ scale: 0.99 }],
                  },
              ]}
            >
              <Ionicons name="cart-outline" size={20} color={PRIMARY} />
              <Text style={[styles.addToCartText, { color: textColor }]}>
                Add to Cart
              </Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.nativeButtonOuter,
              {
                backgroundColor: PRIMARY,
              },
              styles.buyNowShadow,
            ]}
          >
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {},
                  );
                }
                onBuyNow(product, quantity);
                onClose();
              }}
              unstable_pressDelay={0}
              accessibilityRole="button"
              accessibilityLabel="Buy Now"
              android_ripple={{
                color: "rgba(255, 255, 255, 0.28)",
                borderless: false,
                foreground: true,
              }}
              style={({ pressed }) => [
                styles.nativeButtonInner,
                Platform.OS === "ios" &&
                  pressed && {
                    opacity: 0.88,
                    transform: [{ scale: 0.99 }],
                  },
              ]}
            >
              <Ionicons name="flash" size={18} color="#FFFFFF" />
              <Text style={styles.buyNowText}>Buy Now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    width: "100%",
    paddingBottom: Platform.OS === "ios" ? 16 : 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  imageWrapper: {
    width: 68,
    height: 68,
    borderRadius: 16,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  unitPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ff6719",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quantitySection: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyDisplay: {
    width: 44,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "700",
  },
  totalPriceContainer: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "900",
  },
  actionSection: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  nativeButtonOuter: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
  },
  nativeButtonInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: "700",
  },
  buyNowText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  buyNowShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#ff6719",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default ProductBottomSheet;