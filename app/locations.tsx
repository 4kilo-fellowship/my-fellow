import { LOCATIONS } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
    FlatList,
    Linking,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LocationCard = ({ item, isDark }: { item: any; isDark: boolean }) => {
  const handleOpenMaps = () => {
    const scheme = Platform.select({ ios: "maps:", android: "geo:" });
    const latLng = `${item.coordinates.latitude},${item.coordinates.longitude}`;
    const label = item.name;
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${latLng}`,
      android: `${scheme}0,0?q=${latLng}(${label})`,
    });

    if (item.googleMapsUrl) {
        Linking.openURL(item.googleMapsUrl); 
    } else if (url) {
        Linking.openURL(url);
    }
  };

  return (
    <View
      className={`mb-6 rounded-[24px] overflow-hidden ${
        isDark ? "bg-[#1C1C1E]" : "bg-white"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.4 : 0.1,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <Image
        source={item.image}
        style={{ width: "100%", height: 160 }}
        contentFit="cover"
      />
      <View className="p-5">
        <Text
          className={`text-xl font-bold mb-1 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {item.name}
        </Text>
        <View className="flex-row items-center mb-3">
          <Ionicons
            name="location-sharp"
            size={16}
            color="#9ca3af"
            style={{ marginRight: 4 }}
          />
          <Text
            className={`text-base font-medium ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {item.address}
          </Text>
        </View>

        {/* Access Times */}
        <View className="mb-5">
          {item.serviceTimes.map((time: string, index: number) => (
            <View key={index} className="flex-row items-center mt-1">
               <Ionicons name="time-outline" size={14} color="#f97316" style={{marginRight: 6}} />
               <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                   {time}
                </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleOpenMaps}
          activeOpacity={0.8}
          className="bg-orange-500 py-3.5 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="map" size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-bold text-base">Get Directions</Text>
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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className={`flex-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
        {/* Header */}
        <View
          className={`px-5 pb-4 flex-row items-center border-b ${
            isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"
          }`}
          style={{ paddingTop: top + 10 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: isDark ? "#1C1C1E" : "#e2e8f0" }}
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

        <FlatList
          data={LOCATIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LocationCard item={item} isDark={isDark} />}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text
              className={`text-base mb-6 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Find us at these locations for worship and fellowship. We can't wait
              to see you!
            </Text>
          }
        />
      </View>
    </>
  );
}
