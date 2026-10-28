import AuthIcon, { AuthIconName } from "@/components/AuthIcon";
import { InfoModal } from "@/components/Modals/InfoModal";
import { PRIMARY } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSignupStore } from "@/stores/signup.store";
import { useUserStore } from "@/stores/user.store";
import { BottomSheet, Host, RNHostView } from "@expo/ui";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import PagerView, {
  PageScrollStateChangedNativeEvent,
  PagerViewOnPageScrollEvent,
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const TOTAL_PAGES = 5;

interface MinistryTeamMeta {
  id: string;
  name: string;
  subtitle: string;
  icon: AuthIconName;
}

const FELLOWSHIP_TEAMS: MinistryTeamMeta[] = [
  {
    id: "Bible Study",
    name: "Bible Study",
    subtitle: "Deep scripture study, weekly cell groups & discipleship.",
    icon: "book",
  },
  {
    id: "Evangelism",
    name: "Evangelism",
    subtitle: "Sharing the Gospel across campus and university outreach.",
    icon: "megaphone",
  },
  {
    id: "Freshman",
    name: "Freshman Ministry",
    subtitle: "Welcoming and guiding new campus students in faith and life.",
    icon: "school",
  },
  {
    id: "I4U",
    name: "I4U (Discipleship)",
    subtitle: "Care, encouragement, mutual support, and student welfare.",
    icon: "heart",
  },
  {
    id: "Media",
    name: "Media & Tech",
    subtitle: "Audio/visuals, photography, livestream, and tech creativity.",
    icon: "video",
  },
  {
    id: "Prayer",
    name: "Prayer & Intercession",
    subtitle: "Intercession, morning prayers, and fellowship fasting nights.",
    icon: "hand",
  },
  {
    id: "Worship",
    name: "Worship & Choir",
    subtitle: "Choir, acoustic teams, and leading fellowship praise.",
    icon: "music",
  },
  {
    id: "Other",
    name: "Other Fellowship Ministry",
    subtitle: "General fellowship member and community ministries.",
    icon: "apps",
  },
];

interface DepartmentMeta {
  id: string;
  name: string;
  subtitle: string;
  icon: AuthIconName;
}

const FELLOWSHIP_DEPARTMENTS: DepartmentMeta[] = [
  {
    id: "Computer Science",
    name: "Computer Science",
    subtitle: "Algorithms, software engineering & tech systems",
    icon: "laptop",
  },
  {
    id: "Information System",
    name: "Information System",
    subtitle: "Information systems, enterprise tech & data management",
    icon: "server",
  },
  {
    id: "Applied Mathematics",
    name: "Applied Mathematics",
    subtitle: "Mathematical modeling, computation & analysis",
    icon: "calculator",
  },
  {
    id: "Applied Physics",
    name: "Applied Physics",
    subtitle: "Classical & modern physics, instrumentation & optics",
    icon: "globe",
  },
  {
    id: "Applied Chemistry",
    name: "Applied Chemistry",
    subtitle: "Chemical sciences, research labs & industrial chemistry",
    icon: "flask",
  },
  {
    id: "Applied Biology",
    name: "Applied Biology",
    subtitle: "Biological sciences, ecology, genetics & microbiology",
    icon: "leaf",
  },
  {
    id: "Statistics",
    name: "Statistics",
    subtitle: "Data analytics, probability & statistical modeling",
    icon: "chart",
  },
  {
    id: "Engineering(5 Kilo)",
    name: "Engineering (5 Kilo AAiT)",
    subtitle: "Engineering disciplines and technical computing",
    icon: "wrench",
  },
  {
    id: "Social Science(6 Kilo)",
    name: "Social Science (6 Kilo)",
    subtitle: "Social sciences, humanities & business studies",
    icon: "groups",
  },
  {
    id: "Freshman",
    name: "Freshman Stream",
    subtitle: "First-year general natural or social science students",
    icon: "school",
  },
  {
    id: "Other",
    name: "Other Department / Faculty",
    subtitle: "Other university academic programs and faculties",
    icon: "apps",
  },
];

interface YearMeta {
  id: string;
  name: string;
  subtitle: string;
}

const ACADEMIC_YEARS: YearMeta[] = [
  {
    id: "1st Year",
    name: "1st Year (Freshman)",
    subtitle: "Navigating first year campus life and fellowship community",
  },
  {
    id: "2nd Year",
    name: "2nd Year (Sophomore)",
    subtitle: "Putting down deep academic and spiritual roots",
  },
  {
    id: "3rd Year",
    name: "3rd Year (Junior)",
    subtitle: "Growing in spiritual maturity, fellowship, and service",
  },
  {
    id: "4th Year",
    name: "4th Year (Senior)",
    subtitle: "Campus leadership, project execution, and mentoring",
  },
  {
    id: "5th Year",
    name: "5th Year (Finalist / GC)",
    subtitle: "Finishing university strong and preparing for kingdom impact",
  },
  {
    id: "Other",
    name: "Other (Postgraduate / Alumni)",
    subtitle: "Postgraduate scholars, researchers, or fellowship visitors",
  },
];

export default function PersonalizationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();
  const user = useUserStore((state) => state.user);
  const signupStore = useSignupStore();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pagerRef = useRef<PagerView>(null);

  const initialName =
    (params.fullName as string) ||
    signupStore.fullName ||
    user?.fullName ||
    "";

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [name, setName] = useState<string>(initialName);
  const [nameFocused, setNameFocused] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(user?.profileImage || null);

  const [team, setTeam] = useState<string>(user?.team || "");
  const [department, setDepartment] = useState<string>(user?.department || "");
  const [customDepartment, setCustomDepartment] = useState<string>("");
  const [departmentSearch, setDepartmentSearch] = useState<string>("");

  const [year, setYear] = useState<string>(user?.yearOfStudy || "");
  const [telegram, setTelegram] = useState<string>(
    user?.telegramUserName?.replace(/^@/, "") || ""
  );
  const [telegramFocused, setTelegramFocused] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });

  // Smooth connected filling progress bar (like TNT Ethiopia)
  const progressAnim = useRef(new Animated.Value(1 / TOTAL_PAGES)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentPage + 1) / TOTAL_PAGES,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [currentPage, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const userFullName = user?.fullName;
  const avatarInitial = (() => {
    if (name.trim()) return name.trim().charAt(0).toUpperCase();
    if (userFullName?.trim()) return userFullName.trim().charAt(0).toUpperCase();
    return "F";
  })();

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setErrorModal({
          visible: true,
          title: "Permission Required",
          message:
            "Permission to access photo gallery is required to select a profile picture.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }
    } catch {
      setErrorModal({
        visible: true,
        title: "Image Upload",
        message: "Could not select picture. Please try again.",
      });
    }
  };

  const isPageValid = useCallback(
    (pageIndex: number): boolean => {
      switch (pageIndex) {
        case 0:
          return name.trim().length >= 2;
        case 1:
          return Boolean(team);
        case 2:
          if (department === "Other") {
            return customDepartment.trim().length > 0;
          }
          return Boolean(department);
        case 3:
          return Boolean(year);
        case 4:
          return true; // Telegram is optional
        default:
          return true;
      }
    },
    [name, team, department, customDepartment, year]
  );

  const isProgrammaticNav = useRef<boolean>(false);
  const currentPageRef = useRef<number>(currentPage);
  const isPageValidRef = useRef(isPageValid);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    isPageValidRef.current = isPageValid;
  }, [isPageValid]);

  const goToPage = (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= TOTAL_PAGES) return;
    Keyboard.dismiss();
    isProgrammaticNav.current = true;
    setCurrentPage(pageIndex);
    if (Platform.OS !== "web") {
      pagerRef.current?.setPage(pageIndex);
    }
  };

  // Allow natural backward swipe even when native forward scroll is locked
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          const activePage = currentPageRef.current;
          if (activePage > 0 && !isPageValidRef.current(activePage)) {
            return (
              gestureState.dx > 15 &&
              Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
            );
          }
          return false;
        },
        onPanResponderRelease: (_, gestureState) => {
          const activePage = currentPageRef.current;
          if (activePage > 0 && !isPageValidRef.current(activePage)) {
            if (gestureState.dx > 35 || gestureState.vx > 0.25) {
              goToPage(activePage - 1);
            }
          }
        },
      }),
    []
  );

  const handlePageScroll = (e: PagerViewOnPageScrollEvent) => {
    if (isProgrammaticNav.current) return;
    const { position, offset } = e.nativeEvent;
    const activePage = currentPageRef.current;

    if (
      !isPageValidRef.current(activePage) &&
      position >= activePage &&
      offset > 0.005
    ) {
      pagerRef.current?.setPageWithoutAnimation(activePage);
    }
  };

  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    const selectedPage = e.nativeEvent.position;

    if (isProgrammaticNav.current) {
      isProgrammaticNav.current = false;
      setCurrentPage(selectedPage);
      try {
        void Haptics.selectionAsync().catch(() => {});
      } catch {}
      return;
    }

    if (selectedPage < currentPage) {
      setCurrentPage(selectedPage);
      try {
        void Haptics.selectionAsync().catch(() => {});
      } catch {}
      return;
    }

    if (selectedPage > currentPage && !isPageValid(currentPage)) {
      pagerRef.current?.setPageWithoutAnimation(currentPage);
      return;
    }

    setCurrentPage(selectedPage);
    try {
      void Haptics.selectionAsync().catch(() => {});
    } catch {}
  };

  const handleScrollStateChanged = (e: PageScrollStateChangedNativeEvent) => {
    if (e.nativeEvent.pageScrollState === "dragging") {
      Keyboard.dismiss();
    }
  };

  const handleNextPress = async (pageIndex: number) => {
    if (!isPageValid(pageIndex) || submitting) return;

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}

    if (pageIndex < TOTAL_PAGES - 1) {
      goToPage(pageIndex + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBackPress = useCallback(() => {
    if (currentPage > 0) {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {}
      goToPage(currentPage - 1);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [currentPage, router]);

  useEffect(() => {
    const onBackPress = () => {
      if (currentPage > 0) {
        handleBackPress();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => backHandler.remove();
  }, [currentPage, handleBackPress]);

  const handleSkipPress = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    if (currentPage < TOTAL_PAGES - 1) {
      goToPage(currentPage + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const resolvedDepartment =
        department === "Other"
          ? customDepartment.trim() || "Other"
          : department;

      const formattedTelegram = telegram.trim()
        ? telegram.trim().startsWith("@")
          ? telegram.trim()
          : `@${telegram.trim()}`
        : "";

      await updateProfile({
        fullName: name.trim(),
        team: team,
        department: resolvedDepartment,
        yearOfStudy: year,
        telegramUserName: formattedTelegram,
        profileImage: image || undefined,
      });

      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});

      useSignupStore.getState().clear();
      router.replace("/(tabs)");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Could not save fellowship profile. Please try again.";

      setErrorModal({
        visible: true,
        title: "Setup Error",
        message: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    if (!departmentSearch.trim()) return FELLOWSHIP_DEPARTMENTS;
    const q = departmentSearch.toLowerCase();
    return FELLOWSHIP_DEPARTMENTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q)
    );
  }, [departmentSearch]);

  const renderPageContent = (pageIndex: number) => {
    switch (pageIndex) {
      case 0:
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.pageContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 24 : 0}
          >
            <ScrollView
              key="scroll-0"
              style={styles.pageScroll}
              contentContainerStyle={styles.scrollContentProfile}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled={true}
            >
              <View style={styles.headerBlock}>
                <Text
                  style={[
                    styles.titleText,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Get Connected
                </Text>
                <Text
                  style={[
                    styles.subtitleText,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Add your full name and a photo so brothers and sisters in the
                  fellowship family can know you.
                </Text>
              </View>

              <View style={styles.avatarSection}>
                <Pressable
                  onPress={handlePickImage}
                  accessibilityRole="button"
                  accessibilityLabel="Upload profile photo"
                  style={({ pressed }) => [
                    styles.avatarPressable,
                    pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <View
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#FFF7ED",
                        borderColor: PRIMARY,
                      },
                    ]}
                  >
                    {image ? (
                      <Image
                        source={{ uri: image }}
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarInitial}>{avatarInitial}</Text>
                      </View>
                    )}

                    <View style={styles.avatarCameraBadge}>
                      <Ionicons name="camera" size={16} color="#FFFFFF" />
                    </View>
                  </View>
                </Pressable>
                <Text
                  style={[
                    styles.avatarHintText,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Tap to add your photo
                </Text>
              </View>

              <View style={styles.inputFieldContainer}>
                <Text
                  style={[
                    styles.inputFieldLabel,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  FULL NAME
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (name.trim().length >= 2) {
                      void handleNextPress(0);
                    }
                  }}
                  style={[
                    styles.textInputBox,
                    {
                      backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                      borderColor: isDark ? "#27272A" : "#E2E8F0",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                    },
                    nameFocused && styles.textInputBoxFocused,
                  ]}
                />
              </View>
            </ScrollView>

            <View style={styles.bottomDockedAction}>
              <Pressable
                onPress={() => handleNextPress(0)}
                disabled={!isPageValid(0)}
                style={({ pressed }) => [
                  styles.actionButton,
                  !isPageValid(0) && styles.actionButtonDisabled,
                  pressed && isPageValid(0) && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.actionButtonText}>Continue</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        );

      case 1:
        return (
          <View style={styles.pageContainer}>
            <ScrollView
              key="scroll-1"
              style={styles.pageScroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              <View style={styles.headerBlock}>
                <Text
                  style={[
                    styles.titleText,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Which team do you serve in?
                </Text>
                <Text
                  style={[
                    styles.subtitleText,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Select your fellowship ministry team where you would love to
                  fellowship, grow, and serve together.
                </Text>
              </View>

              <View style={styles.cardsStack}>
                {FELLOWSHIP_TEAMS.map((item) => {
                  const isSelected = team === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        setTeam(item.id);
                        void Haptics.selectionAsync().catch(() => {});
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      style={({ pressed }) => [
                        styles.optionCard,
                        {
                          backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                          borderColor: isDark ? "#27272A" : "#E2E8F0",
                        },
                        isSelected && [
                          styles.optionCardActive,
                          {
                            backgroundColor: isDark
                              ? "rgba(255, 103, 25, 0.12)"
                              : "#FFFBF7",
                          },
                        ],
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <View style={styles.cardContentRow}>
                        <View style={styles.iconCircleWrapper}>
                          <View
                            style={[
                              styles.illustratedBadge,
                              {
                                backgroundColor: isSelected
                                  ? "rgba(255, 103, 25, 0.16)"
                                  : isDark
                                  ? "#27272A"
                                  : "#F1F5F9",
                              },
                            ]}
                          >
                            <AuthIcon
                              name={item.icon}
                              size={22}
                              color={isSelected ? PRIMARY : isDark ? "#CBD5E1" : "#64748B"}
                            />
                          </View>
                        </View>

                        <View style={styles.cardTextCol}>
                          <Text
                            style={[
                              styles.cardTitle,
                              { color: isDark ? "#FFFFFF" : "#0F172A" },
                              isSelected && styles.cardTitleActive,
                            ]}
                          >
                            {item.name}
                          </Text>
                          <Text
                            style={[
                              styles.cardSubtitle,
                              { color: isDark ? "#94A3B8" : "#64748B" },
                            ]}
                          >
                            {item.subtitle}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.radioOuter,
                            { borderColor: isSelected ? PRIMARY : isDark ? "#475569" : "#CBD5E1" },
                            isSelected && styles.radioOuterActive,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.bottomDockedAction}>
              <Pressable
                onPress={() => handleNextPress(1)}
                disabled={!isPageValid(1)}
                style={({ pressed }) => [
                  styles.actionButton,
                  !isPageValid(1) && styles.actionButtonDisabled,
                  pressed && isPageValid(1) && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.actionButtonText}>Next</Text>
              </Pressable>
            </View>
          </View>
        );

      case 2:
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.pageContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 24 : 0}
          >
            <ScrollView
              key="scroll-2"
              style={styles.pageScroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled={true}
            >
              <View style={styles.headerBlock}>
                <Text
                  style={[
                    styles.titleText,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  What is your department?
                </Text>
                <Text
                  style={[
                    styles.subtitleText,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Select your academic department at 4 Kilo or nearby AAU
                  campus.
                </Text>
              </View>

              {/* Search box for department */}
              <View
                style={[
                  styles.searchBox,
                  {
                    backgroundColor: isDark ? "#18181B" : "#F8FAFC",
                    borderColor: isDark ? "#27272A" : "#E2E8F0",
                  },
                ]}
              >
                <Ionicons
                  name="search"
                  size={18}
                  color={isDark ? "#94A3B8" : "#64748B"}
                />
                <TextInput
                  value={departmentSearch}
                  onChangeText={setDepartmentSearch}
                  placeholder="Search department (e.g. Computer Science, Math...)"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  style={[
                    styles.searchInput,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                  autoCorrect={false}
                />
                {departmentSearch.length > 0 && (
                  <Pressable
                    onPress={() => setDepartmentSearch("")}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={isDark ? "#94A3B8" : "#64748B"}
                    />
                  </Pressable>
                )}
              </View>

              {/* Department quick selector BottomSheet trigger */}
              <Pressable
                onPress={() => setIsSheetOpen(true)}
                style={({ pressed }) => [
                  styles.sheetTriggerRow,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 103, 25, 0.08)"
                      : "#FFF7ED",
                    borderColor: isDark ? "#27272A" : "#FED7AA",
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons name="list" size={18} color={PRIMARY} />
                <Text style={styles.sheetTriggerText}>
                  {department
                    ? `Selected: ${department} (Tap to change)`
                    : "Or choose from Bottom Sheet drawer"}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
              </Pressable>

              <View style={styles.cardsStack}>
                {filteredDepartments.map((dept) => {
                  const isSelected = department === dept.id;
                  return (
                    <Pressable
                      key={dept.id}
                      onPress={() => {
                        setDepartment(dept.id);
                        void Haptics.selectionAsync().catch(() => {});
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      style={({ pressed }) => [
                        styles.optionCard,
                        {
                          backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                          borderColor: isDark ? "#27272A" : "#E2E8F0",
                        },
                        isSelected && [
                          styles.optionCardActive,
                          {
                            backgroundColor: isDark
                              ? "rgba(255, 103, 25, 0.12)"
                              : "#FFFBF7",
                          },
                        ],
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <View style={styles.cardContentRow}>
                        <View style={styles.iconCircleWrapper}>
                          <View
                            style={[
                              styles.illustratedBadge,
                              {
                                backgroundColor: isSelected
                                  ? "rgba(255, 103, 25, 0.16)"
                                  : isDark
                                  ? "#27272A"
                                  : "#F1F5F9",
                              },
                            ]}
                          >
                            <AuthIcon
                              name={dept.icon}
                              size={22}
                              color={isSelected ? PRIMARY : isDark ? "#CBD5E1" : "#64748B"}
                            />
                          </View>
                        </View>

                        <View style={styles.cardTextCol}>
                          <Text
                            style={[
                              styles.cardTitle,
                              { color: isDark ? "#FFFFFF" : "#0F172A" },
                              isSelected && styles.cardTitleActive,
                            ]}
                          >
                            {dept.name}
                          </Text>
                          <Text
                            style={[
                              styles.cardSubtitle,
                              { color: isDark ? "#94A3B8" : "#64748B" },
                            ]}
                          >
                            {dept.subtitle}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.radioOuter,
                            { borderColor: isSelected ? PRIMARY : isDark ? "#475569" : "#CBD5E1" },
                            isSelected && styles.radioOuterActive,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}

                {department === "Other" && (
                  <View style={styles.customFieldBox}>
                    <Text
                      style={[
                        styles.inputFieldLabel,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      ENTER YOUR DEPARTMENT NAME
                    </Text>
                    <TextInput
                      value={customDepartment}
                      onChangeText={setCustomDepartment}
                      placeholder="e.g. Pharmacy, Civil Engineering, Architecture..."
                      placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                      autoCapitalize="words"
                      style={[
                        styles.textInputBox,
                        {
                          backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                          borderColor: isDark ? "#27272A" : "#E2E8F0",
                          color: isDark ? "#FFFFFF" : "#0F172A",
                        },
                        customDepartment.trim().length > 0 &&
                          styles.textInputBoxFocused,
                      ]}
                    />
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.bottomDockedAction}>
              <Pressable
                onPress={() => handleNextPress(2)}
                disabled={!isPageValid(2)}
                style={({ pressed }) => [
                  styles.actionButton,
                  !isPageValid(2) && styles.actionButtonDisabled,
                  pressed && isPageValid(2) && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.actionButtonText}>Next</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        );

      case 3:
        return (
          <View style={styles.pageContainer}>
            <ScrollView
              key="scroll-3"
              style={styles.pageScroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              <View style={styles.headerBlock}>
                <Text
                  style={[
                    styles.titleText,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  What academic year are you in?
                </Text>
                <Text
                  style={[
                    styles.subtitleText,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Help us connect you with your batch and fellowship year
                  programs.
                </Text>
              </View>

              <View style={styles.cardsStack}>
                {ACADEMIC_YEARS.map((y) => {
                  const isSelected = year === y.id;
                  return (
                    <Pressable
                      key={y.id}
                      onPress={() => {
                        setYear(y.id);
                        void Haptics.selectionAsync().catch(() => {});
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      style={({ pressed }) => [
                        styles.optionCard,
                        {
                          backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                          borderColor: isDark ? "#27272A" : "#E2E8F0",
                        },
                        isSelected && [
                          styles.optionCardActive,
                          {
                            backgroundColor: isDark
                              ? "rgba(255, 103, 25, 0.12)"
                              : "#FFFBF7",
                          },
                        ],
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <View style={styles.cardContentRow}>
                        <View style={styles.iconCircleWrapper}>
                          <View
                            style={[
                              styles.illustratedBadge,
                              {
                                backgroundColor: isSelected
                                  ? "rgba(255, 103, 25, 0.16)"
                                  : isDark
                                  ? "#27272A"
                                  : "#F1F5F9",
                              },
                            ]}
                          >
                            <AuthIcon
                              name="ribbon"
                              size={22}
                              color={isSelected ? PRIMARY : isDark ? "#CBD5E1" : "#64748B"}
                            />
                          </View>
                        </View>

                        <View style={styles.cardTextCol}>
                          <Text
                            style={[
                              styles.cardTitle,
                              { color: isDark ? "#FFFFFF" : "#0F172A" },
                              isSelected && styles.cardTitleActive,
                            ]}
                          >
                            {y.name}
                          </Text>
                          <Text
                            style={[
                              styles.cardSubtitle,
                              { color: isDark ? "#94A3B8" : "#64748B" },
                            ]}
                          >
                            {y.subtitle}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.radioOuter,
                            { borderColor: isSelected ? PRIMARY : isDark ? "#475569" : "#CBD5E1" },
                            isSelected && styles.radioOuterActive,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.bottomDockedAction}>
              <Pressable
                onPress={() => handleNextPress(3)}
                disabled={!isPageValid(3)}
                style={({ pressed }) => [
                  styles.actionButton,
                  !isPageValid(3) && styles.actionButtonDisabled,
                  pressed && isPageValid(3) && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.actionButtonText}>Next</Text>
              </Pressable>
            </View>
          </View>
        );

      case 4:
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.pageContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 24 : 0}
          >
            <ScrollView
              key="scroll-4"
              style={styles.pageScroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled={true}
            >
              <View style={styles.headerBlock}>
                <Text
                  style={[
                    styles.titleText,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Join the Community
                </Text>
                <Text
                  style={[
                    styles.subtitleText,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Add your Telegram username to be connected to fellowship
                  discussion channels, cell groups, and prayer updates.
                </Text>
              </View>

              <View style={styles.telegramInputSection}>
                <Text
                  style={[
                    styles.inputFieldLabel,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  TELEGRAM USERNAME (OPTIONAL)
                </Text>

                <View
                  style={[
                    styles.telegramBox,
                    {
                      backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                      borderColor: isDark ? "#27272A" : "#E2E8F0",
                    },
                    telegramFocused && styles.textInputBoxFocused,
                  ]}
                >
                  <View
                    style={[
                      styles.atBadge,
                      {
                        backgroundColor: isDark ? "#27272A" : "#F3F4F6",
                      },
                    ]}
                  >
                    <Ionicons name="send" size={16} color={PRIMARY} />
                    <Text
                      style={[
                        styles.atSymbol,
                        { color: isDark ? "#FFFFFF" : "#0F172A" },
                      ]}
                    >
                      @
                    </Text>
                  </View>
                  <TextInput
                    value={telegram}
                    onChangeText={setTelegram}
                    onFocus={() => setTelegramFocused(true)}
                    onBlur={() => setTelegramFocused(false)}
                    placeholder="username"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    style={[
                      styles.telegramInput,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  />
                  {telegram.length > 0 && (
                    <Pressable onPress={() => setTelegram("")} hitSlop={8}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={isDark ? "#94A3B8" : "#64748B"}
                      />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Fellowship welcome card */}
              <View
                style={[
                  styles.communityCard,
                  {
                    backgroundColor: isDark ? "#18181B" : "#FFF7ED",
                    borderColor: isDark ? "#27272A" : "#FED7AA",
                  },
                ]}
              >
                <View style={styles.communityCardIconBadge}>
                  <Ionicons name="heart" size={20} color={PRIMARY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.communityCardTitle,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    4 Kilo Fellowship Family
                  </Text>
                  <Text
                    style={[
                      styles.communityCardSubtitle,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    {'"That which we have seen and heard we declare unto you, that ye also may have fellowship with us." — 1 John 1:3'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomDockedAction}>
              <Pressable
                onPress={() => handleNextPress(4)}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.actionButton,
                  submitting && styles.actionButtonDisabled,
                  pressed && !submitting && { opacity: 0.9 },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Get Connected</Text>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#09090B" : "#FFFFFF" },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        animated={true}
      />

      <View style={styles.mainContainer}>
        {/* Top Navigation Bar with Connected Filling Progress Indicator */}
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={handleBackPress}
            hitSlop={8}
            android_ripple={{
              color: isDark
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.08)",
              borderless: true,
              radius: 20,
            }}
            style={({ pressed }) => [
              styles.navBackButton,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.04)",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "#FFFFFF" : "#0F172A"}
            />
          </Pressable>

          {/* Connected filling progress track */}
          <View
            style={[
              styles.continuousTrack,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "#E2E8F0",
              },
            ]}
          >
            <Animated.View
              style={[
                styles.continuousFill,
                { width: progressWidth, backgroundColor: PRIMARY },
              ]}
            />
          </View>

          {currentPage === 4 ? (
            <Pressable
              onPress={handleSkipPress}
              hitSlop={8}
              style={[
                styles.skipButton,
                { backgroundColor: isDark ? "#27272A" : "#F3F4F6" },
              ]}
            >
              <Text
                style={[
                  styles.skipText,
                  { color: isDark ? "#CBD5E1" : "#475569" },
                ]}
              >
                Skip
              </Text>
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Native Horizontal Pager for Question Flow */}
        {Platform.OS === "web" ? (
          <View style={styles.webContainer}>
            {renderPageContent(currentPage)}
          </View>
        ) : (
          <View style={styles.pagerContainer} {...panResponder.panHandlers}>
            <PagerView
              ref={pagerRef}
              style={styles.pagerView}
              initialPage={0}
              scrollEnabled={isPageValid(currentPage)}
              onPageScroll={handlePageScroll}
              onPageSelected={handlePageSelected}
              onPageScrollStateChanged={handleScrollStateChanged}
            >
              <View key="page-profile" style={styles.page}>
                {renderPageContent(0)}
              </View>
              <View key="page-team" style={styles.page}>
                {renderPageContent(1)}
              </View>
              <View key="page-dept" style={styles.page}>
                {renderPageContent(2)}
              </View>
              <View key="page-year" style={styles.page}>
                {renderPageContent(3)}
              </View>
              <View key="page-telegram" style={styles.page}>
                {renderPageContent(4)}
              </View>
            </PagerView>
          </View>
        )}
      </View>

      {/* Expo UI Native BottomSheet for Department Drawer */}
      {isSheetOpen && (
        <Host
          colorScheme={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none"
        >
          <BottomSheet
            isPresented={isSheetOpen}
            onDismiss={() => setIsSheetOpen(false)}
            snapPoints={["half", "full"]}
            showDragIndicator={true}
            contentPadding={0}
            scrimColor={isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)"}
            containerColor={isDark ? "#18181B" : "#FFFFFF"}
          >
            <RNHostView style={{ width: "100%" }}>
              <View
                style={[
                  styles.sheetContent,
                  { backgroundColor: isDark ? "#18181B" : "#FFFFFF" },
                ]}
              >
                <View style={styles.sheetHeader}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.sheetTitle,
                        { color: isDark ? "#FFFFFF" : "#0F172A" },
                      ]}
                    >
                      Select Department
                    </Text>
                    <Text
                      style={[
                        styles.sheetSubtitle,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      Choose your AAU department or field of study
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setIsSheetOpen(false)}
                    hitSlop={10}
                    style={[
                      styles.sheetCloseBtn,
                      { backgroundColor: isDark ? "#27272A" : "#F1F5F9" },
                    ]}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color={isDark ? "#94A3B8" : "#64748B"}
                    />
                  </Pressable>
                </View>

                <ScrollView
                  style={styles.sheetList}
                  contentContainerStyle={styles.sheetListContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                >
                  {FELLOWSHIP_DEPARTMENTS.map((dept) => {
                    const isSelected = department === dept.id;
                    return (
                      <Pressable
                        key={dept.id}
                        onPress={() => {
                          setDepartment(dept.id);
                          setIsSheetOpen(false);
                          void Haptics.selectionAsync().catch(() => {});
                        }}
                        style={({ pressed }) => [
                          styles.sheetRow,
                          isSelected && styles.sheetRowActive,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? "rgba(255, 103, 25, 0.16)"
                                : "#FFF7ED"
                              : isDark
                              ? "#1F2937"
                              : "#FAFAFA",
                            borderColor: isSelected
                              ? PRIMARY
                              : isDark
                              ? "#374151"
                              : "#E5E7EB",
                          },
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <View style={styles.sheetRowLeft}>
                          <View
                            style={[
                              styles.sheetIconBadge,
                              {
                                backgroundColor: isSelected
                                  ? "rgba(255, 103, 25, 0.18)"
                                  : isDark
                                  ? "#111827"
                                  : "#FFFFFF",
                              },
                            ]}
                          >
                            <AuthIcon
                              name={dept.icon}
                              size={18}
                              color={isSelected ? PRIMARY : isDark ? "#9CA3AF" : "#6B7280"}
                            />
                          </View>
                          <Text
                            style={[
                              styles.sheetRowText,
                              { color: isSelected ? PRIMARY : isDark ? "#FFFFFF" : "#0F172A" },
                            ]}
                          >
                            {dept.name}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={PRIMARY}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </RNHostView>
          </BottomSheet>
        </Host>
      )}

      <InfoModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        type="error"
        onClose={() => setErrorModal((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 10 : 6,
    paddingBottom: 10,
    minHeight: 48,
  },
  navBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  continuousTrack: {
    width: 160,
    height: 5,
    borderRadius: 2.5,
    overflow: "hidden",
  },
  continuousFill: {
    height: "100%",
    borderRadius: 2.5,
  },
  skipButton: {
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  pagerContainer: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  scrollContentProfile: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  headerBlock: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    lineHeight: 22,
  },

  /* Avatar Profile Picture Uploader */
  avatarSection: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 18,
  },
  avatarPressable: {
    width: 104,
    height: 104,
  },
  avatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 44,
    fontWeight: "800",
    color: PRIMARY,
  },
  avatarCameraBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarHintText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },

  /* Input fields */
  inputFieldContainer: {
    marginTop: 16,
  },
  inputFieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  textInputBox: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  textInputBoxFocused: {
    borderColor: PRIMARY,
  },

  /* Option Cards (Questions) */
  cardsStack: {
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  optionCardActive: {
    borderColor: PRIMARY,
    borderWidth: 2,
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircleWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  illustratedBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  cardTitleActive: {
    color: PRIMARY,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: PRIMARY,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },

  /* Search Box */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    fontWeight: "500",
  },
  sheetTriggerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  sheetTriggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY,
  },
  customFieldBox: {
    marginTop: 10,
  },

  /* Telegram step */
  telegramInputSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  telegramBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    gap: 10,
  },
  atBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  atSymbol: {
    fontSize: 15,
    fontWeight: "700",
  },
  telegramInput: {
    flex: 1,
    height: 54,
    fontSize: 16,
    fontWeight: "500",
  },
  communityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  communityCardIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 103, 25, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  communityCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  communityCardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },

  /* Bottom Action Button */
  bottomDockedAction: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 16 : 22,
  },
  actionButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionButtonDisabled: {
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  /* Native BottomSheet Content */
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 36,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetList: {
    maxHeight: 400,
  },
  sheetListContent: {
    gap: 10,
    paddingBottom: 20,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  sheetRowActive: {
    borderWidth: 2,
  },
  sheetRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  sheetIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetRowText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
});
