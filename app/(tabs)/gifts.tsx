import { MainTabHeader } from "@/components/MainTabHeader";
import { NativeViewAllButton } from "@/components/NativeViewAllButton";
import ProductCard from "@/components/Marketplace/ProductCard";
import ProductSkeleton from "@/components/Marketplace/ProductSkeleton";
import { InfoModal } from "@/components/Modals/InfoModal";
import { ProductBottomSheet } from "@/components/Modals/ProductBottomSheet";
import { ReasonModal } from "@/components/Modals/ReasonModal";
import { API_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { usePaymentStore } from "@/stores/payment.store";
import { useUserStore } from "@/stores/user.store";
import { Product } from "@/types/marketplace.types";
import { donationSchema } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { PRIMARY } from "@/constants/colors";
import { Route, TabBar, TabView } from "react-native-tab-view";
import * as z from "zod";

type DonationForm = z.infer<typeof donationSchema>;

interface CategoryRoute extends Route {
  key: string;
  title: string;
  value: string;
}

const CATEGORIES: CategoryRoute[] = [
  { key: "all", title: "All", value: "All" },
  { key: "new", title: "New", value: "new" },
  { key: "t-shirt", title: "T-Shirts", value: "t-shirt" },
  { key: "hoodie", title: "Hoodies", value: "hoodie" },
  { key: "stickers", title: "Stickers", value: "stickers" },
  { key: "accessories", title: "Accessories", value: "accessories" },
  { key: "others", title: "Others", value: "others" },
];

const Gifts = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDonationData, setPendingDonationData] =
    useState<DonationForm | null>(null);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const { width: screenWidth } = useWindowDimensions();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const {
    products,
    loading: productsLoading,
    fetchProducts,
    setSelectedCategory,
    addToCart,
  } = useMarketplaceStore();

  useEffect(() => {
    setSelectedCategory("All");
    fetchProducts(true, 50, "All");
  }, [fetchProducts, setSelectedCategory]);

  const categoryProductsMap = useMemo(() => {
    return CATEGORIES.reduce<
      Record<
        string,
        { cat: CategoryRoute; items: Product[]; totalCount: number }
      >
    >((acc, cat) => {
      const filtered = products.filter((p) => {
        if (cat.value === "All") return true;

        const isRecentlyCreated = () => {
          if (!p.createdAt) return false;
          const createdDate = new Date(p.createdAt);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - createdDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        };

        if (cat.value === "new") {
          return p.isNew || isRecentlyCreated();
        }

        const pCat = p.category?.toLowerCase().trim() || "";
        const mainCategories = [
          "t-shirt",
          "t-shirts",
          "tshirt",
          "tshirts",
          "shirt",
          "hoodie",
          "hoodies",
          "hoddy",
          "sweatshirt",
          "stickers",
          "sticker",
          "accessories",
          "accessory",
        ];

        if (cat.value === "others") {
          return !mainCategories.includes(pCat);
        }

        if (cat.value === "t-shirt") {
          return (
            pCat === "t-shirt" ||
            pCat === "t-shirts" ||
            pCat === "tshirt" ||
            pCat === "tshirts" ||
            pCat === "shirt"
          );
        }

        if (cat.value === "hoodie") {
          return (
            pCat === "hoodie" ||
            pCat === "hoodies" ||
            pCat === "hoddy" ||
            pCat === "sweatshirt"
          );
        }

        if (cat.value === "stickers") {
          return pCat === "stickers" || pCat === "sticker";
        }

        if (cat.value === "accessories") {
          return pCat === "accessories" || pCat === "accessory";
        }

        return pCat === cat.value.toLowerCase();
      });

      acc[cat.key] = {
        cat,
        items: filtered.slice(0, 4),
        totalCount: filtered.length,
      };
      return acc;
    }, {});
  }, [products]);

  const activeRouteKey = CATEGORIES[activeCategoryIndex]?.key || "all";
  const activeCategoryData = categoryProductsMap[activeRouteKey];
  const activeItemsCount = activeCategoryData?.items.length ?? 0;
  const storeTabViewHeight =
    productsLoading && products.length === 0
      ? 580
      : activeItemsCount === 0
      ? 280
      : activeItemsCount <= 2
      ? 340
      : 580;

  const { user } = useUserStore();
  const { txRef, setTxRef, totalGivingsAmount, fetchMyGivings } =
    usePaymentStore();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchMyGivings(),
        fetchProducts(true, 50, "All"),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchMyGivings, fetchProducts]);

  const handleTabChange = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (Platform.OS === "ios" || Platform.OS === "android") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setActiveCategoryIndex(index);
  };

  const showInfoModal = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setInfoModal({ visible: true, title, message, type });
  };

  useEffect(() => {
    fetchMyGivings();
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 0,
      email: user?.email || "",
    },
  });

  const selectedAmount = watch("amount");

  useEffect(() => {
    const loadSavedEmailAndAmount = async () => {
      const savedEmail = await AsyncStorage.getItem("last_donation_email");
      if (savedEmail) {
        setValue("email", savedEmail);
      } else if (user?.email) {
        setValue("email", user.email);
      }

      const savedAmount = await AsyncStorage.getItem("last_donation_amount");
      if (savedAmount) {
        const parsed = parseFloat(savedAmount);
        if (!isNaN(parsed) && parsed > 0) {
          setValue("amount", parsed);
        }
      }
    };
    loadSavedEmailAndAmount();
  }, [user, setValue]);

  // Handle deep linking for payment return
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { path, queryParams } = Linking.parse(event.url);
      if (path === "payment-status" || event.url.includes("payment-status")) {
        WebBrowser.dismissBrowser();
        const refToVerify =
          (typeof queryParams?.sessionId === "string" &&
            queryParams.sessionId) ||
          txRef;
        if (refToVerify) {
          verifyPayment(refToVerify);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [txRef]);

  const verifyPayment = async (ref: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/payments/jami/verify/${ref}`);
      const data = response.data.data || response.data;
      const status = data?.status || response.data.status;
      if (status === "success" || status === "completed") {
        showInfoModal(
          "Payment Successful",
          "Thank you for your generous gift to the fellowship!",
          "success",
        );
        fetchMyGivings();
      } else {
        const failureMsg =
          data?.failure?.message ||
          "The payment was not completed or was cancelled. Please try again.";
        showInfoModal("Payment Incomplete", failureMsg, "error");
      }
    } catch (error) {
      showInfoModal(
        "Verification Error",
        "Could not confirm payment status with the server.",
        "error",
      );
    } finally {
      setLoading(false);
      setTxRef(null);
    }
  };

  const onGivePress = (data: DonationForm) => {
    if (!user) {
      router.push("/(auth)/sign-in" as any);
      return;
    }

    if (!data.email) {
      showInfoModal(
        "Missing Information",
        "Please provide a valid email address for the receipt.",
      );
      return;
    }

    setPendingDonationData(data);
    setReasonModalVisible(true);
  };

  const handleInitializePayment = async (reason: string) => {
    if (!pendingDonationData) return;
    const data = pendingDonationData;

    setReasonModalVisible(false);
    setLoading(true);

    try {
      const payload = {
        amount: data.amount,
        email: data.email.trim(),
        phone: user?.phoneNumber,
        reason: reason,
        returnUrl: `${API_URL}/payments/success`,
      };

      const response = await api.post("/payments/jami/init", payload);
      const checkout_url =
        response.data.data?.checkout_url ||
        response.data.data?.checkoutUrl ||
        response.data.checkout_url;
      const sessionOrRef =
        response.data.data?.sessionId ||
        response.data.sessionId ||
        response.data.data?.tx_ref ||
        response.data.tx_ref;

      if (!checkout_url) {
        throw new Error("Invalid checkout URL received from server");
      }

      setTxRef(sessionOrRef);

      // Persist email and amount for future use
      if (data.email) {
        await AsyncStorage.setItem("last_donation_email", data.email);
      }
      if (data.amount) {
        await AsyncStorage.setItem("last_donation_amount", String(data.amount));
      }

      // openAuthSessionAsync catches redirect back to my-fellow://payment-status and auto-dismisses
      await WebBrowser.openAuthSessionAsync(
        checkout_url,
        "my-fellow://payment-status",
      );

      // Verify payment when browser session finishes or redirects
      if (sessionOrRef) {
        await verifyPayment(sessionOrRef);
      }
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      showInfoModal(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to start payment process.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStoreScene = ({ route }: { route: CategoryRoute }) => {
    if (productsLoading && products.length === 0) {
      return (
        <View style={styles.storeGridContainer}>
          {[1, 2, 3, 4].map((key) => (
            <View key={key} style={styles.storeGridItem}>
              <ProductSkeleton isDark={isDark} />
            </View>
          ))}
        </View>
      );
    }

    const data = categoryProductsMap[route.key];
    const items = data?.items || [];
    const cat = data?.cat || route;

    if (items.length === 0) {
      return (
        <View style={styles.storeEmptyContainer}>
          <View
            style={[
              styles.storeEmptyIconWrap,
              { backgroundColor: isDark ? "#27272a" : "#fff7ed" },
            ]}
          >
            <Ionicons
              name={
                cat.value === "t-shirt"
                  ? "shirt-outline"
                  : cat.value === "stickers"
                  ? "pricetag-outline"
                  : "bag-handle-outline"
              }
              size={26}
              color={PRIMARY}
            />
          </View>
          <Text
            style={[
              styles.storeEmptyTitle,
              { color: isDark ? "#f4f4f5" : "#18181b" },
            ]}
          >
            No {cat.title} available yet
          </Text>
          <Text
            style={[
              styles.storeEmptySubtitle,
              { color: isDark ? "#71767b" : "#71717a" },
            ]}
          >
            New fellowship items are added regularly. Check back soon!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.storeGridContainer}>
        {items.map((item) => (
          <View key={item.id} style={styles.storeGridItem}>
            <ProductCard
              product={item}
              isDark={isDark}
              onPress={() => router.push(`/marketplace/${item.id}` as any)}
              onBuy={() => {
                setSelectedProduct(item);
                setBottomSheetVisible(true);
              }}
            />
          </View>
        ))}
      </View>
    );
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      scrollEnabled
      bounces={true}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      tabStyle={styles.storeTabItem}
      indicatorStyle={styles.storeTabIndicator}
      style={[
        styles.storeTabBar,
        {
          backgroundColor: isDark ? "#1A1A1B" : "#ffffff",
          borderBottomColor: isDark ? "#27272a" : "#eff3f4",
        },
      ]}
      activeColor={PRIMARY}
      inactiveColor={isDark ? "#71767b" : "#71717a"}
      pressColor={
        isDark ? "rgba(255, 103, 25, 0.12)" : "rgba(255, 103, 25, 0.08)"
      }
      renderLabel={({ route, focused, color }: any) => (
        <View style={styles.storeTabLabelRow}>
          <Text
            style={[
              styles.storeTabLabelText,
              {
                color,
                fontWeight: focused ? "700" : "600",
              },
            ]}
          >
            {route.title}
          </Text>
          {route.key === "new" && (
            <View
              style={[
                styles.storeTabNewDot,
                { backgroundColor: PRIMARY },
              ]}
            />
          )}
        </View>
      )}
    />
  );

  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-background"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <MainTabHeader borderBottom={true} title="Gifts" />

        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 140 }}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={PRIMARY}
                colors={[PRIMARY]}
              />
            }
          >
            {/* donation header section */}
            <View className="px-5 mb-10 pt-4 items-center">
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="hand-left-outline"
                  size={80}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                  style={{ marginRight: -10 }}
                />
                <Ionicons
                  name="hand-right-outline"
                  size={80}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                  style={{ marginLeft: -10 }}
                />
              </View>
              <View className="h-4" />
              <Text
                className={`text-center leading-8 text-[17px] font-medium px-4 tracking-wide ${isDark ? "text-zinc-400 italic" : "text-zinc-600 italic"}`}
              >
                “እግዚአብሔር በደስታ የሚሰጠውን ይወዳልና እያንዳንዱ በልቡ እንዳሰበ ይስጥ፥ በኀዘን ወይም በግድ
                አይደለም።”
              </Text>
              <View className="h-[2px] w-12 bg-zinc-200 dark:bg-zinc-800 my-6 rounded-full" />
              <Text className="text-zinc-400 font-bold text-xs tracking-widest">
                2ኛ ቆሮንቶስ 9፥7
              </Text>
            </View>

            {/* Total Givings Native Button */}
            <View
              style={{
                marginHorizontal: 16,
                marginBottom: 24,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDark ? "#27272a" : "#e4e4e7",
                backgroundColor: isDark ? "rgba(24, 24, 27, 0.7)" : "#ffffff",
                overflow: "hidden",
              }}
            >
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Light,
                    ).catch(() => {});
                  }
                  router.push("/givings" as any);
                }}
                unstable_pressDelay={0}
                accessibilityRole="button"
                accessibilityLabel="View your total givings"
                android_ripple={{
                  color: isDark
                    ? "rgba(255, 255, 255, 0.14)"
                    : "rgba(0, 0, 0, 0.08)",
                  borderless: false,
                  foreground: true,
                }}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      width: "100%",
                      minHeight: 84,
                      paddingVertical: 20,
                      paddingHorizontal: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      opacity: Platform.OS === "ios" && pressed ? 0.7 : 1,
                    }}
                  >
                    <Ionicons name="gift" size={28} color="#ff6719" />
                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        Your Total Givings
                      </Text>
                      <Text
                        className={`text-2xl font-black ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        {totalGivingsAmount.toLocaleString()} ETB
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={isDark ? "#a1a1aa" : "#71717a"}
                    />
                  </View>
                )}
              </Pressable>
            </View>

            {/* gifts section */}
            <View className="px-5 mb-12">
              <View>
                {/* form  */}
                <View className="gap-5">
                  <View>
                    <Text
                      className={`text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Amount to Give (ETB)
                    </Text>
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            height: 54,
                            paddingHorizontal: 16,
                            gap: 10,
                            borderRadius: 16,
                            borderWidth: isAmountFocused ? 1.5 : 1,
                            borderColor: errors.amount
                              ? "#ef4444"
                              : isAmountFocused
                                ? PRIMARY
                                : isDark
                                  ? "#27272a"
                                  : "#e4e4e7",
                            backgroundColor: isDark ? "#18181b" : "#fafafa",
                          }}
                        >
                          <Ionicons
                            name="cash-outline"
                            size={20}
                            color={
                              errors.amount
                                ? "#ef4444"
                                : isAmountFocused
                                  ? PRIMARY
                                  : isDark
                                    ? "#71717a"
                                    : "#a1a1aa"
                            }
                          />
                          <TextInput
                            style={{
                              flex: 1,
                              height: "100%",
                              fontSize: 17,
                              fontWeight: "700",
                              color: isDark ? "#ffffff" : "#000000",
                              paddingVertical: 0,
                            }}
                            placeholder="0.00"
                            placeholderTextColor={
                              isDark ? "#52525b" : "#a1a1aa"
                            }
                            selectionColor={PRIMARY}
                            keyboardType="numeric"
                            onFocus={() => setIsAmountFocused(true)}
                            onBlur={() => {
                              setIsAmountFocused(false);
                              onBlur();
                              if (value) {
                                AsyncStorage.setItem(
                                  "last_donation_amount",
                                  String(value),
                                ).catch(() => {});
                              }
                            }}
                            onChangeText={(text) => {
                              const num = parseFloat(text);
                              const finalVal = isNaN(num) ? 0 : num;
                              onChange(finalVal);
                              if (text) {
                                AsyncStorage.setItem(
                                  "last_donation_amount",
                                  text,
                                ).catch(() => {});
                              }
                            }}
                            value={value === 0 ? "" : value.toString()}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: isAmountFocused
                                ? PRIMARY
                                : isDark
                                  ? "#71717a"
                                  : "#a1a1aa",
                            }}
                          >
                            ETB
                          </Text>
                        </View>
                      )}
                    />
                    {errors.amount && (
                      <Text className="text-red-500 text-xs mt-1.5 ml-2 font-bold">
                        {errors.amount.message}
                      </Text>
                    )}
                  </View>

                  <View>
                    <Text
                      className={`text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Confirmation Email
                    </Text>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            height: 54,
                            paddingHorizontal: 16,
                            gap: 10,
                            borderRadius: 16,
                            borderWidth: isEmailFocused ? 1.5 : 1,
                            borderColor: errors.email
                              ? "#ef4444"
                              : isEmailFocused
                                ? PRIMARY
                                : isDark
                                  ? "#27272a"
                                  : "#e4e4e7",
                            backgroundColor: isDark ? "#18181b" : "#fafafa",
                          }}
                        >
                          <Ionicons
                            name="mail-outline"
                            size={20}
                            color={
                              errors.email
                                ? "#ef4444"
                                : isEmailFocused
                                  ? PRIMARY
                                  : isDark
                                    ? "#71717a"
                                    : "#a1a1aa"
                            }
                          />
                          <TextInput
                            style={{
                              flex: 1,
                              height: "100%",
                              fontSize: 15,
                              fontWeight: "500",
                              color: isDark ? "#ffffff" : "#000000",
                              paddingVertical: 0,
                            }}
                            placeholder="Enter your email"
                            placeholderTextColor={
                              isDark ? "#52525b" : "#a1a1aa"
                            }
                            selectionColor={PRIMARY}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            onFocus={() => setIsEmailFocused(true)}
                            onBlur={() => {
                              setIsEmailFocused(false);
                              onBlur();
                              if (value) {
                                AsyncStorage.setItem(
                                  "last_donation_email",
                                  value,
                                ).catch(() => {});
                              }
                            }}
                            onChangeText={(text) => {
                              onChange(text);
                              if (text) {
                                AsyncStorage.setItem(
                                  "last_donation_email",
                                  text,
                                ).catch(() => {});
                              }
                            }}
                            value={value}
                          />
                        </View>
                      )}
                    />
                    {errors.email && (
                      <Text className="text-red-500 text-xs mt-1.5 ml-2 font-bold">
                        {errors.email.message}
                      </Text>
                    )}
                  </View>
                </View>

                <View
                  style={{
                    width: "100%",
                    borderRadius: 9999,
                    overflow: "hidden",
                    marginTop: 32,
                    backgroundColor: loading ? "#a1a1aa" : "#ff6719",
                  }}
                >
                  <Pressable
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light,
                        ).catch(() => {});
                      }
                      handleSubmit(onGivePress)();
                    }}
                    disabled={loading}
                    unstable_pressDelay={0}
                    accessibilityRole="button"
                    accessibilityLabel={`Give ${selectedAmount || 0} ETB`}
                    android_ripple={
                      !loading
                        ? {
                            color: "rgba(255, 255, 255, 0.28)",
                            borderless: false,
                            foreground: true,
                          }
                        : undefined
                    }
                  >
                    {({ pressed }) => (
                      <View
                        style={{
                          width: "100%",
                          height: 56,
                          paddingHorizontal: 24,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          opacity:
                            Platform.OS === "ios" && pressed && !loading
                              ? 0.8
                              : 1,
                        }}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <Text
                              style={{
                                color: "#ffffff",
                                fontWeight: "700",
                                fontSize: 17,
                              }}
                            >
                              Give {selectedAmount || 0} ETB
                            </Text>
                            <Ionicons
                              name="arrow-forward"
                              size={20}
                              color="#fff"
                            />
                          </>
                        )}
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

            {/* FELLOWSHIP STORE SECTION */}
            <View className="mb-12">
              <View className="px-5 mb-3 flex-row items-center justify-between">
                <Text
                  numberOfLines={1}
                  className={`text-lg font-extrabold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{ includeFontPadding: false, flexShrink: 1, marginRight: 8 }}
                >
                  Fellowship Store
                </Text>
                <NativeViewAllButton
                  onPress={() => router.push("/marketplace" as any)}
                  isDark={isDark}
                  accessibilityLabel="View all store items"
                />
              </View>

              <TabView
                navigationState={{
                  index: activeCategoryIndex,
                  routes: CATEGORIES,
                }}
                renderScene={renderStoreScene}
                onIndexChange={handleTabChange}
                initialLayout={{ width: screenWidth }}
                lazy
                lazyPreloadDistance={1}
                renderTabBar={renderTabBar}
                style={{
                  height: storeTabViewHeight,
                  minHeight: storeTabViewHeight,
                }}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
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
        onAddToCart={(product, quantity) => {
          addToCart(product, quantity);
          showInfoModal(
            "Added to Cart",
            `${product.name || product.title} × ${quantity} added.`,
            "success",
          );
        }}
        onBuyNow={(product, quantity) => {
          addToCart(product, quantity);
          router.push("/marketplace" as any);
        }}
      />
      <ReasonModal
        visible={reasonModalVisible}
        onClose={() => setReasonModalVisible(false)}
        onSubmit={handleInitializePayment}
        isDark={isDark}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  storeTabBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowOpacity: 0,
    marginBottom: 8,
  },
  storeTabItem: {
    width: "auto",
    minWidth: 64,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  storeTabIndicator: {
    backgroundColor: PRIMARY,
    height: 3,
    borderRadius: 1.5,
  },
  storeTabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  storeTabLabelText: {
    fontSize: 14,
    letterSpacing: -0.2,
    textTransform: "none",
  },
  storeTabNewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  storeGridContainer: {
    paddingHorizontal: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  storeGridItem: {
    width: "50%",
  },
  storeEmptyContainer: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  storeEmptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  storeEmptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  storeEmptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 220,
    lineHeight: 18,
  },
});

export default Gifts;
