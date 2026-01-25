import GiftCard from "@/components/GiftCard";
import { GIFT_ITEMS } from "@/constants/gifts";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { usePaymentStore } from "@/stores/payment.store";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
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
  KeyboardAvoidingView,
  Platform,
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
      if (
        response.data.status === "success" ||
        response.data.data?.status === "success"
      ) {
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
        fullName: user.fullName, // Auto-fill from store
        reason: "Donation",
      };

      const response = await api.post("/payments/chapa/init", payload);
      const { checkout_url, tx_ref } = response.data;

      if (!checkout_url) {
        throw new Error("Invalid checkout URL received from server");
      }

      setTxRef(tx_ref);
      await WebBrowser.openBrowserAsync(checkout_url);
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to start payment process.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: top + 10, paddingBottom: 100 }}
        >
          {/* HEADER (Standardized with Teams/Devotions) */}
          <View className="px-5 mb-6">
            <Text
              className={`text-4xl font-extrabold ${isDark ? "text-white" : "text-black"}`}
            >
              Gifts
            </Text>
          </View>

          {/* Fellowship Store Section */}
          <View className="mb-10">
            <View className="px-5 mb-4 flex-row justify-between items-center">
              <Text
                className={`text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                Fellowship Store
              </Text>
              <View className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                <Text className="text-zinc-500 text-xs font-bold">
                  New arrivals
                </Text>
              </View>
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
                  onPress={() => {}} // Store items now show "Coming Soon" toast in the component
                />
              )}
            />
          </View>

          {/* Donation Section */}
          <View className="px-5">
            <View
              className={`p-6 rounded-3xl ${isDark ? "bg-zinc-900" : "bg-slate-50 border border-slate-100"}`}
            >
              <Text
                className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                Support with Donation
              </Text>
              <Text
                className={`text-sm mb-6 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
              >
                Your support helps us grow and impact more lives.
              </Text>

              {/* Preset Amounts */}
              <View className="flex-row flex-wrap gap-2 mb-6">
                {PRESET_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setValue("amount", amt)}
                    className={`px-4 py-2.5 rounded-2xl border ${
                      selectedAmount === amt
                        ? "bg-primary border-primary"
                        : isDark
                          ? "bg-zinc-800 border-zinc-700"
                          : "bg-white border-zinc-200"
                    }`}
                  >
                    <Text
                      className={`font-bold ${selectedAmount === amt ? "text-white" : isDark ? "text-zinc-400" : "text-zinc-600"}`}
                    >
                      {amt} ETB
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Form Fields */}
              <View className="gap-4">
                <View>
                  <Text
                    className={`text-xs font-bold mb-1.5 ml-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    AMOUNT (ETB)
                  </Text>
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className={`px-4 py-3.5 rounded-2xl border text-lg font-bold ${
                          isDark
                            ? "bg-zinc-800 border-zinc-700 text-white"
                            : "bg-white border-zinc-100 text-black shadow-sm"
                        }`}
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
                    )}
                  />
                  {errors.amount && (
                    <Text className="text-red-500 text-[10px] mt-1 ml-1">
                      {errors.amount.message}
                    </Text>
                  )}
                </View>

                <View>
                  <Text
                    className={`text-xs font-bold mb-1.5 ml-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    EMAIL ADDRESS
                  </Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className={`px-4 py-3.5 rounded-2xl border font-semibold ${
                          isDark
                            ? "bg-zinc-800 border-zinc-700 text-white"
                            : "bg-white border-zinc-100 text-black shadow-sm"
                        }`}
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
                    <Text className="text-red-500 text-[10px] mt-1 ml-1">
                      {errors.email.message}
                    </Text>
                  )}
                </View>

                <View>
                  <Text
                    className={`text-xs font-bold mb-1.5 ml-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    PHONE NUMBER
                  </Text>
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className={`px-4 py-3.5 rounded-2xl border font-semibold ${
                          isDark
                            ? "bg-zinc-800 border-zinc-700 text-white"
                            : "bg-white border-zinc-100 text-black shadow-sm"
                        }`}
                        placeholder="0911..."
                        placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                        keyboardType="phone-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.phoneNumber && (
                    <Text className="text-red-500 text-[10px] mt-1 ml-1">
                      {errors.phoneNumber.message}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit(handleInitializePayment)}
                disabled={loading}
                activeOpacity={0.8}
                className={`mt-8 py-4 rounded-2xl flex-row items-center justify-center ${loading ? "bg-zinc-400" : "bg-primary"}`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text className="text-white font-extrabold text-lg mr-2">
                      Donate {selectedAmount || 0} ETB
                    </Text>
                    <Ionicons name="heart" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Gifts;
