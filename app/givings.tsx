import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { GivingRecord, usePaymentStore } from "@/stores/payment.store";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
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

const GivingItem = ({
  item,
  isDark,
}: {
  item: GivingRecord;
  isDark: boolean;
}) => {
  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isSuccess = item.status === "success" || item.status === "completed";

  return (
    <View
      className={`mb-4 p-5 rounded-[24px] border ${
        isDark ? "bg-[#111] border-[#222]" : "bg-white border-gray-100"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${isSuccess ? "bg-green-500/10" : "bg-orange-500/10"}`}
          >
            <Ionicons
              name={isSuccess ? "checkmark-circle" : "time"}
              size={20}
              color={isSuccess ? "#10b981" : "#f97316"}
            />
          </View>
          <View>
            <Text
              className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}
            >
              {item.reason || "General Offering"}
            </Text>
            <Text
              className={`text-[10px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
            >
              {formattedDate} • {formattedTime}
            </Text>
          </View>
        </View>
        <Text
          className={`text-lg font-black ${isDark ? "text-white" : "text-black"}`}
        >
          {item.amount.toLocaleString()} ETB
        </Text>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <View
          className={`px-3 py-1 rounded-full ${isSuccess ? "bg-green-500/10" : "bg-orange-500/10"}`}
        >
          <Text
            className={`text-[9px] font-bold uppercase tracking-wider ${isSuccess ? "text-green-500" : "text-orange-500"}`}
          >
            {item.status}
          </Text>
        </View>
        <Text className="text-[10px] font-medium text-zinc-400">
          Ref: {item.tx_ref ? item.tx_ref.substring(0, 15) : "N/A"}...
        </Text>
      </View>
    </View>
  );
};

const GivingsScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { myGivings, totalGivingsAmount, isLoadingGivings, fetchMyGivings } =
    usePaymentStore();

  useEffect(() => {
    fetchMyGivings();
  }, []);

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: top + 10,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
        }}
      >
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? "bg-zinc-900" : "bg-white border border-gray-100"}`}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "white" : "black"}
            />
          </TouchableOpacity>
          <Text
            className={`ml-4 text-xl font-black ${isDark ? "text-white" : "text-black"}`}
          >
            My Giving History
          </Text>
        </View>

        <View
          className={`p-8 rounded-[32px] ${isDark ? "bg-zinc-900" : "bg-white"} border ${isDark ? "border-zinc-800" : "border-zinc-100 shadow-sm"}`}
        >
          <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mb-2">
            Total Contribution
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className={`text-5xl font-black ${isDark ? "text-white" : "text-black"}`}
            >
              {totalGivingsAmount.toLocaleString()}
            </Text>
            <Text className="ml-3 text-orange-500 font-bold text-lg">ETB</Text>
          </View>
        </View>
      </View>

      {isLoadingGivings && myGivings.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={myGivings}
          keyExtractor={(item) => item._id || item.tx_ref}
          renderItem={({ item }) => <GivingItem item={item} isDark={isDark} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingGivings}
              onRefresh={fetchMyGivings}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
          ListEmptyComponent={
            <View className="py-20 items-center justify-center">
              <View
                className={`w-20 h-20 rounded-[28px] items-center justify-center mb-6 ${isDark ? "bg-zinc-900" : "bg-gray-50"}`}
              >
                <Ionicons
                  name="receipt-outline"
                  size={40}
                  color={isDark ? "#333" : "#ddd"}
                />
              </View>
              <Text
                className={`text-base font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
              >
                No history found
              </Text>
              <Text
                className={`text-xs mt-2 ${isDark ? "text-zinc-600" : "text-zinc-300"}`}
              >
                Your donations will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default GivingsScreen;
