import CartBadge from "@/components/Marketplace/CartBadge";
import CartSheet from "@/components/Marketplace/CartSheet";
import ProductCard from "@/components/Marketplace/ProductCard";
import ProductSkeleton from "@/components/Marketplace/ProductSkeleton";
import { InfoModal } from "@/components/Modals/InfoModal";
import { ProductBottomSheet } from "@/components/Modals/ProductBottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { Product } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  LayoutAnimation,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  { label: "All", value: "All" },
  { label: "New", value: "new" },
  { label: "T-shirt", value: "t-shirt" },
  { label: "Hoddy", value: "hoddy" },
  { label: "Stickers", value: "stickers" },
  { label: "Accessories", value: "accessories" },
  { label: "Others", value: "others" },
];

const MAIN_CATEGORIES = ["t-shirt", "hoddy", "stickers", "accessories"];

export default function MarketplaceScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  const [cartVisible, setCartVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const {
    products,
    loading,
    refreshing,
    hasMore,
    fetchProducts,
    loadMore,
    addToCart,
    error,
    selectedCategory,
    setSelectedCategory,
  } = useMarketplaceStore();

  const flatListRef = useRef<FlatList<Product>>(null);

  // Client-side category filter (matches gifts tab logic)
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;

    return products.filter((p) => {
      if (selectedCategory === "new") {
        if (p.isNew) return true;
        if (!p.createdAt) return false;
        const createdDate = new Date(p.createdAt);
        const now = new Date();
        const diffDays = Math.ceil(
          Math.abs(now.getTime() - createdDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return diffDays <= 7;
      }

      const cat = p.category?.toLowerCase() || "";
      if (selectedCategory === "others") {
        return !MAIN_CATEGORIES.includes(cat);
      }

      return cat === selectedCategory.toLowerCase();
    });
  }, [products, selectedCategory]);

  // Header Heights
  const STATIC_HEADER_HEIGHT = top + 64;
  const COLLAPSIBLE_SECTION_HEIGHT = 120; // Description + Categories
  const TOTAL_HEADER_HEIGHT = STATIC_HEADER_HEIGHT + COLLAPSIBLE_SECTION_HEIGHT;

  const scrollY = useRef(new Animated.Value(0)).current;

  const clampedScrollY = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolateLeft: "clamp",
  });

  const diffClamp = Animated.diffClamp(
    clampedScrollY,
    0,
    COLLAPSIBLE_SECTION_HEIGHT,
  );

  const translateY = diffClamp.interpolate({
    inputRange: [0, COLLAPSIBLE_SECTION_HEIGHT],
    outputRange: [0, -COLLAPSIBLE_SECTION_HEIGHT],
    extrapolate: "clamp",
  });

  useEffect(() => {
    fetchProducts(true);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  const handleOpenProductSheet = useCallback((product: Product) => {
    setSelectedProduct(product);
    setBottomSheetVisible(true);
  }, []);

  const handleAddToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      addToCart(product, quantity);
      const displayName = product.name || product.title || "Product";
      setInfoModal({
        visible: true,
        title: "Added to Cart",
        message: `${displayName} has been added to your cart.`,
        type: "success",
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
          No products available
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
          Check back later for new items
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
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Product Grid */}
      {loading && products.length === 0 ? (
        <View
          style={{
            flex: 1,
            paddingTop: TOTAL_HEADER_HEIGHT + 40,
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#ff6719" />
        </View>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          ListHeaderComponent={<View style={{ height: TOTAL_HEADER_HEIGHT }} />}
          contentContainerStyle={{
            paddingHorizontal: 8, // Matching gifts tab padding feel
            paddingBottom: 100,
            paddingTop: 4,
          }}
          columnWrapperStyle={{ paddingHorizontal: 4 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width: "50%" }}>
              <ProductCard
                product={item}
                isDark={isDark}
                onPress={() => router.push(`/marketplace/${item.id}` as any)}
                onBuy={() => handleOpenProductSheet(item)}
              />
            </View>
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
              progressViewOffset={TOTAL_HEADER_HEIGHT}
            />
          }
        />
      )}

      {/* Static Header */}
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
            Fellowship Store
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/marketplace/orders" as any)}
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full items-center justify-center ml-auto"
          >
            <Ionicons
              name="receipt-outline"
              size={22}
              color={isDark ? "white" : "#0f172a"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Collapsible Section: Description and Filters */}
      <Animated.View
        style={{
          position: "absolute",
          top: STATIC_HEADER_HEIGHT,
          left: 0,
          right: 0,
          zIndex: 5,
          height: COLLAPSIBLE_SECTION_HEIGHT,
          backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
          transform: [{ translateY }],
        }}
      >
        <Text
          numberOfLines={2}
          className={`text-base leading-6 pr-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          style={{ paddingHorizontal: 20 }}
        >
          Explore our exclusive collection of fellowship merchandise. Every
          purchase supports our community initiatives.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          bounces={true}
          className="mt-4"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 10,
          }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setSelectedCategory(cat.value);
                // Scroll to top when category changes
                flatListRef.current?.scrollToOffset({
                  offset: 0,
                  animated: true,
                });
              }}
              activeOpacity={0.7}
              className={`px-5 py-2 mr-3 rounded-xl border flex-row items-center h-[42px] ${
                selectedCategory === cat.value
                  ? "bg-orange-500 border-orange-500"
                  : isDark
                    ? "bg-[#1C1C1E] border-gray-800"
                    : "bg-white border-gray-200"
              }`}
            >
              <View className="flex-row items-center gap-1.5">
                <Text
                  className={`font-semibold ${
                    selectedCategory === cat.value
                      ? "text-white"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-600"
                  }`}
                >
                  {cat.label}
                </Text>
                {cat.value === "new" && (
                  <View
                    className={`ml-1 w-1.5 h-1.5 rounded-full ${
                      selectedCategory === "new" ? "bg-white" : "bg-[#ff6719]"
                    }`}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Cart FAB */}
      <CartBadge isDark={isDark} onPress={() => setCartVisible(true)} />

      {/* Cart Sheet */}
      <CartSheet
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        isDark={isDark}
      />

      <ProductBottomSheet
        visible={bottomSheetVisible}
        onClose={() => {
          setBottomSheetVisible(false);
          setSelectedProduct(null);
        }}
        isDark={isDark}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onBuyNow={(product, quantity) => {
          handleAddToCart(product, quantity);
          setCartVisible(true);
        }}
      />

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
