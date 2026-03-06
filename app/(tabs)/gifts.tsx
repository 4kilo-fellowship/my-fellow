import ProductCard from "@/components/Marketplace/ProductCard";
import { InfoModal } from "@/components/Modals/InfoModal";
import { ProductBottomSheet } from "@/components/Modals/ProductBottomSheet";
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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  const { txRef, setTxRef } = usePaymentStore();

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
    const loadSavedEmail = async () => {
      const savedEmail = await AsyncStorage.getItem("last_donation_email");
      if (savedEmail) {
        setValue("email", savedEmail);
      } else if (user?.email) {
        setValue("email", user.email);
      }
    };
    loadSavedEmail();
  }, [user, setValue]);

  // Handle deep linking for payment return
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { path } = Linking.parse(event.url);
      if (path === "payment-status" || event.url.includes("payment-status")) {
        WebBrowser.dismissBrowser();
        if (txRef) {
          verifyPayment(txRef);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [txRef]);

  const verifyPayment = async (ref: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/payments/chapa/verify/${ref}`);
      const status = response.data.status || response.data.data?.status;
      if (status === "success" || status === "completed") {
        showInfoModal(
          "Payment Successful",
          "Thank you for your donation!",
          "success",
        );
      } else {
        showInfoModal("Payment Failed", "Please try again.", "error");
      }
    } catch (error) {
      showInfoModal(
        "Verification Error",
        "Could not confirm payment status.",
        "error",
      );
    } finally {
      setLoading(false);
      setTxRef(null);
    }
  };

  const handleInitializePayment = async (data: DonationForm) => {
    if (!user) {
      router.push("/(auth)/sign-in" as any);
      return;
    }

    // Check for required Chapa fields if not provided
    if (!data.email) {
      showInfoModal(
        "Missing Information",
        "Please provide a valid email address for the receipt.",
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        email: data.email.trim(), // Sanitize input
        fullName: user.fullName || "Member",
        phoneNumber: user.phoneNumber || "0900000000",
        reason: "Donation",
      };

      const response = await api.post("/payments/chapa/init", payload);
      const checkout_url =
        response.data.checkout_url || response.data.data?.checkout_url;
      const tx_ref = response.data.tx_ref || response.data.data?.tx_ref;

      if (!checkout_url) {
        throw new Error("Invalid checkout URL received from server");
      }

      setTxRef(tx_ref);

      // Persist email for future use since it's not in the account
      if (data.email) {
        await AsyncStorage.setItem("last_donation_email", data.email);
      }

      await WebBrowser.openBrowserAsync(checkout_url);
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      showInfoModal(
        "Error",
        error.message ||
          error.response?.data?.message ||
          "Failed to start payment process.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-background"}`}>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={isDark ? "#1A1A1B" : "#fff"}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={{ flex: 1, paddingTop: top + 10 }}>
          {/* header section */}
          <View className="px-5 mb-4">
            <Text
              className={`text-4xl font-extrabold ${isDark ? "text-white" : "text-black"}`}
            >
              Gifts
            </Text>
          </View>

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

            {/* gifts section */}
            <View className="px-5 mb-12">
              <View>
                {/* form  */}
                <View className="gap-8">
                  <View>
                    <Text
                      className={`text-[11px] font-black uppercase tracking-widest mb-3 ml-1 ${
                        isDark ? "text-zinc-500" : "text-zinc-400"
                      }`}
                    >
                      Amount to Give (ETB)
                    </Text>
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View className="relative">
                          <TextInput
                            className={`px-6 py-5 rounded-[24px] border-[1.5px] text-2xl font-black ${
                              isDark
                                ? "bg-zinc-900 border-zinc-800 text-white"
                                : "bg-zinc-50 border-zinc-200 text-black"
                            } ${errors.amount ? "border-red-500" : ""}`}
                            placeholder="0.00 Birr"
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
                          <View className="absolute right-6 top-5">
                            <Ionicons
                              name="cash-outline"
                              size={28}
                              color="#ff6719"
                            />
                          </View>
                        </View>
                      )}
                    />
                    {errors.amount && (
                      <Text className="text-red-500 text-xs mt-2 ml-2 font-bold">
                        {errors.amount.message}
                      </Text>
                    )}
                  </View>

                  <View>
                    <Text
                      className={`text-[11px] font-black uppercase tracking-widest mb-3 ml-1 ${
                        isDark ? "text-zinc-500" : "text-zinc-400"
                      }`}
                    >
                      Confirmation Email
                    </Text>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          className={`px-6 py-5 rounded-[24px] border-[1.5px] font-bold ${
                            isDark
                              ? "bg-zinc-900 border-zinc-800 text-white"
                              : "bg-zinc-50 border-zinc-200 text-black"
                          } ${errors.email ? "border-red-500" : ""}`}
                          placeholder="natnaletamiru98@gmail.com"
                          placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          defaultValue={user?.email || ""}
                          value={value}
                        />
                      )}
                    />
                    {errors.email && (
                      <Text className="text-red-500 text-xs mt-2 ml-2 font-bold">
                        {errors.email.message}
                      </Text>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit((data) =>
                    handleInitializePayment(data),
                  )}
                  disabled={loading}
                  activeOpacity={0.9}
                  className={`mt-12 py-5 rounded-3xl flex-row items-center justify-center ${
                    loading ? "bg-zinc-400" : "bg-primary"
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text className="text-white font-black text-xl mr-3">
                        Give {selectedAmount || 0} ETB
                      </Text>
                      <Ionicons
                        name="arrow-forward-circle"
                        size={28}
                        color="#fff"
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* FELLOWSHIP STORE SECTION */}
            <View className="mb-12">
              <View className="px-5 mb-5 flex-row items-end justify-between">
                <Text
                  className={`text-[22px] font-black tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}
                >
                  Fellowship Store
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/marketplace" as any)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-0.5 pb-1"
                >
                  <Text className="text-sm font-bold text-[#ff6719]">
                    View All
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#ff6719" />
                </TouchableOpacity>
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
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    onPress={() => setSelectedCategory(cat.value)}
                    activeOpacity={0.8}
                    className={`px-5 py-2.5 rounded-full border ${
                      selectedCategory === cat.value
                        ? "bg-[#ff6719] border-[#ff6719]"
                        : isDark
                          ? "bg-zinc-900 border-zinc-800"
                          : "bg-white border-zinc-100"
                    }`}
                  >
                    <View className="flex-row items-center gap-1.5">
                      <Text
                        className={`text-sm font-bold ${
                          selectedCategory === cat.value
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
                            selectedCategory === "new"
                              ? "bg-white"
                              : "bg-primary"
                          }`}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
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
    </View>
  );
};

export default Gifts;
