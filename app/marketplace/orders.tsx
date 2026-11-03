import { ScreenHeader } from "@/components/ScreenHeader";
import OrderCard from "@/components/Marketplace/OrderCard";
import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { InfoModal } from "@/components/Modals/InfoModal";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { useUserStore } from "@/stores/user.store";
import { Order } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_OPTIONS: ("PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED")[] =
  ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUserStore();
  const isAdmin = useIsAdmin();

  const {
    orders,
    ordersLoading,
    ordersHasMore,
    fetchMyOrders,
    loadMoreOrders,
    adminOrders,
    adminOrdersLoading,
    fetchAdminOrders,
    updateOrderStatus,
  } = useMarketplaceStore();

  const [activeTab, setActiveTab] = useState<"my" | "admin">("my");
  const [selectedOrderForStatus, setSelectedOrderForStatus] =
    useState<Order | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  useEffect(() => {
    if (user) {
      if (activeTab === "my") {
        fetchMyOrders(true);
      } else if (isAdmin) {
        fetchAdminOrders();
      }
    }
  }, [user, activeTab, isAdmin]);

  const handleStatusChange = async (
    newStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
  ) => {
    if (!selectedOrderForStatus) return;
    try {
      setStatusUpdating(true);
      await updateOrderStatus(selectedOrderForStatus.id, newStatus);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setSelectedOrderForStatus(null);
      setInfoModal({
        visible: true,
        title: "Order Updated",
        message: `Order status set to ${newStatus}.`,
        type: "success",
      });
    } catch {
      setInfoModal({
        visible: true,
        title: "Update Failed",
        message: "Could not update order status.",
        type: "error",
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const STATIC_HEADER_HEIGHT = top + 64;

  const currentList = activeTab === "admin" ? adminOrders : orders;
  const currentLoading =
    activeTab === "admin" ? adminOrdersLoading : ordersLoading;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#1A1A1B" : "#f8fafc" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <ScreenHeader
        title={activeTab === "admin" ? "All Orders (Admin)" : "My Orders"}
      />

      {/* Admin Tab Switcher */}
      {isAdmin && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              );
              setActiveTab("my");
            }}
            style={[
              styles.tabBtn,
              activeTab === "my"
                ? styles.tabBtnActive
                : isDark
                  ? styles.tabBtnDark
                  : styles.tabBtnLight,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "my"
                  ? styles.tabTextActive
                  : isDark
                    ? styles.tabTextDark
                    : styles.tabTextLight,
              ]}
            >
              My Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              );
              setActiveTab("admin");
            }}
            style={[
              styles.tabBtn,
              activeTab === "admin"
                ? styles.tabBtnActive
                : isDark
                  ? styles.tabBtnDark
                  : styles.tabBtnLight,
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={activeTab === "admin" ? "#fff" : PRIMARY}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "admin"
                  ? styles.tabTextActive
                  : isDark
                    ? styles.tabTextDark
                    : styles.tabTextLight,
              ]}
            >
              All Orders ({adminOrders.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {currentLoading && currentList.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 12,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              <OrderCard
                order={item}
                isDark={isDark}
                onPress={
                  isAdmin && activeTab === "admin"
                    ? () => setSelectedOrderForStatus(item)
                    : undefined
                }
              />
              {isAdmin && activeTab === "admin" && (
                <View style={styles.adminActionRow}>
                  <TouchableOpacity
                    onPress={() => setSelectedOrderForStatus(item)}
                    style={styles.statusChangeBtn}
                  >
                    <Ionicons name="create-outline" size={14} color={PRIMARY} />
                    <Text style={styles.statusChangeBtnText}>
                      Change Status: {item.status?.toUpperCase() || "PENDING"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          onEndReached={activeTab === "my" ? loadMoreOrders : undefined}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 80,
              }}
            >
              <Ionicons
                name="receipt-outline"
                size={72}
                color={isDark ? "#3f3f46" : "#d4d4d8"}
              />
              <Text
                style={{
                  marginTop: 16,
                  fontSize: 17,
                  fontWeight: "700",
                  color: isDark ? "#71717a" : "#a1a1aa",
                }}
              >
                No orders found
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={currentLoading}
              onRefresh={() => {
                if (activeTab === "admin") {
                  fetchAdminOrders();
                } else {
                  fetchMyOrders(true);
                }
              }}
              colors={[PRIMARY]}
              tintColor={PRIMARY}
            />
          }
        />
      )}

      {/* Admin Status Change Modal */}
      <Modal
        visible={Boolean(selectedOrderForStatus)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedOrderForStatus(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSelectedOrderForStatus(null)}
          style={styles.modalBackdrop}
        >
          <View
            style={[
              styles.modalCard,
              isDark ? styles.modalCardDark : styles.modalCardLight,
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Update Order Status
            </Text>
            <Text
              style={[
                styles.modalDesc,
                isDark ? styles.descDark : styles.descLight,
              ]}
            >
              Order #{selectedOrderForStatus?.id.slice(-6).toUpperCase()}
            </Text>

            <View style={styles.statusList}>
              {STATUS_OPTIONS.map((st) => {
                const isCurrent =
                  (selectedOrderForStatus?.status || "pending").toUpperCase() ===
                  st;
                return (
                  <TouchableOpacity
                    key={st}
                    onPress={() => handleStatusChange(st)}
                    disabled={statusUpdating}
                    style={[
                      styles.statusOption,
                      isCurrent && styles.statusOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        isCurrent && styles.statusOptionTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                    {isCurrent && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setSelectedOrderForStatus(null)}
              style={styles.cancelModalBtn}
            >
              <Text style={styles.cancelModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    paddingVertical: 10,
  },
  tabBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
  },
  tabBtnDark: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
  },
  tabBtnLight: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  tabBtnActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  tabText: { fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  tabTextDark: { color: "#94a3b8" },
  tabTextLight: { color: "#64748b" },
  adminActionRow: {
    marginTop: -4,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusChangeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
  },
  statusChangeBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: PRIMARY,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
  },
  modalCardDark: {
    backgroundColor: "#111827",
  },
  modalCardLight: {
    backgroundColor: "#ffffff",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalDesc: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  textLight: { color: "#f8fafc" },
  textDark: { color: "#0f172a" },
  descDark: { color: "#94a3b8" },
  descLight: { color: "#64748b" },
  statusList: { gap: 8 },
  statusOption: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  statusOptionActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  statusOptionText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  statusOptionTextActive: { color: "#fff" },
  cancelModalBtn: {
    marginTop: 16,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalText: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
});
