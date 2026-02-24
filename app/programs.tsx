import { InfoModal, Placeholder } from "@/components";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useAlerts } from "@/hooks/useAlerts";
import { useProgramsStore } from "@/stores/programs.store";
import { Program } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProgramProps {
  item: Program;
  isDark: boolean;
  isAlertActive: (title: string) => boolean;
  onToggleAlert: (item: Program) => void;
}
const openGoogleMaps = (lat: number, lng: number, label: string) => {
  const scheme = Platform.select({
    ios: "maps:0,0?q=",
    android: "geo:0,0?q=",
  });
  const latLng = `${lat},${lng}`;
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`,
  });

  if (url) {
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      );
    });
  }
};

const ProgramCard = ({
  item,
  isDark,
  isAlertActive,
  onToggleAlert,
}: ProgramProps) => {
  const isAlertSet = isAlertActive(item.title);

  return (
    <View className="flex-1">
      <View
        className={`mb-5 rounded-[24px] overflow-hidden border ${
          isDark ? "bg-[#111] border-[#222]" : "bg-[#f9fafb] border-gray-200"
        }`}
      >
        <View className="h-52 w-full relative">
          <Image
            source={item.image}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={400}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />

          <TouchableOpacity
            onPress={() => onToggleAlert(item)}
            activeOpacity={0.7}
            className="absolute top-4 right-4 w-10 h-10 rounded-full items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <Ionicons
              name={isAlertSet ? "notifications" : "notifications-outline"}
              size={20}
              color={isAlertSet ? "#f97316" : "white"}
            />
          </TouchableOpacity>

          <View className="absolute bottom-4 left-5 right-5">
            <Text
              className="text-white text-2xl font-extrabold"
              style={{
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              {item.title}
            </Text>
          </View>
        </View>

        <View className="p-5">
          <Text
            className={`text-[14px] mb-4 leading-[22px] ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <View
              className={`flex-row items-center px-3.5 py-2 rounded-lg border ${
                isDark
                  ? "bg-[#1a1a1a] border-[#222]"
                  : "bg-white border-gray-100"
              }`}
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color={PRIMARY}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`font-bold text-xs ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {item.day}
              </Text>
            </View>

            <View
              className={`flex-row items-center px-3.5 py-2 rounded-lg border ${
                isDark
                  ? "bg-[#1a1a1a] border-[#222]"
                  : "bg-white border-gray-100"
              }`}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={isDark ? "#9ca3af" : "#6b7280"}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`text-xs font-semibold ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {item.time}
              </Text>
            </View>
          </View>

          <View
            className={`h-[1px] w-full mb-4 ${isDark ? "bg-[#222]" : "bg-gray-100"}`}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              openGoogleMaps(
                item.coordinates.lat,
                item.coordinates.lng,
                item.location,
              )
            }
            className={`flex-row items-center justify-between py-3 px-4 rounded-xl border ${
              isDark ? "bg-[#1a1a1a] border-[#222]" : "bg-white border-gray-100"
            }`}
          >
            <View className="flex-row items-center flex-1">
              <View
                className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                  isDark ? "bg-[#222]" : "bg-orange-50"
                }`}
              >
                <Ionicons name="location" size={18} color={PRIMARY} />
              </View>
              <View className="flex-1">
                <Text
                  className={`text-[11px] font-medium mb-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Location
                </Text>
                <Text
                  className={`text-[13px] font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                  numberOfLines={1}
                >
                  {item.location}
                </Text>
              </View>
            </View>
            <View
              className={`w-8 h-8 rounded-full items-center justify-center border ${
                isDark
                  ? "bg-[#222] border-[#333]"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Ionicons name="navigate" size={14} color={PRIMARY} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function WeeklyPrograms() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  // Header Heights
  const STATIC_HEADER_HEIGHT = top + 80;
  const FILTER_SECTION_HEIGHT = 100;
  const TOTAL_HEADER_HEIGHT = STATIC_HEADER_HEIGHT + FILTER_SECTION_HEIGHT;

  const scrollY = useRef(new Animated.Value(0)).current;
  const diffClamp = Animated.diffClamp(scrollY, 0, FILTER_SECTION_HEIGHT);
  const translateY = diffClamp.interpolate({
    inputRange: [0, FILTER_SECTION_HEIGHT],
    outputRange: [0, -FILTER_SECTION_HEIGHT],
  });

  const [selectedFilter, setSelectedFilter] = useState("All");

  const [blinkAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const { programs, loading, refreshing, loadPrograms } = useProgramsStore();

  const { addAlert, deleteAlert, alerts } = useAlerts();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    loadPrograms();
  }, []);

  const onRefresh = () => {
    loadPrograms(true);
  };

  const parseProgramDate = (dayStr: string, timeStr: string): Date => {
    const now = new Date();
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const targetDayIndex = days.indexOf(dayStr.toLowerCase().trim());

    if (targetDayIndex === -1) return now;

    const [timePart, meridiem] = timeStr.split(" - ")[0].trim().split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (meridiem?.toLowerCase() === "pm" && hours < 12) hours += 12;
    if (meridiem?.toLowerCase() === "am" && hours === 12) hours = 0;

    const result = new Date(now);
    result.setHours(hours, minutes || 0, 0, 0);

    const currentDay = now.getDay();
    let daysToAdd = targetDayIndex - currentDay;
    if (daysToAdd < 0) daysToAdd += 7;

    result.setDate(now.getDate() + daysToAdd);

    if (result < now) {
      result.setDate(result.getDate() + 7);
    }

    return result;
  };

  const handleToggleAlert = async (program: Program) => {
    const existingAlert = alerts.find((a) => a.title === program.title);

    if (existingAlert) {
      await deleteAlert(existingAlert.id);
    } else {
      const date = parseProgramDate(program.day, program.time);
      await addAlert({
        title: program.title,
        description: `Reminder for ${program.title}`,
        time: date.toISOString(),
        repeats: "weekly",
        remindBefore: 15,
      });
      setAlertMessage(
        `We'll notify you 15 minutes before the ${program.title} starts.`,
      );
      setShowSuccessModal(true);
    }
  };

  const isAlertActive = (title: string) => {
    return alerts.some((a) => a.title === title);
  };

  const filteredPrograms = programs.filter((program) => {
    if (selectedFilter === "All") return true;
    return program.category
      ?.toLowerCase()
      .includes(selectedFilter.toLowerCase());
  });

  const hasNewPrograms = programs.some((p) =>
    p.category?.toLowerCase().includes("new"),
  );

  const getFilters = () => {
    const baseFilters = ["All", "Weekly", "Daily", "General", "Team"];
    return hasNewPrograms
      ? ["All", "New", ...baseFilters.slice(1)]
      : baseFilters;
  };

  const dynamicFilters = getFilters();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor="transparent"
      />

      <View className={`flex-1 ${isDark ? "bg-[#0A0A0A]" : "bg-[#f8fafc]"}`}>
        {loading && programs.length === 0 ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: TOTAL_HEADER_HEIGHT + 20,
              paddingHorizontal: 20,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
          >
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className={`mb-6 rounded-[28px] overflow-hidden ${isDark ? "bg-[#1C1C1E]" : "bg-white"}`}
                style={{
                  height: 400,
                  shadowColor: isDark ? "#000" : "#64748b",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: isDark ? 0.5 : 0.12,
                  shadowRadius: 24,
                  elevation: 10,
                }}
              >
                <Placeholder height={208} borderRadius={0} />
                <View className="p-5">
                  <Placeholder
                    width="90%"
                    height={24}
                    style={{ marginBottom: 12 }}
                  />
                  <Placeholder
                    width="100%"
                    height={40}
                    style={{ marginBottom: 20 }}
                  />
                  <View className="flex-row justify-between items-center mb-4">
                    <Placeholder width={100} height={32} borderRadius={12} />
                    <Placeholder width={120} height={20} />
                  </View>
                  <View
                    className={`h-[1px] w-full mb-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                  />
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Placeholder
                        width={40}
                        height={40}
                        borderRadius={20}
                        style={{ marginRight: 12 }}
                      />
                      <View className="flex-1">
                        <Placeholder
                          width={80}
                          height={12}
                          style={{ marginBottom: 4 }}
                        />
                        <Placeholder width={140} height={16} />
                      </View>
                    </View>
                    <Placeholder width={36} height={36} borderRadius={18} />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Animated.FlatList
            data={filteredPrograms}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            ListHeaderComponent={
              <View style={{ height: TOTAL_HEADER_HEIGHT }} />
            }
            renderItem={({ item }) => (
              <View style={{ paddingTop: 20 }}>
                <ProgramCard
                  item={item}
                  isDark={isDark}
                  isAlertActive={isAlertActive}
                  onToggleAlert={handleToggleAlert}
                />
              </View>
            )}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 40,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={PRIMARY}
                colors={[PRIMARY]}
                progressViewOffset={TOTAL_HEADER_HEIGHT}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Static Header: Back and Title */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            height: STATIC_HEADER_HEIGHT,
            backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
            paddingTop: top + 10,
            paddingHorizontal: 20,
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
                size={22}
                color={isDark ? "white" : "#0f172a"}
              />
            </TouchableOpacity>
            <Text
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Programs
            </Text>
          </View>
        </View>

        {/* Animated Filters and Description */}
        <Animated.View
          style={{
            position: "absolute",
            top: STATIC_HEADER_HEIGHT,
            left: 0,
            right: 0,
            zIndex: 5,
            height: FILTER_SECTION_HEIGHT,
            backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
            transform: [{ translateY }],
          }}
        >
          <Text
            className={`text-base leading-6 pr-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            style={{ paddingHorizontal: 20 }}
          >
            Discover our weekly gatherings. Tap the location to get directions.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {dynamicFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.7}
                onPress={() => setSelectedFilter(filter)}
                className={`px-4 py-1.5 mr-3 rounded-xl border flex-row items-center ${
                  selectedFilter === filter
                    ? "bg-orange-500 border-orange-500"
                    : isDark
                      ? "bg-[#1C1C1E] border-gray-800"
                      : "bg-white border-gray-200"
                }`}
              >
                {filter === "New" && (
                  <Animated.View
                    style={{
                      opacity: blinkAnim,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        selectedFilter === "New" ? "white" : "#ef4444",
                      marginRight: 6,
                    }}
                  />
                )}
                <Text
                  className={`font-semibold ${
                    selectedFilter === filter
                      ? "text-white"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-600"
                  }`}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>

      <InfoModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Alert Set"
        message={alertMessage}
        type="success"
        isDark={isDark}
      />
    </>
  );
}
