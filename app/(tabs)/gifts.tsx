import { MainTabHeader } from "@/components/MainTabHeader";
import ProductCard from "@/components/Marketplace/ProductCard";
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
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as z from "zod";

type DonationForm = z.infer<typeof donationSchema>;

const CATEGORIES = [
  { label: "All", value: "All" },
  { label: "New", value: "new" },
  { label: "T-shirt", value: "t-shirt" },
  { label: "Hoddy", value: "hoddy" },
  { label: "Stickers", value: "stickers" },
  { label: "Accessories", value: "accessories" },
  { label: "Others", value: "others" },
];

const Gifts = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [pendingDonationData, setPendingDonationData] =
    useState<DonationForm | null>(null);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const {
    products,
    loading: productsLoading,
    fetchProducts,
    selectedCategory,
    setSelectedCategory,
    addToCart,
  } = useMarketplaceStore();

  useEffect(() => {
    fetchProducts(true, 6); // Fetch only 6 for the preview
  }, []);

  const showInfoModal = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setInfoModal({ visible: true, title, message, type });
  };

  const { user } = useUserStore();
  const { txRef, setTxRef, totalGivingsAmount, fetchMyGivings } =
    usePaymentStore();

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
                        isDark ? "text-zinc-500" : "text-zinc-400"
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
                            borderWidth: 1,
                            borderColor: errors.amount
                              ? "#ef4444"
                              : isDark
                                ? "#27272a"
                                : "#e4e4e7",
                            backgroundColor: isDark ? "#18181b" : "#fafafa",
                          }}
                        >
                          <Ionicons
                            name="cash-outline"
                            size={20}
                            color={isDark ? "#71717a" : "#a1a1aa"}
                          />
                          <TextInput
                            style={{
                              flex: 1,
                              height: "100%",
                              fontSize: 17,
                              fontWeight: "700",
                              color: isDark ? "#ffffff" : "#09090b",
                              paddingVertical: 0,
                            }}
                            placeholder="0.00"
                            placeholderTextColor={
                              isDark ? "#52525b" : "#a1a1aa"
                            }
                            keyboardType="numeric"
                            onBlur={onBlur}
                            onChangeText={(text) => {
                              const num = parseFloat(text);
                              onChange(isNaN(num) ? 0 : num);
                            }}
                            value={value === 0 ? "" : value.toString()}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: isDark ? "#71717a" : "#a1a1aa",
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
                        isDark ? "text-zinc-500" : "text-zinc-400"
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
                            borderWidth: 1,
                            borderColor: errors.email
                              ? "#ef4444"
                              : isDark
                                ? "#27272a"
                                : "#e4e4e7",
                            backgroundColor: isDark ? "#18181b" : "#fafafa",
                          }}
                        >
                          <Ionicons
                            name="mail-outline"
                            size={20}
                            color={isDark ? "#71717a" : "#a1a1aa"}
                          />
                          <TextInput
                            style={{
                              flex: 1,
                              height: "100%",
                              fontSize: 15,
                              fontWeight: "500",
                              color: isDark ? "#ffffff" : "#09090b",
                              paddingVertical: 0,
                            }}
                            placeholder="Enter your email"
                            placeholderTextColor={
                              isDark ? "#52525b" : "#a1a1aa"
                            }
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            onBlur={onBlur}
                            onChangeText={onChange}
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
              <View className="px-5 mb-5 flex-row items-center justify-between">
                <Text
                  numberOfLines={1}
                  className={`text-lg font-extrabold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={{ includeFontPadding: false }}
                >
                  Fellowship Store
                </Text>
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    }
                    router.push("/marketplace" as any);
                  }}
                  unstable_pressDelay={0}
                  accessibilityRole="button"
                  accessibilityLabel="View all store items"
                  android_ripple={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.16)"
                      : "rgba(0, 0, 0, 0.1)",
                    borderless: false,
                    foreground: true,
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 9999,
                    overflow: "hidden",
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.05)",
                    borderWidth: 1,
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.05)",
                    opacity: Platform.OS === "ios" && pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: isDark ? "#e2e8f0" : "#334155",
                      includeFontPadding: false,
                    }}
                  >
                    View all
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={12}
                    color={isDark ? "#e2e8f0" : "#334155"}
                    style={{ marginLeft: 3 }}
                  />
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
                bounces={true}
                className="mb-2"
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  gap: 8,
                }}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <Pressable
                      key={cat.value}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        }
                        setSelectedCategory(cat.value);
                      }}
                      unstable_pressDelay={0}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      android_ripple={{
                        color: isSelected
                          ? "rgba(255, 255, 255, 0.28)"
                          : isDark
                            ? "rgba(255, 255, 255, 0.12)"
                            : "rgba(0, 0, 0, 0.08)",
                        borderless: false,
                        foreground: true,
                      }}
                      style={({ pressed }) => [
                        {
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          borderRadius: 9999,
                          overflow: "hidden",
                          borderWidth: 1,
                          opacity: Platform.OS === "ios" && pressed ? 0.8 : 1,
                          backgroundColor: isSelected
                            ? "#ff6719"
                            : isDark
                              ? "#18181b"
                              : "#ffffff",
                          borderColor: isSelected
                            ? "#ff6719"
                            : isDark
                              ? "#27272a"
                              : "#f4f4f5",
                        },
                      ]}
                    >
                      <View className="flex-row items-center gap-1.5">
                        <Text
                          className={`text-sm font-bold ${
                            isSelected
                              ? "text-white"
                              : isDark
                                ? "text-zinc-400"
                                : "text-zinc-600"
                          }`}
                        >
                          {cat.label}
                        </Text>
                        {cat.value === "new" && (
                          <View
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? "bg-white" : "bg-primary"
                            }`}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {productsLoading && products.length === 0 ? (
                <View className="py-6 items-center">
                  <ActivityIndicator color="#ff6719" />
                </View>
              ) : (
                <View className="px-3 flex-row flex-wrap">
                  {products
                    .filter((p) => {
                      if (selectedCategory === "All") return true;

                      const isRecentlyCreated = () => {
                        if (!p.createdAt) return false;
                        const createdDate = new Date(p.createdAt);
                        const now = new Date();
                        const diffTime = Math.abs(
                          now.getTime() - createdDate.getTime(),
                        );
                        const diffDays = Math.ceil(
                          diffTime / (1000 * 60 * 60 * 24),
                        );
                        return diffDays <= 7;
                      };

                      if (selectedCategory === "new") {
                        return p.isNew || isRecentlyCreated();
                      }

                      const cat = p.category?.toLowerCase() || "";
                      const mainCategories = [
                        "t-shirt",
                        "hoddy",
                        "stickers",
                        "accessories",
                      ];
                      if (selectedCategory === "others") {
                        return !mainCategories.includes(cat);
                      }
                      return cat === selectedCategory.toLowerCase();
                    })
                    .slice(0, 6)
                    .map((item) => (
                      <View key={item.id} style={{ width: "50%" }}>
                        <ProductCard
                          product={item}
                          isDark={isDark}
                          onPress={() =>
                            router.push(`/marketplace/${item.id}` as any)
                          }
                          onBuy={() => {
                            setSelectedProduct(item);
                            setBottomSheetVisible(true);
                          }}
                        />
                      </View>
                    ))}
                  {products.filter((p) => {
                    if (selectedCategory === "All") return true;

                    const isRecentlyCreated = () => {
                      if (!p.createdAt) return false;
                      const createdDate = new Date(p.createdAt);
                      const now = new Date();
                      const diffTime = Math.abs(
                        now.getTime() - createdDate.getTime(),
                      );
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24),
                      );
                      return diffDays <= 7;
                    };

                    if (selectedCategory === "new") {
                      return p.isNew || isRecentlyCreated();
                    }

                    const cat = p.category?.toLowerCase() || "";
                    const mainCategories = [
                      "t-shirt",
                      "hoddy",
                      "stickers",
                      "accessories",
                    ];
                    if (selectedCategory === "others") {
                      return !mainCategories.includes(cat);
                    }
                    return cat === selectedCategory.toLowerCase();
                  }).length === 0 && (
                    <View className="px-5 py-6 w-full">
                      <Text
                        className={`text-sm italic ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        No items found in this category.
                      </Text>
                    </View>
                  )}
                </View>
              )}
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

export default Gifts;
