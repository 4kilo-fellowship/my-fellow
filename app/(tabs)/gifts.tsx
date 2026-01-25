import GiftCard from "@/components/GiftCard";
import { GIFT_ITEMS } from "@/constants/gifts";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { usePaymentStore } from "@/stores/payment.store";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as z from "zod";

const donationSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  amount: z.number().min(1, "Amount must be greater than 0"),
});

type DonationForm = z.infer<typeof donationSchema>;

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 10000];

const Gifts = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      phoneNumber: user?.phoneNumber || "",
    },
  });

  const selectedAmount = watch("amount");

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login" as any);
    }
  }, [user]);

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
        Toast.show({
          type: "success",
          text1: "Payment Successful",
          text2: "Thank you for your donation!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Payment Failed",
          text2: "Please try again.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Verification Error",
        text2: "Could not confirm payment status.",
      });
    } finally {
      setLoading(false);
      setTxRef(null);
    }
  };

  const handleInitializePayment = async (data: DonationForm) => {
    if (!user) return;

    setLoading(true);
    try {
      const payload = {
        ...data,
        fullName: user.fullName,
        reason: "Donation",
      };

      const response = await api.post("/payments/chapa/init", payload);
      // Robust check for checkout_url in both root and nested data object
      const checkout_url =
        response.data.checkout_url || response.data.data?.checkout_url;
      const tx_ref = response.data.tx_ref || response.data.data?.tx_ref;

      if (!checkout_url) {
        throw new Error("Invalid checkout URL received from server");
      }

      setTxRef(tx_ref);
      await WebBrowser.openBrowserAsync(checkout_url);
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      Alert.alert(
        "Error",
        error.message ||
          error.response?.data?.message ||
          "Failed to start payment process.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: top + 10, paddingBottom: 100 }}
      >
        {/* HEADER */}
        <View className="px-5 mb-6">
          <Text
            className={`text-4xl font-extrabold ${isDark ? "text-white" : "text-black"}`}
          >
            Gifts
          </Text>
        </View>

        {/* SPIRUTAL HEADER SECTION */}
        <View className="px-5 mb-8">
          <LinearGradient
            colors={isDark ? ["#2d2d2d", "#1a1a1b"] : ["#fff8f0", "#fff"]}
            className="p-8 rounded-[40px] items-center overflow-hidden border border-primary/10 shadow-xl"
          >
            <View className="bg-primary/10 p-5 rounded-full mb-6">
              <Ionicons name="sunny" size={80} color="#ff6719" />
            </View>
            <Text
              className={`text-xl font-bold mb-4 ${isDark ? "text-primary" : "text-primary"}`}
            >
              Pledge — Give to God
            </Text>
            <Text
              className={`text-center leading-7 font-medium px-2 ${isDark ? "text-zinc-300 italic" : "text-zinc-600 italic"}`}
            >
              “እግዚአብሔር በደስታ የሚሰጠውን ይወዳልና እያንዳንዱ በልቡ እንዳሰበ ይስጥ፥ በኀዘን ወይም በግድ
              አይደለም።”
            </Text>
            <View className="h-[2px] w-20 bg-primary/20 my-4 rounded-full" />
            <Text className="text-zinc-400 font-bold text-xs">
              2ኛ ቆሮንቶስ 9፥7
            </Text>
          </LinearGradient>
        </View>

        {/* DONATION SECTION (Eye-catching UI, Moved Up) */}
        <View className="px-5 mb-10">
          <View
            className={`p-8 rounded-[32px] shadow-2xl ${
              isDark ? "bg-[#262626]" : "bg-white border border-zinc-50"
            }`}
          >
            <View className="flex-row items-center mb-6">
              <View className="bg-primary/10 p-3 rounded-2xl mr-4">
                <Ionicons name="heart" size={24} color="#ff6719" />
              </View>
              <Text
                className={`text-2xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                Support Mission
              </Text>
            </View>

            {/* Preset Amounts */}
            <View className="flex-row flex-wrap gap-3 mb-8">
              {PRESET_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setValue("amount", amt)}
                  className={`px-5 py-3 rounded-2xl border-2 transition-all ${
                    selectedAmount === amt
                      ? "bg-primary border-primary scale-105"
                      : isDark
                        ? "bg-zinc-800 border-zinc-700"
                        : "bg-zinc-50 border-zinc-100"
                  }`}
                >
                  <Text
                    className={`font-black text-base ${
                      selectedAmount === amt
                        ? "text-white"
                        : isDark
                          ? "text-zinc-400"
                          : "text-zinc-600"
                    }`}
                  >
                    {amt} ETB
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form Fields Improvements */}
            <View className="gap-6">
              <View>
                <Text
                  className={`text-[10px] font-black uppercase tracking-widest mb-3 ml-1 ${
                    isDark ? "text-primary" : "text-primary"
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
                        className={`px-6 py-4 rounded-3xl border-2 text-2xl font-black ${
                          isDark
                            ? "bg-zinc-800 border-zinc-700 text-white"
                            : "bg-zinc-50 border-zinc-100 text-black"
                        } ${errors.amount ? "border-red-500" : ""}`}
                        placeholder="0.00"
                        placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                        keyboardType="numeric"
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          const num = parseFloat(text);
                          onChange(isNaN(num) ? 0 : num);
                        }}
                        value={value === 0 ? "" : value.toString()}
                      />
                      <View className="absolute right-6 top-4">
                        <Ionicons
                          name="cash-outline"
                          size={24}
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
                  className={`text-[10px] font-black uppercase tracking-widest mb-3 ml-1 ${
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
                      className={`px-6 py-4 rounded-3xl border-2 font-bold ${
                        isDark
                          ? "bg-zinc-800 border-zinc-700 text-white"
                          : "bg-zinc-50 border-zinc-100 text-black"
                      } ${errors.email ? "border-red-500" : ""}`}
                      placeholder="email@example.com"
                      placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
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

              <View>
                <Text
                  className={`text-[10px] font-black uppercase tracking-widest mb-3 ml-1 ${
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  Phone Number
                </Text>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`px-6 py-4 rounded-3xl border-2 font-bold ${
                        isDark
                          ? "bg-zinc-800 border-zinc-700 text-white"
                          : "bg-zinc-50 border-zinc-100 text-black"
                      } ${errors.phoneNumber ? "border-red-500" : ""}`}
                      placeholder="09..."
                      placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <Text className="text-red-500 text-xs mt-2 ml-2 font-bold">
                    {errors.phoneNumber.message}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit(handleInitializePayment)}
              disabled={loading}
              activeOpacity={0.9}
              className={`mt-10 py-5 rounded-3xl flex-row items-center justify-center shadow-xl ${
                loading ? "bg-zinc-400" : "bg-primary shadow-primary/40"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-black text-xl mr-3">
                    Donate {selectedAmount || 0} ETB
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

        {/* FELLOWSHIP STORE SECTION (Moved Down, Larger Cards) */}
        <View className="mb-12">
          <View className="px-5 mb-6 flex-row justify-between items-center">
            <Text
              className={`text-2xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}
            >
              Fellowship Store
            </Text>
          </View>

          <FlatList
            data={GIFT_ITEMS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item }) => (
              <GiftCard
                item={item}
                isDark={isDark}
                onPress={() => {}} // Still "Coming Soon" toast
              />
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Gifts;
