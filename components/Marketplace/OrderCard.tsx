import { getProductImage, Order } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface OrderCardProps {
  order: Order;
  isDark: boolean;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pending: { bg: "#FFF7ED", text: "#C2410C", icon: "time-outline" },
  confirmed: {
    bg: "#EFF6FF",
    text: "#1D4ED8",
    icon: "checkmark-circle-outline",
  },
  completed: { bg: "#F0FDF4", text: "#15803D", icon: "bag-check-outline" },
  cancelled: { bg: "#FEF2F2", text: "#B91C1C", icon: "close-circle-outline" },
};

const OrderCard = ({ order, isDark, onPress }: OrderCardProps) => {
  const status = (order.status || "pending").toLowerCase();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const itemCount = order.items?.length || 0;

  // Get image from the first item if available
  const firstItemProduct = order.items?.[0]?.product;
  const imageUri = firstItemProduct ? getProductImage(firstItemProduct) : null;

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const totalAmount =
    typeof order.totalAmount === "string"
      ? parseFloat(order.totalAmount)
      : order.totalAmount || 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
    >
      <View style={styles.container}>
        {/* Left: Image Preview */}
        <View
          style={[
            styles.imageWrapper,
            isDark ? styles.imageWrapperDark : styles.imageWrapperLight,
          ]}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="cube-outline"
                size={24}
                color={isDark ? "#3f3f46" : "#d4d4d8"}
              />
            </View>
          )}
        </View>

        {/* Right: Info */}
        <View style={styles.info}>
          <View style={styles.header}>
            <Text
              numberOfLines={1}
              style={[
                styles.productName,
                { color: isDark ? "#FAFAFA" : "#18181B" },
              ]}
            >
              {firstItemProduct?.title ||
                firstItemProduct?.name ||
                `Order #${order.id.slice(-6).toUpperCase()}`}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
              <Ionicons
                name={config.icon}
                size={12}
                color={config.text}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.statusText, { color: config.text }]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>

          <Text
            style={[styles.date, { color: isDark ? "#A1A1AA" : "#71717A" }]}
          >
            Ordered on {date}
          </Text>

          <View style={styles.footer}>
            <Text
              style={[
                styles.itemCount,
                { color: isDark ? "#71717A" : "#a1a1aa" },
              ]}
            >
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </Text>
            <Text style={styles.price}>{totalAmount.toFixed(2)} ETB</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  cardLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F1F1F1",
  },
  cardDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "#2C2C2E",
  },
  container: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapperLight: {
    backgroundColor: "#F8FAFC",
  },
  imageWrapperDark: {
    backgroundColor: "#27272A",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  price: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FF6719",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  detailLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF6719",
  },
});

export default OrderCard;
