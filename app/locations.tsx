import { Placeholder } from "@/components";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useLocationsStore } from "@/stores/locations.store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  item: any;
  isDark: boolean;
}

const LocationCard = ({ item, isDark }: Props) => {
  const handleOpenMaps = () => {
    const scheme = Platform.select({ ios: "maps:", android: "geo:" });
    const latLng =
      item.coordinates &&
      item.coordinates.latitude &&
      item.coordinates.longitude
        ? `${item.coordinates.latitude},${item.coordinates.longitude}`
        : null;
    const label = item.name;

    let url = item.googleMapsUrl;

    if (!url && latLng) {
      url = Platform.select({
        ios: `${scheme}?q=${label}&ll=${latLng}`,
        android: `${scheme}0,0?q=${latLng}(${label})`,
      });
    }

    if (url) {
      Linking.openURL(url);
    }
  };

  const imageSource =
    typeof item.image === "string" ? { uri: item.image } : item.image;

  return (
    <View
      className={`mb-5 rounded-[24px] overflow-hidden border ${
        isDark ? "bg-[#111] border-[#222]" : "bg-[#f9fafb] border-gray-200"
      }`}
    >
      <Image
        source={imageSource}
        style={{ width: "100%", height: 160 }}
        contentFit="cover"
        transition={300}
      />
      <View className="p-5">
        <Text
          className={`text-lg font-bold mb-1 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {item.name}
        </Text>
        <View className="flex-row items-center mb-4">
          <Ionicons
            name="location-sharp"
            size={14}
            color={isDark ? "#6b7280" : "#9ca3af"}
            style={{ marginRight: 4 }}
          />
          <Text
            className={`text-[13px] font-medium ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {item.address}
          </Text>
        </View>

        {/* Service Times */}
        {item.serviceTimes &&
          Array.isArray(item.serviceTimes) &&
          item.serviceTimes.length > 0 && (
            <View
              className={`rounded-xl p-3.5 mb-5 border ${
                isDark
                  ? "bg-[#1a1a1a] border-[#222]"
                  : "bg-white border-gray-100"
              }`}
            >
              {item.serviceTimes.map((time: string, index: number) => (
                <View
                  key={index}
                  className={`flex-row items-center ${index > 0 ? "mt-2" : ""}`}
                >
                  <View
                    className={`w-7 h-7 rounded-full items-center justify-center mr-3 ${
                      isDark ? "bg-[#222]" : "bg-orange-50"
                    }`}
                  >
                    <Ionicons name="time-outline" size={14} color={PRIMARY} />
                  </View>
                  <Text
                    className={`text-[13px] font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {time}
                  </Text>
                </View>
              ))}
            </View>
          )}

        <TouchableOpacity
          onPress={handleOpenMaps}
          activeOpacity={0.7}
          className={`py-3 rounded-xl flex-row items-center justify-center border ${
            isDark ? "bg-[#1C1C1E] border-[#333]" : "bg-white border-gray-200"
          }`}
        >
          <Ionicons
            name="navigate"
            size={18}
            color={PRIMARY}
            style={{ marginRight: 8 }}
          />
          <Text
            className={`font-bold text-[14px] ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Get Directions
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function LocationsScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  const { locations, loading, refreshing, error, loadLocations } =
    useLocationsStore();

  useEffect(() => {
    loadLocations();
  }, []);

  const onRefresh = () => {
    loadLocations(true);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className={`flex-1 ${isDark ? "bg-dark" : "bg-white"}`}>
        {/* Header */}
        <View
          className={`px-5 pb-4 flex-row items-center border-b ${
            isDark ? "bg-dark border-gray-800" : "bg-white border-gray-200"
          }`}
          style={{ paddingTop: top + 10 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full items-center justify-center mr-4"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "white" : "#0f172a"}
            />
          </TouchableOpacity>
          <Text
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Locations
          </Text>
        </View>

        {loading && locations.length === 0 ? (
          <View
            className={`px-5 pt-6 flex-1 ${isDark ? "bg-dark" : "bg-white"}`}
          >
            <Placeholder
              height={20}
              width="100%"
              borderRadius={4}
              style={{ marginBottom: 20 }}
            />
            {[1, 2, 3].map((_, i) => (
              <View
                key={i}
                className={`mb-5 rounded-[24px] overflow-hidden border ${
                  isDark
                    ? "bg-[#111] border-[#222]"
                    : "bg-[#f9fafb] border-gray-200"
                }`}
              >
                <Placeholder height={160} width="100%" borderRadius={0} />
                <View className="p-5">
                  <Placeholder
                    height={22}
                    width="60%"
                    borderRadius={4}
                    style={{ marginBottom: 10 }}
                  />
                  <View className="flex-row items-center mb-4">
                    <Placeholder
                      height={14}
                      width={14}
                      borderRadius={2}
                      style={{ marginRight: 6 }}
                    />
                    <Placeholder height={14} width="80%" borderRadius={4} />
                  </View>

                  <View
                    className={`rounded-xl p-3.5 mb-5 border ${
                      isDark
                        ? "bg-[#1a1a1a] border-[#222]"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Placeholder
                        width={28}
                        height={28}
                        borderRadius={14}
                        style={{ marginRight: 12 }}
                      />
                      <Placeholder width="70%" height={14} borderRadius={4} />
                    </View>
                    <View className="flex-row items-center mt-2">
                      <Placeholder
                        width={28}
                        height={28}
                        borderRadius={14}
                        style={{ marginRight: 12 }}
                      />
                      <Placeholder width="50%" height={14} borderRadius={4} />
                    </View>
                  </View>

                  <Placeholder height={46} width="100%" borderRadius={12} />
                </View>
              </View>
            ))}
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center p-5">
            <Ionicons name="alert-circle-outline" size={64} color={PRIMARY} />
            <Text
              className={`text-lg font-bold mt-4 text-center ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => loadLocations(true)}
              className="mt-6 bg-primary px-8 py-3 rounded-full"
            >
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={locations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LocationCard item={item} isDark={isDark} />
            )}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 40,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={PRIMARY}
                colors={[PRIMARY]}
              />
            }
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text
                className={`text-base mb-6 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Find us at these locations for worship and fellowship. We can&apos;t
                wait to see you!
              </Text>
            }
          />
        )}
      </View>
    </>
  );
}
