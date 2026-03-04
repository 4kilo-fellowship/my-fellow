import CartBadge from "@/components/Marketplace/CartBadge";
import CartSheet from "@/components/Marketplace/CartSheet";
import ProductCard from "@/components/Marketplace/ProductCard";
import ProductSkeleton from "@/components/Marketplace/ProductSkeleton";
import { useTheme } from "@/context/ThemeContext";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { Product } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function MarketplaceScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [cartVisible, setCartVisible] = useState(false);

  const {
    products,
    loading,
    refreshing,
    hasMore,
    fetchProducts,
    loadMore,
    addToCart,
    error,
  } = useMarketplaceStore();

  useEffect(() => {
    fetchProducts(true);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const nameMatch = (p.name || p.title || "").toLowerCase().includes(q);
      const descMatch = (p.description || p.shortDescription || "")
        .toLowerCase()
        .includes(q);
      const catMatch = (p.category || "").toLowerCase().includes(q);
      return nameMatch || descMatch || catMatch;
    });
  }, [products, searchQuery]);

  const handleRefresh = useCallback(() => {
    fetchProducts(true);
  }, []);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product, 1);
      const displayName = product.name || product.title || "Product";
      Toast.show({
        type: "success",
        text1: "Added to Cart",
        text2: `${displayName} has been added.`,
        visibilityTime: 1500,
      });
    },
    [addToCart],
  );

  const renderFooter = () => {
    if (!hasMore || !loading || refreshing) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color="#ff6719" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 80,
        }}
      >
        <Ionicons
          name="storefront-outline"
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
          {searchQuery ? "No products found" : "No products available"}
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
          {searchQuery
            ? "Try a different search term"
            : "Check back later for new items"}
        </Text>
      </View>
    );
  };

  const renderSkeletons = () => (
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14 }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={{ width: "50%" }}>
          <ProductSkeleton isDark={isDark} />
        </View>
      ))}
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#1A1A1B" : "#f8f8f8",
      }}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={isDark ? "#1A1A1B" : "#f8f8f8"}
      />

      {/* Header */}
      <View
        style={{
          paddingTop: top + 10,
          paddingHorizontal: 20,
          paddingBottom: 12,
          backgroundColor: isDark ? "#1A1A1B" : "#f8f8f8",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: isDark ? "#27272a" : "#fff",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: isDark ? "#3f3f46" : "#e4e4e7",
            }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#fff" : "#18181b"}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "900",
              color: isDark ? "#fff" : "#18181b",
              letterSpacing: -0.3,
            }}
          >
            Fellowship Store
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/marketplace/orders" as any)}
            activeOpacity={0.8}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: isDark ? "#27272a" : "#fff",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: isDark ? "#3f3f46" : "#e4e4e7",
            }}
          >
            <Ionicons
              name="receipt-outline"
              size={20}
              color={isDark ? "#fff" : "#18181b"}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#27272a" : "#fff",
            borderRadius: 16,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: isDark ? "#3f3f46" : "#e4e4e7",
          }}
        >
          <Ionicons
            name="search"
            size={20}
            color={isDark ? "#71717a" : "#a1a1aa"}
          />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              paddingVertical: 14,
              paddingHorizontal: 10,
              fontSize: 15,
              fontWeight: "600",
              color: isDark ? "#fff" : "#18181b",
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={20}
                color={isDark ? "#71717a" : "#a1a1aa"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error State */}
      {error && !loading && products.length === 0 && (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 80,
            paddingHorizontal: 40,
          }}
        >
          <Ionicons name="cloud-offline-outline" size={64} color="#ef4444" />
          <Text
            style={{
              marginTop: 16,
              fontSize: 17,
              fontWeight: "700",
              color: isDark ? "#fff" : "#18181b",
              textAlign: "center",
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 13,
              color: isDark ? "#71717a" : "#a1a1aa",
              textAlign: "center",
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchProducts(true)}
            activeOpacity={0.85}
            style={{
              marginTop: 20,
              backgroundColor: "#ff6719",
              paddingHorizontal: 28,
              paddingVertical: 12,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product Grid */}
      {loading && products.length === 0 ? (
        renderSkeletons()
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingBottom: 100,
            paddingTop: 4,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              isDark={isDark}
              onPress={() => router.push(`/marketplace/${item.id}` as any)}
              onAddToCart={() => handleAddToCart(item)}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#ff6719"]}
              tintColor="#ff6719"
            />
          }
        />
      )}

      {/* Cart FAB */}
      <CartBadge isDark={isDark} onPress={() => setCartVisible(true)} />

      {/* Cart Sheet */}
      <CartSheet
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        isDark={isDark}
      />
    </View>
  );
}
