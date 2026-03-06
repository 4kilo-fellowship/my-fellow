import OrderCard from "@/components/Marketplace/OrderCard";
import { useTheme } from "@/context/ThemeContext";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrdersScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUserStore();

  const {
    orders,
    ordersLoading,
    ordersHasMore,
    fetchMyOrders,
    loadMoreOrders,
    error,
  } = useMarketplaceStore();

  useEffect(() => {
    if (user) fetchMyOrders(true);
  }, [user]);

  const STATIC_HEADER_HEIGHT = top + 64;

  const renderFooter = () => {
    if (!ordersHasMore || !ordersLoading) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color="#ff6719" />
      </View>
    );
  };

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isDark ? "#1A1A1B" : "#fff",
          paddingHorizontal: 40,
        }}
      >
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor={isDark ? "#1A1A1B" : "#fff"}
        />
        <Ionicons
          name="lock-closed-outline"
          size={64}
          color={isDark ? "#3f3f46" : "#d4d4d8"}
        />
        <Text
          style={{
            marginTop: 16,
            fontSize: 17,
            fontWeight: "800",
            color: isDark ? "#fff" : "#18181b",
          }}
        >
          Sign in to see your orders
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/sign-in" as any)}
          style={{
            marginTop: 20,
            backgroundColor: "#ff6719",
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 16,
          }}
          activeOpacity={0.9}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#1A1A1B" : "#f8f8f8",
      }}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: top + 10,
          paddingHorizontal: 20,
          height: STATIC_HEADER_HEIGHT,
          backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
        }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full items-center justify-center mr-4"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "white" : "#0f172a"}
            />
          </TouchableOpacity>
          <Text
            className={`flex-1 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            My Orders
          </Text>
        </View>
      </View>

      {/* Loading */}
      {ordersLoading && orders.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#ff6719" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={{ height: STATIC_HEADER_HEIGHT }} />
          }
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 4,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <OrderCard order={item} isDark={isDark} />}
          onEndReached={loadMoreOrders}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
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
                No orders yet
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: isDark ? "#52525b" : "#a1a1aa",
                  textAlign: "center",
                  paddingHorizontal: 40,
                }}
              >
                Your order history will appear here
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={ordersLoading}
              onRefresh={() => fetchMyOrders(true)}
              colors={["#ff6719"]}
              tintColor="#ff6719"
              progressViewOffset={STATIC_HEADER_HEIGHT}
            />
          }
        />
      )}
    </View>
  );
}
