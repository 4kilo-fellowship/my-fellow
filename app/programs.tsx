import {
  AdminActionButton,
  AdminEditTrigger,
  InfoModal,
  Placeholder,
  ScreenHeader,
} from "@/components";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  PROGRAM_CATEGORY_ID,
  PROGRAM_OFFSETS_MIN,
  cancelReminders,
  ensureExactAlarmPermission,
  ensurePermission,
  loadAll,
  scheduleReminders,
  sendConfirmationNotification,
  subscribeToReminders,
  type ReminderTarget,
} from "@/notifications";
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
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProgramProps {
  item: Program;
  isDark: boolean;
  isAlertActive: (item: Program) => boolean;
  onToggleAlert: (item: Program) => void;
  isAdmin?: boolean;
  onEdit?: (item: Program) => void;
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
  isAdmin,
  onEdit,
}: ProgramProps) => {
  const isAlertSet = isAlertActive(item);

  return (
    <View className="flex-1">
      <View
        style={[
          styles.card,
          isDark ? styles.cardDark : styles.cardLight,
        ]}
      >
        <Pressable
          onPress={() =>
            openGoogleMaps(
              item.coordinates.lat,
              item.coordinates.lng,
              item.location,
            )
          }
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, tap to view map directions`}
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
            borderless: false,
            foreground: true,
          }}
          style={{ width: "100%" }}
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

            <View
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                zIndex: 10,
              }}
            >
              {isAdmin && onEdit && (
                <AdminEditTrigger
                  size={40}
                  onPress={() => onEdit(item)}
                />
              )}
              <View style={styles.alertBtnWrap}>
                <Pressable
                  onPress={() => onToggleAlert(item)}
                  accessibilityRole="button"
                  accessibilityLabel={isAlertSet ? "Remove reminder" : "Set reminder"}
                  android_ripple={{
                    color: "rgba(255, 255, 255, 0.35)",
                    borderless: false,
                    foreground: true,
                  }}
                  style={styles.alertBtnInner}
                >
                  <Ionicons
                    name={isAlertSet ? "notifications" : "notifications-outline"}
                    size={20}
                    color={isAlertSet ? "#f97316" : "white"}
                  />
                </Pressable>
              </View>
            </View>

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

            <View
              style={[
                styles.locationBtnWrap,
                isDark ? styles.locationDark : styles.locationLight,
              ]}
            >
              <Pressable
                onPress={() =>
                  openGoogleMaps(
                    item.coordinates.lat,
                    item.coordinates.lng,
                    item.location,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Get directions to ${item.location}`}
                android_ripple={{
                  color: isDark
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(255, 103, 25, 0.12)",
                  borderless: false,
                  foreground: true,
                }}
                style={styles.locationBtnInner}
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
                      className={`text-[11px] font-medium mb-0.5 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
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
              </Pressable>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default function WeeklyPrograms() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const isAdmin = useIsAdmin();

  // Header Heights
  const STATIC_HEADER_HEIGHT = top + 80;
  const FILTER_SECTION_HEIGHT = 100;
  const TOTAL_HEADER_HEIGHT = STATIC_HEADER_HEIGHT + FILTER_SECTION_HEIGHT;

  const scrollY = useRef(new Animated.Value(0)).current;

  // Use a clamped value for diffClamp to prevent glitches during scroll bouncing
  const clampedScrollY = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolateLeft: "clamp",
  });

  const diffClamp = Animated.diffClamp(
    clampedScrollY,
    0,
    FILTER_SECTION_HEIGHT,
  );

  const translateY = diffClamp.interpolate({
    inputRange: [0, FILTER_SECTION_HEIGHT],
    outputRange: [0, -FILTER_SECTION_HEIGHT],
    extrapolate: "clamp",
  });

  const FILTERS = ["All", "General", "Team"] as const;
  type ProgramFilter = (typeof FILTERS)[number];

  const [selectedFilter, setSelectedFilter] = useState<ProgramFilter>("All");

  const { programs, loading, refreshing, loadPrograms } = useProgramsStore();

  const [activeReminderIds, setActiveReminderIds] = useState<Set<string>>(
    new Set(),
  );
  const [isScheduling, setIsScheduling] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    title: string;
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  // Keep the bell icons in sync with what is actually scheduled on the device
  useEffect(() => {
    let isMounted = true;

    const refreshActiveReminders = async () => {
      const records = await loadAll();
      if (!isMounted) return;
      setActiveReminderIds(new Set(records.map((r) => r.eventId)));
    };

    refreshActiveReminders();
    const unsubscribe = subscribeToReminders(refreshActiveReminders);

    return () => {
      isMounted = false;
      unsubscribe();
    };
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

  const programReminderId = (program: Program) => `program_${program.id}`;

  const handleToggleAlert = async (program: Program) => {
    if (isScheduling) return;

    const eventId = programReminderId(program);

    // Turning an existing reminder off
    if (activeReminderIds.has(eventId)) {
      await cancelReminders(eventId);
      return;
    }

    setIsScheduling(true);
    try {
      // Ask for permission in context, only when a reminder is created
      const permission = await ensurePermission();
      if (permission !== "granted") {
        setInfoModal({
          title: "Notifications Off",
          message:
            "Enable notifications in your device settings to receive program reminders.",
          type: "info",
        });
        return;
      }

      // Android 12+: without exact alarms the OS may delay delivery
      await ensureExactAlarmPermission();

      const startsAt = parseProgramDate(program.day, program.time).getTime();
      if (!Number.isFinite(startsAt) || startsAt <= Date.now()) {
        setInfoModal({
          title: "Program Unavailable",
          message:
            "This program has already started or has an invalid schedule.",
          type: "info",
        });
        return;
      }

      const target: ReminderTarget = {
        eventId,
        title: program.title,
        startsAt,
        url: "/programs",
        shortDescription: program.location,
        categoryId: PROGRAM_CATEGORY_ID,
      };

      // 30 minutes before + at the start time, repeating every week.
      // All of this is local: it works with zero internet.
      const scheduledOffsets = await scheduleReminders(
        target,
        PROGRAM_OFFSETS_MIN,
        { repeats: "weekly" },
      );

      if (scheduledOffsets.length === 0) {
        setInfoModal({
          title: "Reminder Error",
          message:
            "Could not schedule the reminder. Please try again from the Programs screen.",
          type: "error",
        });
        return;
      }

      await sendConfirmationNotification(target, scheduledOffsets);

      setInfoModal({
        title: "Reminder Set 🔔",
        message: `We'll notify you 30 minutes before and when ${program.title} starts — every week.`,
        type: "success",
      });
    } catch (err) {
      console.warn("[programs] Failed toggling reminder:", err);
      setInfoModal({
        title: "Reminder Error",
        message: "Could not schedule the reminder. Please try again.",
        type: "error",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const isAlertActive = (program: Program) => {
    return activeReminderIds.has(programReminderId(program));
  };

  const isGeneralProgram = (program: Program) => {
    const cat = (program.category || "").toLowerCase().trim();
    const title = (program.title || "").toLowerCase().trim();
    return (
      cat.includes("general") ||
      cat === "gf" ||
      cat.includes("weekly service") ||
      (cat.includes("fellowship") &&
        !cat.includes("team") &&
        !title.includes("team")) ||
      title.includes("monday service") ||
      title.includes("general") ||
      title.includes("morning prayer")
    );
  };

  const isTeamProgram = (program: Program) => {
    const cat = (program.category || "").toLowerCase().trim();
    const title = (program.title || "").toLowerCase().trim();
    return (
      cat.includes("team") ||
      title.includes("team") ||
      cat.includes("ministry") ||
      cat.includes("teaching") ||
      cat.includes("outreach") ||
      cat.includes("bible study") ||
      (cat.includes("prayer") && title.includes("team")) ||
      (cat.includes("service") && !cat.includes("weekly")) ||
      title.includes("worship") ||
      title.includes("media") ||
      title.includes("evangelism") ||
      title.includes("i4u") ||
      title.includes("fresh") ||
      !isGeneralProgram(program)
    );
  };

  const filteredPrograms = programs.filter((program) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "General") return isGeneralProgram(program);
    if (selectedFilter === "Team") return isTeamProgram(program);
    return true;
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

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
                className={`mb-5 rounded-[24px] overflow-hidden border ${
                  isDark
                    ? "bg-[#111] border-[#222]"
                    : "bg-[#f9fafb] border-gray-200"
                }`}
              >
                <Placeholder height={208} borderRadius={0} />
                <View className="p-5">
                  <Placeholder
                    width="70%"
                    height={28}
                    style={{ marginBottom: 12 }}
                  />
                  <Placeholder
                    width="100%"
                    height={18}
                    style={{ marginBottom: 6 }}
                  />
                  <Placeholder
                    width="60%"
                    height={18}
                    style={{ marginBottom: 20 }}
                  />

                  <View className="flex-row items-center justify-between mb-4">
                    <Placeholder width={110} height={36} borderRadius={8} />
                    <Placeholder width={100} height={36} borderRadius={8} />
                  </View>

                  <View
                    className={`h-[1px] w-full mb-4 ${isDark ? "bg-[#222]" : "bg-gray-100"}`}
                  />

                  <View
                    className={`flex-row items-center justify-between py-3 px-4 rounded-xl border ${
                      isDark
                        ? "bg-[#1a1a1a] border-[#222]"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                          isDark ? "bg-[#222]" : "bg-orange-50"
                        }`}
                      >
                        <Placeholder width={18} height={18} borderRadius={9} />
                      </View>
                      <View className="flex-1">
                        <Placeholder
                          width={60}
                          height={10}
                          style={{ marginBottom: 4 }}
                        />
                        <Placeholder width={120} height={14} />
                      </View>
                    </View>
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center border ${
                        isDark
                          ? "bg-[#222] border-[#333]"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Placeholder width={14} height={14} borderRadius={7} />
                    </View>
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
                  isAdmin={isAdmin}
                  onEdit={(prog) => router.push(`/programs/manage?id=${prog.id}`)}
                />
              </View>
            )}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 40,
              flexGrow: 1,
            }}
            ListEmptyComponent={
              <View className="items-center justify-center pt-24 pb-12">
                <View
                  className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                    isDark ? "bg-[#1C1C1E]" : "bg-orange-50"
                  }`}
                >
                  <Ionicons name="calendar-outline" size={28} color={PRIMARY} />
                </View>
                <Text
                  className={`text-base font-bold mb-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  No Programs Found
                </Text>
                <Text
                  className={`text-sm text-center px-6 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {selectedFilter === "All"
                    ? "There are currently no programs scheduled."
                    : `No ${selectedFilter.toLowerCase()} programs found.`}
                </Text>
              </View>
            }
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
        <ScreenHeader
          title="Programs"
          rightAction={
            isAdmin ? (
              <AdminActionButton
                label="Add"
                onPress={() => router.push("/programs/manage")}
              />
            ) : null
          }
          containerStyle={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
            borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
          }}
        />

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
            {FILTERS.map((filter) => {
              const isSelected = selectedFilter === filter;
              return (
                <View
                  key={filter}
                  style={[
                    styles.filterPillWrap,
                    isSelected
                      ? styles.filterPillSelected
                      : isDark
                        ? styles.filterPillDark
                        : styles.filterPillLight,
                  ]}
                >
                  <Pressable
                    onPress={() => setSelectedFilter(filter)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Filter by ${filter}`}
                    android_ripple={{
                      color: isSelected
                        ? "rgba(255, 255, 255, 0.3)"
                        : isDark
                          ? "rgba(255, 255, 255, 0.12)"
                          : "rgba(0, 0, 0, 0.08)",
                      borderless: false,
                      foreground: true,
                    }}
                    style={styles.filterPillInner}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isSelected
                          ? styles.filterPillTextSelected
                          : isDark
                            ? styles.filterPillTextDark
                            : styles.filterPillTextLight,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      <InfoModal
        visible={infoModal !== null}
        onClose={() => setInfoModal(null)}
        title={infoModal?.title ?? ""}
        message={infoModal?.message ?? ""}
        type={infoModal?.type ?? "info"}
        isDark={isDark}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 20,
  },
  cardDark: {
    backgroundColor: "#111111",
    borderColor: "#222222",
  },
  cardLight: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  alertBtnWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  alertBtnInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  locationBtnWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  locationDark: {
    backgroundColor: "#1a1a1a",
    borderColor: "#222222",
  },
  locationLight: {
    backgroundColor: "#ffffff",
    borderColor: "#f3f4f6",
  },
  locationBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
  filterPillWrap: {
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    borderWidth: 1.5,
    marginRight: 10,
  },
  filterPillSelected: {
    backgroundColor: "#f97316",
    borderColor: "#f97316",
  },
  filterPillDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "#27272a",
  },
  filterPillLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  filterPillInner: {
    height: "100%",
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: "600",
    includeFontPadding: false,
  },
  filterPillTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  filterPillTextDark: {
    color: "#9ca3af",
  },
  filterPillTextLight: {
    color: "#4b5563",
  },
});
