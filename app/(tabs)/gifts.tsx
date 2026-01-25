import GiftCard from "@/components/GiftCard";
import { GIFT_ITEMS, GiftItem } from "@/constants/gifts";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { usePaymentStore } from "@/stores/payment.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Linking from "expo-linking";
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

const paymentSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Invalid Ethiopian phone number"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  reason: z.enum(["Gift", "Donation"]),
  team: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 10000];

const Gifts = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { top } = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const { txRef, setTxRef } = usePaymentStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      reason: "Donation",
    },
  });

  const selectedAmount = watch("amount");
  const selectedReason = watch("reason");

  // Handle deep linking
  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [txRef]);

  const handleDeepLink = (event: { url: string }) => {
    const { path, queryParams } = Linking.parse(event.url);
    if (path === "payment-status" || event.url.includes("payment-status")) {
      WebBrowser.dismissBrowser();
      if (txRef) {
        verifyPayment(txRef);
      }
    }
  };

  const handleGiftSelect = (item: GiftItem) => {
    setValue("amount", item.price);
    setValue("reason", "Gift");
  };

  const handlePresetSelect = (amount: number) => {
    setValue("amount", amount);
    setValue("reason", "Donation");
  };

  const initializePayment = async (data: PaymentForm) => {
    setLoading(true);
    try {
      const response = await api.post("/payments/chapa/init", data);
      const { checkout_url, tx_ref } = response.data;

      setTxRef(tx_ref);

      // Open checkout URL
      const result = await WebBrowser.openBrowserAsync(checkout_url);

      // Some browsers don't trigger the deep link automatically or user might close it
      // The deep link handler will take care of it if it triggers
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to initialize payment",
      );
    } finally {
      setLoading(false);
    }
  };

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
          text2: "Thank you for your support!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Payment Failed",
          text2: "Please try again or contact support.",
        });
      }
    } catch (error: any) {
      console.error("Payment verification failed:", error);
      Toast.show({
        type: "error",
        text1: "Verification Error",
        text2: "Could not verify payment status.",
      });
    } finally {
      setLoading(false);
      setTxRef(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: isDark ? "#121212" : "#F8F9FA" }}
    >
      <View style={{ paddingTop: top }} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Header */}
          <View className="px-5 py-4">
            <Text
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Gifts & Donations
            </Text>
            <Text
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Support our fellowship and get exclusive merchandise
            </Text>
          </View>

          {/* Horizontal Gifts Store */}
          <View className="mb-8">
            <View className="px-5 mb-4">
              <Text
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
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
                  onPress={handleGiftSelect}
                />
              )}
            />
          </View>

          {/* Donation Amount Selector */}
          <View className="px-5 mb-8">
            <Text
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Support with a Donation
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PRESET_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => handlePresetSelect(amt)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedAmount === amt && selectedReason === "Donation"
                      ? "bg-primary border-primary"
                      : isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selectedAmount === amt && selectedReason === "Donation"
                        ? "text-white"
                        : isDark
                          ? "text-gray-300"
                          : "text-gray-700"
                    }`}
                  >
                    {amt} ETB
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className={`flex-row items-center border rounded-xl px-4 py-3 ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } ${errors.amount ? "border-red-500" : ""}`}
                >
                  <Text
                    className={`mr-2 font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ETB
                  </Text>
                  <TextInput
                    className={`flex-1 font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                    placeholder="Custom Amount"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      setValue("reason", "Donation");
                    }}
                    value={value ? value.toString() : ""}
                  />
                </View>
              )}
            />
            {errors.amount && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.amount.message}
              </Text>
            )}
          </View>

          {/* Payment Form */}
          <View className="px-5">
            <Text
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Payer Information
            </Text>

            <View className="gap-4">
              {/* Full Name */}
              <View>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`px-4 py-3 rounded-xl border ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      } ${errors.fullName ? "border-red-500" : ""}`}
                      placeholder="Full Name"
                      placeholderTextColor={isDark ? "#666" : "#999"}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.fullName && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {errors.fullName.message}
                  </Text>
                )}
              </View>

              {/* Email */}
              <View>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`px-4 py-3 rounded-xl border ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      } ${errors.email ? "border-red-500" : ""}`}
                      placeholder="Email Address"
                      placeholderTextColor={isDark ? "#666" : "#999"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Phone Number */}
              <View>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`px-4 py-3 rounded-xl border ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      } ${errors.phoneNumber ? "border-red-500" : ""}`}
                      placeholder="Phone Number (09... or 07...)"
                      placeholderTextColor={isDark ? "#666" : "#999"}
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    {errors.phoneNumber.message}
                  </Text>
                )}
              </View>

              {/* Team/Dept Optional */}
              <View>
                <Controller
                  control={control}
                  name="team"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`px-4 py-3 rounded-xl border ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                      placeholder="Team / Department (Optional)"
                      placeholderTextColor={isDark ? "#666" : "#999"}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
            </View>

            {/* Reason Indicator (Hidden/Visual) */}
            <View className="mt-4 flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full ${
                  selectedReason === "Gift" ? "bg-blue-500" : "bg-green-500"
                } mr-2`}
              />
              <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Purpose: {selectedReason}
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(initializePayment)}
              disabled={loading}
              className={`mt-8 py-4 rounded-xl flex-row items-center justify-center ${
                loading ? "bg-gray-400" : "bg-primary"
              }`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-bold text-lg mr-2">
                    Pay {selectedAmount || 0} ETB
                  </Text>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Gifts;
