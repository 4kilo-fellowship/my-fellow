import { PRIMARY } from "@/constants/colors";
import {
  Product,
  getProductImage,
  getProductPrice,
} from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { bottom } = useSafeAreaInsets();
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
    <>
      {/* Backdrop — fades in independently */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
      </Modal>

      {/* Sheet — slides up from bottom */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onClose}
          />
          <View
            style={[
              styles.sheet,
              isDark ? styles.sheetDark : styles.sheetLight,
              { paddingBottom: bottom > 0 ? bottom + 8 : 24 },
            ]}
          >
            {/* Handle Bar */}
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: isDark ? "#52525B" : "#D4D4D8" },
                ]}
              />
            </View>

            {/* Product Info Row */}
            <View
              style={[styles.productRow, { borderBottomColor: borderColor }]}
            >
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
              style={[
                styles.quantitySection,
                { borderBottomColor: borderColor },
              ]}
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

                  <View
                    style={[styles.qtyDisplay, { backgroundColor: cardBg }]}
                  >
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
              <TouchableOpacity
                onPress={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                style={[
                  styles.addToCartBtn,
                  {
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={22} color={PRIMARY} />
                <Text style={[styles.addToCartText, { color: textColor }]}>
                  Add to Cart
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onBuyNow(product, quantity);
                  onClose();
                }}
                style={styles.buyNowBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={20} color="#FFFFFF" />
                <Text style={styles.buyNowText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
  },
  sheetLight: {
    backgroundColor: "#fff",
  },
  sheetDark: {
    backgroundColor: "#1A1A1B",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 18,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
    paddingTop: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
    lineHeight: 22,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    marginBottom: 6,
  },
  unitPrice: {
    fontSize: 17,
    fontWeight: "900",
    color: PRIMARY,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  quantitySection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyDisplay: {
    minWidth: 56,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  qtyText: {
    fontSize: 20,
    fontWeight: "900",
  },
  totalPriceContainer: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  actionSection: {
    paddingTop: 20,
    flexDirection: "row",
    gap: 12,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 8,
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: "800",
  },
  buyNowBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    gap: 8,
    elevation: 4,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buyNowText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
