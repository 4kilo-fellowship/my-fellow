import { Order } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface OrderCardProps {
  order: Order;
  isDark: boolean;
  onPress?: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dbeafe", text: "#1e40af" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const OrderCard = ({ order, isDark, onPress }: OrderCardProps) => {
  const statusColor =
    STATUS_COLORS[order.status || "pending"] || STATUS_COLORS.pending;
  const itemCount = order.items?.length || 0;
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
    >
      <View style={styles.topRow}>
        <View style={styles.orderInfo}>
          <Text
            style={[styles.orderId, { color: isDark ? "#a1a1aa" : "#71717a" }]}
          >
            Order #{order.id.slice(-8).toUpperCase()}
          </Text>
          {date ? (
            <Text
              style={[styles.date, { color: isDark ? "#52525b" : "#a1a1aa" }]}
            >
              {date}
            </Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {(order.status || "pending").charAt(0).toUpperCase() +
              (order.status || "pending").slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.detail}>
          <Ionicons
            name="cube-outline"
            size={16}
            color={isDark ? "#71717a" : "#a1a1aa"}
          />
          <Text
            style={[
              styles.detailText,
              { color: isDark ? "#a1a1aa" : "#71717a" },
            ]}
          >
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </Text>
        </View>
        {order.totalAmount != null && (
          <Text style={styles.total}>{order.totalAmount.toFixed(2)} ETB</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: "#fff",
    borderColor: "#f4f4f5",
  },
  cardDark: {
    backgroundColor: "#262626",
    borderColor: "#3f3f46",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    fontWeight: "600",
  },
  total: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ff6719",
  },
});

export default OrderCard;
