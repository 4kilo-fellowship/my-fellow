import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useStreakStore } from "@/stores/streak.store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StreakModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const StreakModal = ({ visible, onClose }: StreakModalProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    currentStreak,
    bestStreak,
    activeDates,
    totalDevotionsCompleted,
    isCompletedToday,
  } = useStreakStore();

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handleGoToDevotions = () => {
    handleClose();
    setTimeout(() => {
      router.push("/(tabs)/devotions");
    }, 150);
  };

  const completedToday = isCompletedToday();

  // Generate 7 days of current week (Monday to Sunday)
  const today = new Date();
  const currentDayOfWeek = (today.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayOfWeek);

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const weekData = weekDays.map((dayLabel, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const isToday = index === currentDayOfWeek;
    const isPast = index < currentDayOfWeek;
    const isDone = activeDates.includes(dateStr);

    return {
      dayLabel,
      dateNum: d.getDate(),
      isToday,
      isPast,
      isDone,
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDark ? "#18181b" : "#ffffff",
              transform: [{ translateY: slideAnim }],
              paddingBottom: Math.max(insets.bottom, 20) + 12,
            },
          ]}
        >
          {/* Grab Handle */}
          <View style={styles.handleWrapper}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? "#3f3f46" : "#e4e4e7" },
              ]}
            />
          </View>

          {/* Close button in top-right */}
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[
              styles.closeBtn,
              {
                backgroundColor: isDark ? "#27272a" : "#f4f4f5",
              },
            ]}
          >
            <Ionicons
              name="close"
              size={18}
              color={isDark ? "#a1a1aa" : "#71717a"}
            />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Flame Icon with Gradient Ring */}
            <View style={styles.flameHeroContainer}>
              <LinearGradient
                colors={["#ff6619", "#ff944d", "#ffc299"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.flameCircleGradient}
              >
                <View
                  style={[
                    styles.flameCircleInner,
                    { backgroundColor: isDark ? "#18181b" : "#ffffff" },
                  ]}
                >
                  <Ionicons name="flame" size={54} color="#ff6619" />
                </View>
              </LinearGradient>
            </View>

            {/* Streak Title */}
            <Text
              style={[
                styles.title,
                { color: isDark ? "#ffffff" : "#09090b" },
              ]}
            >
              {currentStreak > 0 ? `${currentStreak} Day Streak!` : "Start Your Streak!"}
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: isDark ? "#a1a1aa" : "#52525b" },
              ]}
            >
              {completedToday
                ? "Awesome! You've completed today's devotion and kept your habit strong."
                : "Read today's devotion to keep your habit active and feed your soul."}
            </Text>

            {/* 7-Day Week Progress */}
            <View
              style={[
                styles.weekContainer,
                {
                  backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                  borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                },
              ]}
            >
              <Text
                style={[
                  styles.weekTitle,
                  { color: isDark ? "#d4d4d8" : "#3f3f46" },
                ]}
              >
                THIS WEEK
              </Text>
              <View style={styles.daysRow}>
                {weekData.map((day, idx) => (
                  <View key={idx} style={styles.dayCol}>
                    <Text
                      style={[
                        styles.dayLabel,
                        {
                          color: day.isToday
                            ? "#ff6619"
                            : isDark
                              ? "#a1a1aa"
                              : "#71717a",
                          fontWeight: day.isToday ? "800" : "600",
                        },
                      ]}
                    >
                      {day.dayLabel}
                    </Text>
                    <View
                      style={[
                        styles.dayCircle,
                        day.isDone
                          ? { backgroundColor: "#ff6619", borderColor: "#ff6619" }
                          : day.isToday
                            ? {
                                backgroundColor: "transparent",
                                borderColor: "#ff6619",
                                borderWidth: 2,
                              }
                            : {
                                backgroundColor: isDark
                                  ? "#18181b"
                                  : "#ffffff",
                                borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                                borderWidth: 1.5,
                              },
                      ]}
                    >
                      {day.isDone ? (
                        <Ionicons name="checkmark" size={14} color="#ffffff" />
                      ) : (
                        <Text
                          style={[
                            styles.dayNum,
                            {
                              color: day.isToday
                                ? "#ff6619"
                                : isDark
                                  ? "#71717a"
                                  : "#a1a1aa",
                            },
                          ]}
                        >
                          {day.dateNum}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                    borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                  },
                ]}
              >
                <Text style={styles.statNumber}>{currentStreak}</Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: isDark ? "#a1a1aa" : "#71717a" },
                  ]}
                >
                  Current
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                    borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                  },
                ]}
              >
                <Text style={styles.statNumber}>{bestStreak}</Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: isDark ? "#a1a1aa" : "#71717a" },
                  ]}
                >
                  Best Streak
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                    borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                  },
                ]}
              >
                <Text style={styles.statNumber}>{totalDevotionsCompleted}</Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: isDark ? "#a1a1aa" : "#71717a" },
                  ]}
                >
                  Total Read
                </Text>
              </View>
            </View>

            {/* Scripture Verse Card */}
            <View
              style={[
                styles.verseCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 102, 25, 0.08)"
                    : "rgba(255, 102, 25, 0.05)",
                  borderColor: isDark
                    ? "rgba(255, 102, 25, 0.2)"
                    : "rgba(255, 102, 25, 0.15)",
                },
              ]}
            >
              <Ionicons
                name="book-outline"
                size={18}
                color="#ff6619"
                style={{ marginBottom: 6 }}
              />
              <Text
                style={[
                  styles.verseText,
                  { color: isDark ? "#e4e4e7" : "#3f3f46" },
                ]}
              >
                “Your word is a lamp for my feet, a light on my path.”
              </Text>
              <Text style={styles.verseRef}>Psalm 119:105</Text>
            </View>

            {/* Action CTA Button */}
            <TouchableOpacity
              onPress={handleGoToDevotions}
              activeOpacity={0.85}
              style={[
                styles.ctaBtn,
                { backgroundColor: PRIMARY },
              ]}
            >
              <Ionicons
                name="book"
                size={18}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.ctaBtnText}>
                {completedToday
                  ? "Explore More Devotions"
                  : "Read Today's Devotion"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: SCREEN_HEIGHT * 0.88,
    paddingTop: 12,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleWrapper: {
    alignItems: "center",
    paddingVertical: 4,
  },
  handle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
  },
  closeBtn: {
    position: "absolute",
    right: 20,
    top: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 20,
  },
  flameHeroContainer: {
    marginBottom: 16,
  },
  flameCircleGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
  },
  flameCircleInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  weekContainer: {
    width: "100%",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  weekTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textAlign: "center",
    marginBottom: 10,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayCol: {
    alignItems: "center",
    gap: 6,
  },
  dayLabel: {
    fontSize: 12,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNum: {
    fontSize: 11,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ff6619",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  verseCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  verseText: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 4,
  },
  verseRef: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ff6619",
  },
  ctaBtn: {
    width: "100%",
    height: 50,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#ff6619",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ctaBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default StreakModal;
