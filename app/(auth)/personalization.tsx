import AuthIcon, { AuthIconName } from "@/components/AuthIcon";
import { AuthButton } from "@/components/AuthButton";
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
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
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
    subtitle: "Enterprise data systems, analytics & business IT",
    icon: "server",
  },
  {
    id: "Software Engineering",
    name: "Software Engineering",
    subtitle: "Architecture, web/mobile apps & cloud services",
    icon: "laptop",
  },
  {
    id: "Electrical & Computer Engineering",
    name: "Electrical & Computer Eng.",
    subtitle: "Power systems, electronics, embedded & networks",
    icon: "server",
  },
  {
    id: "Mechanical Engineering",
    name: "Mechanical Engineering",
    subtitle: "Thermodynamics, robotics, design & manufacturing",
    icon: "wrench",
  },
  {
    id: "Civil & Environmental Engineering",
    name: "Civil & Environmental Eng.",
    subtitle: "Structures, transport, hydraulics & construction",
    icon: "wrench",
  },
  {
    id: "Chemical Engineering",
    name: "Chemical Engineering",
    subtitle: "Process simulation, biochemical & industrial energy",
    icon: "flask",
  },
  {
    id: "Biomedical Engineering",
    name: "Biomedical Engineering",
    subtitle: "Healthcare tech, medical instrumentation & biology",
    icon: "heart",
  },
  {
    id: "Mathematics",
    name: "Mathematics",
    subtitle: "Pure mathematics, applied math & mathematical modeling",
    icon: "calculator",
  },
  {
    id: "Physics",
    name: "Physics",
    subtitle: "Quantum, classical mechanics, materials & energy",
    icon: "flask",
  },
  {
    id: "Chemistry",
    name: "Chemistry",
    subtitle: "Analytical, organic, inorganic & industrial chemistry",
    icon: "flask",
  },
  {
    id: "Biology & Biotechnology",
    name: "Biology & Biotechnology",
    subtitle: "Microbiology, genetics, ecology & plant science",
    icon: "leaf",
  },
  {
    id: "Statistics",
    name: "Statistics",
    subtitle: "Data science, predictive modeling & research analysis",
    icon: "chart",
  },
  {
    id: "Geology / Earth Science",
    name: "Geology / Earth Science",
    subtitle: "Geophysics, hydrogeology, minerals & geo-hazards",
    icon: "globe",
  },
  {
    id: "Pharmacy",
    name: "Pharmacy",
    subtitle: "Pharmacology, clinical therapeutics & drug chemistry",
    icon: "heart",
  },
  {
    id: "Medicine & Health Science",
    name: "Medicine & Health Science",
    subtitle: "Clinical medicine, nursing & public health",
    icon: "heart",
  },
  {
    id: "Economics / Business",
    name: "Economics / Business",
    subtitle: "Micro/macroeconomics, finance & management",
    icon: "chart",
  },
  {
    id: "Architecture & Urban Planning",
    name: "Architecture & Urban Planning",
    subtitle: "Architectural design, housing & physical planning",
    icon: "wrench",
  },
  {
    id: "Other",
    name: "Other AAU Department",
    subtitle: "Postgraduate programs or unlisted AAU departments",
    icon: "apps",
  },
];

interface AcademicYearMeta {
  id: string;
  name: string;
  subtitle: string;
}

