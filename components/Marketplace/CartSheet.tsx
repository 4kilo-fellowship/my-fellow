import { useMarketplaceStore } from "@/stores/marketplace.store";
import { useUserStore } from "@/stores/user.store";
import { getProductImage, getProductPrice } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InfoModal } from "../Modals/InfoModal";

interface CartSheetProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}

const CartSheet = ({ visible, onClose, isDark }: CartSheetProps) => {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUserStore();

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    placeOrder,
    placingOrder,
  } = useMarketplaceStore();

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const total = getCartTotal();

  const handlePlaceOrder = async () => {
    if (!user) {
      onClose();
      router.push("/(auth)/sign-in" as any);
      return;
    }

    try {
      const order = await placeOrder();
      if (order) {
        setInfoModal({
          visible: true,
          title: "Order Placed! 🎉",
          message: "Your order has been placed successfully.",
          type: "success",
        });
        // We delay the onClose() slightly so they see the success modal
        // or we can close the sheet first but then the modal will disappear
        // because it's inside the sheet modal.
        // Actually, it's better to show it and let them close it, then we close sheet.
      }
    } catch (error: any) {
      setInfoModal({
        visible: true,
        title: "Order Failed",
        message: error?.response?.data?.message || "Please try again.",
        type: "error",
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            isDark ? styles.sheetDark : styles.sheetLight,
            { paddingBottom: bottom > 0 ? bottom + 10 : 24 },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? "#52525b" : "#d4d4d8" },
              ]}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons
                name="cart"
                size={24}
                color={isDark ? "#fff" : "#18181b"}
              />
              <Text
                style={[
                  styles.headerTitle,
                  { color: isDark ? "#fff" : "#18181b" },
                ]}
              >
                Your Cart
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{cartItems.length}</Text>
              </View>
            </View>
            {cartItems.length > 0 && (
              <TouchableOpacity onPress={clearCart} hitSlop={8}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cart Items */}
          {cartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="cart-outline"
                size={64}
                color={isDark ? "#3f3f46" : "#d4d4d8"}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: isDark ? "#71717a" : "#a1a1aa" },
                ]}
              >
                Your cart is empty
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={cartItems}
                keyExtractor={(item) => item.product.id}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const imageUri = getProductImage(item.product);
                  const price = getProductPrice(item.product);

                  return (
                    <View
                      style={[
                        styles.cartItem,
                        isDark ? styles.cartItemDark : styles.cartItemLight,
                      ]}
                    >
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.itemImage}
                        contentFit="cover"
                        transition={300}
                      />
                      <View style={styles.itemInfo}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.itemName,
                            { color: isDark ? "#fafafa" : "#18181b" },
                          ]}
                        >
                          {item.product.title}
                        </Text>
                        <Text style={styles.itemPrice}>
                          {(price * item.quantity).toFixed(2)} ETB
                        </Text>
                      </View>

                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          onPress={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          style={[
                            styles.qtyBtn,
                            {
                              backgroundColor: isDark ? "#3f3f46" : "#f4f4f5",
                            },
                          ]}
                        >
                          <Ionicons
                            name="remove"
                            size={16}
                            color={isDark ? "#fff" : "#18181b"}
                          />
                        </TouchableOpacity>
                        <Text
                          style={[
                            styles.qtyText,
                            { color: isDark ? "#fff" : "#18181b" },
                          ]}
                        >
                          {item.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          style={[
                            styles.qtyBtn,
                            {
                              backgroundColor: isDark ? "#3f3f46" : "#f4f4f5",
                            },
                          ]}
                        >
                          <Ionicons
                            name="add"
                            size={16}
                            color={isDark ? "#fff" : "#18181b"}
                          />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => removeFromCart(item.product.id)}
                        hitSlop={8}
                        style={styles.removeBtn}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />

              {/* Footer */}
              <View
                style={[
                  styles.footer,
                  {
                    borderTopColor: isDark ? "#3f3f46" : "#e4e4e7",
                  },
                ]}
              >
                <View style={styles.totalRow}>
                  <Text
                    style={[
                      styles.totalLabel,
                      { color: isDark ? "#a1a1aa" : "#71717a" },
                    ]}
                  >
                    Total
                  </Text>
                  <Text
                    style={[
                      styles.totalAmount,
                      { color: isDark ? "#fff" : "#18181b" },
                    ]}
                  >
                    {total.toFixed(2)} ETB
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.checkoutBtn, placingOrder && { opacity: 0.7 }]}
                  onPress={handlePlaceOrder}
                  disabled={placingOrder}
                  activeOpacity={0.9}
                >
                  {placingOrder ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.checkoutText}>Place Order</Text>
                      <Ionicons
                        name="arrow-forward-circle"
                        size={22}
                        color="#fff"
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      <InfoModal
        visible={infoModal.visible}
        onClose={() => {
          setInfoModal((prev) => ({ ...prev, visible: false }));
          if (infoModal.type === "success") {
            onClose();
          }
        }}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    maxHeight: "80%",
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
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  countBadge: {
    backgroundColor: "#ff6719",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  clearText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "600",
  },
  list: {
    maxHeight: 350,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  cartItemLight: {
    backgroundColor: "#fafafa",
    borderColor: "#f4f4f5",
  },
  cartItemDark: {
    backgroundColor: "#27272a",
    borderColor: "#3f3f46",
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#e4e4e7",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ff6719",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 10,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "800",
    minWidth: 18,
    textAlign: "center",
  },
  removeBtn: {
    padding: 4,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "900",
  },
  checkoutBtn: {
    backgroundColor: "#ff6719",
    paddingVertical: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 4,
    shadowColor: "#ff6719",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
});

export default CartSheet;