const FELLOWSHIP_YEARS: AcademicYearMeta[] = [
  {
    id: "1st Year",
    name: "1st Year (Freshman)",
    subtitle: "New to campus life, exploring fellowship and academic pace",
  },
  {
    id: "2nd Year",
    name: "2nd Year (Sophomore)",
    subtitle: "Settling into faculty major and ministry commitment",
  },
  {
    id: "3rd Year",
    name: "3rd Year (Junior)",
    subtitle: "Deepening spiritual walk, discipleship and course projects",
  },
  {
    id: "4th Year",
    name: "4th Year (Senior)",
    subtitle: "Senior coursework, cell group mentorship and leadership",
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

  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });

  // Smooth continuous filling progress bar matching TNT Ethiopia
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

  const avatarInitial = (() => {
    if (name.trim()) return name.trim().charAt(0).toUpperCase();
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
    return "F";
  })();

  const isPageValid = useCallback(
    (pageIndex: number): boolean => {
      switch (pageIndex) {
        case 0:
          return name.trim().length >= 2;
        case 1:
          return team.trim().length > 0;
        case 2:
          if (!department.trim()) return false;
          if (department === "Other") return customDepartment.trim().length > 0;
          return true;
        case 3:
          return year.trim().length > 0;
        case 4:
          return true;
        default:
          return true;
      }
    },
    [name, team, department, customDepartment, year]
  );

  const isPageValidRef = useRef(isPageValid);
  useEffect(() => {
    isPageValidRef.current = isPageValid;
  }, [isPageValid]);

  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const isProgrammaticNav = useRef(false);

  const goToPage = useCallback((targetPage: number) => {
    if (targetPage < 0 || targetPage >= TOTAL_PAGES) return;
    Keyboard.dismiss();
    isProgrammaticNav.current = true;
    setCurrentPage(targetPage);
    pagerRef.current?.setPage(targetPage);
  }, []);

  const handleNextPress = useCallback(
    (pageIndex: number) => {
      if (!isPageValid(pageIndex)) return;
      if (pageIndex < TOTAL_PAGES - 1) {
        goToPage(pageIndex + 1);
      } else {
        void handleComplete();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPageValid, goToPage]
  );

  const handleBackPress = useCallback(() => {
    if (currentPage > 0) {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      goToPage(currentPage - 1);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(auth)/sign-in");
      }
    }
  }, [currentPage, goToPage, router]);

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

  const handleSkipPress = () => {
    if (currentPage < TOTAL_PAGES - 1) {
      goToPage(currentPage + 1);
    } else {
      void handleComplete();
    }
  };

  // Allow natural backward swipe even when forward scroll is locked
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
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
    [goToPage]
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

  const handleScrollStateChanged = (
    e: PageScrollStateChangedNativeEvent
  ) => {
    if (e.nativeEvent.pageScrollState === "idle") {
      isProgrammaticNav.current = false;
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setErrorModal({
          visible: true,
          title: "Permission Required",
          message:
            "Camera roll access is needed to pick your fellowship profile photo.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
        try {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        } catch {}
      }
    } catch {
      setErrorModal({
        visible: true,
        title: "Photo Error",
        message: "Could not select the photo. Please try again.",
      });
    }
  };

  const handleComplete = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const finalDepartment =
        department === "Other" && customDepartment.trim()
          ? customDepartment.trim()
          : department;

      const finalTelegram = telegram.trim()
        ? telegram.trim().startsWith("@")
          ? telegram.trim()
          : `@${telegram.trim()}`
        : undefined;

      await updateProfile({
        fullName: name.trim(),
        profileImage: image || undefined,
        team: team.trim(),
        department: finalDepartment,
        yearOfStudy: year.trim(),
        telegramUserName: finalTelegram,
      });

      try {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch {}

      router.replace("/(tabs)");
    } catch (err: any) {
      setErrorModal({
        visible: true,
        title: "Update Failed",
        message:
          err?.message ||
          "Could not save your fellowship profile. Please check your internet connection and try again.",
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
                  Join the Fellowship
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
                  accessibilityLabel="Profile picture. Tap to choose photo from gallery"
                  style={({ pressed }) => [
                    styles.avatarPressable,
                    pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <View
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: PRIMARY,
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
              </View>

              <View style={styles.inputFieldContainer}>
                <Text
                  style={[
                    styles.inputFieldLabel,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  NAME
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
                      handleNextPress(0);
                    }
                  }}
                  style={[
                    styles.textInputBox,
                    {
                      backgroundColor: isDark ? "#18181B" : "#F8FAFC",
                      borderColor: isDark ? "#27272A" : "#E2E8F0",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                    },
                    nameFocused && styles.textInputBoxFocused,
                  ]}
                />
              </View>
            </ScrollView>

            <View style={styles.bottomDockedAction}>
              <AuthButton
                title="Continue"
                onPress={() => handleNextPress(0)}
                disabled={!isPageValid(0)}
                loading={false}
                variant="primary"
                shape="pill"
                isDark={isDark}
                style={styles.actionButton}
              />
            </View>
          </KeyboardAvoidingView>
        );

      case 1:
        return (
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
                Choose your team
              </Text>
              <Text
                style={[
                  styles.subtitleText,
                  { color: isDark ? "#94A3B8" : "#64748B" },
                ]}
              >
                Select your primary fellowship ministry team where you want to serve, grow, and minister together.
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
                            ? "rgba(255, 103, 25, 0.14)"
                            : "#FFF7ED",
                          borderColor: PRIMARY,
                        },
                      ],
                      pressed && Platform.OS === "ios" && styles.optionCardPressed,
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
                            size={24}
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
                          {
                            borderColor: isSelected
                              ? PRIMARY
                              : isDark
                              ? "#475569"
                              : "#CBD5E1",
                            backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                          },
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

            <View style={styles.stepButtonWrapper}>
              <AuthButton
                title="Next"
                onPress={() => handleNextPress(1)}
                disabled={!isPageValid(1)}
                loading={false}
                variant="primary"
                shape="pill"
                isDark={isDark}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
        );

      case 2:
        return (
          <ScrollView
            key="scroll-2"
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
                Choose your department
              </Text>
              <Text
                style={[
                  styles.subtitleText,
                  { color: isDark ? "#94A3B8" : "#64748B" },
                ]}
              >
                Select your field of study at AAU 4 Kilo to connect with fellow campus coursemates.
              </Text>
            </View>

            {/* TNT-Ethiopia Pill Search box */}
            <View
              style={[
                styles.uniSearchBox,
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
                placeholder="Search department..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={[
                  styles.uniSearchInput,
                  { color: isDark ? "#FFFFFF" : "#0F172A" },
                ]}
                autoCorrect={false}
              />
              {departmentSearch.length > 0 && (
                <Pressable onPress={() => setDepartmentSearch("")} hitSlop={6}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={isDark ? "#94A3B8" : "#64748B"}
                  />
                </Pressable>
              )}
            </View>

            {/* Native BottomSheet Drawer Trigger */}
            <Pressable
              onPress={() => setIsSheetOpen(true)}
              style={({ pressed }) => [
                styles.sheetTriggerRow,
                {
                  backgroundColor: isDark ? "#1E293B" : "#FFF7ED",
                  borderColor: isDark ? "#334155" : "#FFEDD5",
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="list" size={18} color={PRIMARY} />
                <Text
                  style={[
                    styles.sheetTriggerText,
                    { color: isDark ? "#F8FAFC" : "#C2410C" },
                  ]}
                >
                  Browse all AAU departments ({FELLOWSHIP_DEPARTMENTS.length})
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isDark ? "#94A3B8" : "#C2410C"}
              />
            </Pressable>

            <View style={styles.cardsStack}>
              {filteredDepartments.map((item) => {
                const isSelected = department === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setDepartment(item.id);
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
                            ? "rgba(255, 103, 25, 0.14)"
                            : "#FFF7ED",
                          borderColor: PRIMARY,
                        },
                      ],
                      pressed && Platform.OS === "ios" && styles.optionCardPressed,
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
                            size={24}
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
                          {
                            borderColor: isSelected
                              ? PRIMARY
                              : isDark
                              ? "#475569"
                              : "#CBD5E1",
                            backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                          },
                          isSelected && styles.radioOuterActive,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </View>
                  </Pressable>
                );
              })}

              {/* Other Custom Department Input */}
              {department === "Other" && (
                <View style={styles.customDeptContainer}>
                  <Text
                    style={[
                      styles.inputFieldLabel,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    SPECIFY YOUR DEPARTMENT
                  </Text>
                  <TextInput
                    value={customDepartment}
                    onChangeText={setCustomDepartment}
                    placeholder="Enter department name"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    style={[
                      styles.textInputBox,
                      {
                        backgroundColor: isDark ? "#18181B" : "#F8FAFC",
                        borderColor: PRIMARY,
                        color: isDark ? "#FFFFFF" : "#0F172A",
                      },
                    ]}
                  />
                </View>
              )}
            </View>

            <View style={styles.stepButtonWrapper}>
              <AuthButton
                title="Next"
                onPress={() => handleNextPress(2)}
                disabled={!isPageValid(2)}
                loading={false}
                variant="primary"
                shape="pill"
                isDark={isDark}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
        );

      case 3:
        return (
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
                Select your academic year
              </Text>
              <Text
                style={[
                  styles.subtitleText,
                  { color: isDark ? "#94A3B8" : "#64748B" },
                ]}
              >
                Tell us where you are on your campus journey so we can tailor cell groups and resources.
              </Text>
            </View>

            <View style={styles.cardsStack}>
              {FELLOWSHIP_YEARS.map((item) => {
                const isSelected = year === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setYear(item.id);
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
                            ? "rgba(255, 103, 25, 0.14)"
                            : "#FFF7ED",
                          borderColor: PRIMARY,
                        },
                      ],
                      pressed && Platform.OS === "ios" && styles.optionCardPressed,
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
                            name="year"
                            size={24}
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
                          {
                            borderColor: isSelected
                              ? PRIMARY
                              : isDark
                              ? "#475569"
                              : "#CBD5E1",
                            backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                          },
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

            <View style={styles.stepButtonWrapper}>
              <AuthButton
                title="Next"
                onPress={() => handleNextPress(3)}
                disabled={!isPageValid(3)}
                loading={false}
                variant="primary"
                shape="pill"
                isDark={isDark}
                style={styles.actionButton}
              />
            </View>
          </ScrollView>
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
                  Stay connected
                </Text>
                <Text
                  style={[
                    styles.subtitleText,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Add your Telegram username so your team leader and cell group can add you to the fellowship channels.
                </Text>
              </View>

              <View style={styles.inputFieldContainer}>
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
                      backgroundColor: isDark ? "#18181B" : "#F8FAFC",
                      borderColor: isDark ? "#27272A" : "#E2E8F0",
                    },
                  ]}
                >
                  <View style={styles.atBadge}>
                    <Text style={styles.atText}>@</Text>
                  </View>
                  <TextInput
                    value={telegram}
                    onChangeText={(val) => setTelegram(val.replace(/^@/, ""))}
                    placeholder="username"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={() => void handleComplete()}
                    style={[
                      styles.telegramInput,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  />
                  {telegram.length > 0 && (
                    <Pressable onPress={() => setTelegram("")} hitSlop={6}>
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={isDark ? "#94A3B8" : "#64748B"}
                      />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Fellowship Welcome Card */}
              <View
                style={[
                  styles.communityCard,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#FFF7ED",
                    borderColor: isDark ? "#334155" : "#FFEDD5",
                  },
                ]}
              >
                <View style={styles.communityCardRow}>
                  <View style={styles.communityCardIconBadge}>
                    <Ionicons name="sparkles" size={20} color={PRIMARY} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.communityCardTitle,
                        { color: isDark ? "#F8FAFC" : "#C2410C" },
                      ]}
                    >
                      Welcome to the Family
                    </Text>
                    <Text
                      style={[
                        styles.communityCardBody,
                        { color: isDark ? "#CBD5E1" : "#7C2D12" },
                      ]}
                    >
                      {'"That which we have seen and heard declare we unto you, that ye also may have fellowship with us." — 1 John 1:3'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.stepButtonWrapper}>
                <AuthButton
                  title="Get Connected"
                  onPress={() => void handleComplete()}
                  disabled={!isPageValid(4)}
                  loading={submitting}
                  variant="primary"
                  shape="pill"
                  isDark={isDark}
                  style={styles.actionButton}
                />
              </View>
            </ScrollView>
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
      edges={["top", "bottom", "left", "right"]}
    >
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        animated={true}
      />

      <View style={styles.mainContainer}>
        {/* Top Navigation Bar with Connected Filling Progress Indicator */}
        <View style={styles.topBar}>
          {currentPage > 0 && (
            <Pressable
              onPress={handleBackPress}
              hitSlop={8}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Back to previous step"
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={isDark ? "#FFFFFF" : "#0F172A"}
              />
            </Pressable>
          )}

          <View
            style={[
              styles.continuousTrack,
              {
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.14)"
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

          {currentPage === 4 && (
            <Pressable
              onPress={handleSkipPress}
              hitSlop={8}
              style={[
                styles.skipButton,
                {
                  backgroundColor: isDark ? "#27272A" : "#F1F5F9",
                },
              ]}
            >
              <Text
                style={[
                  styles.skipText,
                  { color: isDark ? "#CBD5E1" : "#64748B" },
                ]}
              >
                Skip
              </Text>
            </Pressable>
          )}
        </View>

        {/* Horizontal Pager for Question Flow */}
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

                {/* Search Box in Sheet */}
                <View
                  style={[
                    styles.uniSearchBox,
                    {
                      backgroundColor: isDark ? "#27272A" : "#F8FAFC",
                      borderColor: isDark ? "#3F3F46" : "#E2E8F0",
                      marginBottom: 12,
                    },
                  ]}
                >
                  <Ionicons
                    name="search"
                    size={16}
                    color={isDark ? "#94A3B8" : "#64748B"}
                  />
                  <TextInput
                    value={departmentSearch}
                    onChangeText={setDepartmentSearch}
                    placeholder="Filter departments..."
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    style={[
                      styles.uniSearchInput,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                    autoCorrect={false}
                  />
                </View>

                <ScrollView
                  style={styles.sheetList}
                  contentContainerStyle={styles.sheetListContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                >
                  {filteredDepartments.map((dept) => {
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
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? "rgba(255, 103, 25, 0.16)"
                                : "#FFF7ED"
                              : "transparent",
                          },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            flex: 1,
                          }}
                        >
                          <AuthIcon
                            name={dept.icon}
                            size={18}
                            color={isSelected ? PRIMARY : isDark ? "#94A3B8" : "#64748B"}
                          />
                          <Text
                            style={[
                              styles.sheetRowText,
                              {
                                color: isSelected
                                  ? PRIMARY
                                  : isDark
                                  ? "#FFFFFF"
                                  : "#0F172A",
                              },
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  continuousTrack: {
    width: 170,
    height: 5,
    borderRadius: 2.5,
    overflow: "hidden",
  },
  continuousFill: {
    height: "100%",
    borderRadius: 2.5,
  },
  skipButton: {
    position: "absolute",
    right: 20,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "600",
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
    paddingTop: 18,
    paddingBottom: 40,
  },
  scrollContentProfile: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  headerBlock: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 38,
    marginBottom: 10,
    ...Platform.select({
      ios: { fontFamily: "Georgia" },
      android: { fontFamily: "serif" },
    }),
  },
  subtitleText: {
    fontSize: 16,
    lineHeight: 24,
  },

  /* Step 1 Avatar Profile Picture Uploader (TNT Ethiopia design) */
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
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  avatarFallback: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 46,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  avatarCameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#C2410C",
    borderWidth: 2.5,
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
        elevation: 2,
      },
    }),
  },

  /* Name Input */
  inputFieldContainer: {
    marginTop: 20,
  },
  inputFieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  textInputBox: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  textInputBoxFocused: {
    borderColor: PRIMARY,
  },

  /* Buttons */
  actionButton: {
    width: "100%",
  },
  bottomDockedAction: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 14 : 20,
  },
  stepButtonWrapper: {
    marginTop: 20,
    paddingBottom: 24,
  },

  /* TNT Ethiopia Option Cards */
  cardsStack: {
    gap: 14,
    marginBottom: 20,
  },
  optionCard: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  optionCardActive: {
    borderWidth: 2,
  },
  optionCardPressed: {
    transform: [{ scale: 0.99 }],
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircleWrapper: {
    marginRight: 16,
  },
  illustratedBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.2,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY,
  },

  /* TNT Ethiopia Pill Search Box */
  uniSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  uniSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 0,
  },
  sheetTriggerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sheetTriggerText: {
    fontSize: 13,
    fontWeight: "600",
  },
  customDeptContainer: {
    marginTop: 10,
  },

  /* Telegram Field */
  telegramBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    gap: 10,
  },
  atBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  atText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  telegramInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },

  /* Community Scripture Card */
  communityCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  communityCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  communityCardIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 103, 25, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  communityCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  communityCardBody: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },

  /* Native BottomSheet Content */
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    flex: 1,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
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
  sheetList: {
    flex: 1,
  },
  sheetListContent: {
    paddingBottom: 20,
    gap: 6,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  sheetRowText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
