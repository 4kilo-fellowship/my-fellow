import AppButton from "@/components/AppButton";
import AuthIcon, { AuthIconName } from "@/components/AuthIcon";
import { InfoModal } from "@/components/Modals/InfoModal";
import { PRIMARY } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSignupStore } from "@/stores/signup.store";
import { useUserStore } from "@/stores/user.store";
import { getPrefilledAvatar } from "@/utils/avatar";
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
  TouchableOpacity,
  type TextInputInstance,
  useWindowDimensions,
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
    id: "Worship",
    name: "Worship",
    subtitle: "Acoustic teams, praise, and leading fellowship worship.",
    icon: "music",
  },
  {
    id: "I4U",
    name: "I4U",
    subtitle: "Care, encouragement, mutual support, and student welfare.",
    icon: "heart",
  },
  {
    id: "Media",
    name: "Media & Literature",
    subtitle: "Media, literature, publications, and fellowship media.",
    icon: "video",
  },
  {
    id: "Prayer",
    name: "Prayer",
    subtitle: "Intercession, morning prayers, and fellowship fasting nights.",
    icon: "hand",
  },
  {
    id: "Freshman",
    name: "Freshman",
    subtitle: "Welcoming and guiding new campus students in faith and life.",
    icon: "school",
  },
  {
    id: "Other",
    name: "Other Ministry",
    subtitle: "General fellowship member and community ministries.",
    icon: "apps",
  },
];

const TEAM_PAIRS: [MinistryTeamMeta, MinistryTeamMeta][] = [
  [FELLOWSHIP_TEAMS[0], FELLOWSHIP_TEAMS[1]],
  [FELLOWSHIP_TEAMS[2], FELLOWSHIP_TEAMS[3]],
  [FELLOWSHIP_TEAMS[4], FELLOWSHIP_TEAMS[5]],
  [FELLOWSHIP_TEAMS[6], FELLOWSHIP_TEAMS[7]],
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
  const nameInputRef = useRef<TextInputInstance | null>(null);

  const initialName =
    (params.fullName as string) ||
    signupStore.fullName ||
    user?.fullName ||
    "";

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [name, setName] = useState<string>(initialName);
  const [nameFocused, setNameFocused] = useState<boolean>(true);

  // Deterministically prefill cool avatar using phone number / ID / name
  const defaultGeneratedAvatar = useMemo(() => {
    if (user?.profileImage) return user.profileImage;
    return getPrefilledAvatar(
      user?.phoneNumber ||
        signupStore.phoneNumber ||
        user?.id ||
        (params.fullName as string) ||
        "fellow_member"
    );
  }, [
    user?.profileImage,
    user?.phoneNumber,
    signupStore.phoneNumber,
    user?.id,
    params.fullName,
  ]);

  const [image, setImage] = useState<string>(
    user?.profileImage || defaultGeneratedAvatar
  );

  // Auto focus Name input when landing on screen from auth
  useEffect(() => {
    nameInputRef.current?.focus();
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.floor((windowWidth - 40 - 12) / 2);

  const [team, setTeam] = useState<string>(user?.team || "");
  const [department, setDepartment] = useState<string>(user?.department || "");
  const [customDepartment, setCustomDepartment] = useState<string>("");
  const [departmentSearch, setDepartmentSearch] = useState<string>("");

  const [year, setYear] = useState<string>(user?.yearOfStudy || "");
  const [telegram, setTelegram] = useState<string>(
    user?.telegramUserName?.replace(/^@/, "") || ""
  );

  const naturalRipple = useMemo(
    () => ({
      color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
      borderless: false,
      foreground: true,
    }),
    [isDark]
  );

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
          return name.trim().length >= 3;
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

  // PanResponder to allow natural backward gesture even when native forward scroll is locked
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
    if (e.nativeEvent.pageScrollState === "dragging") {
      Keyboard.dismiss();
    }
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

  const deptPairs = useMemo(() => {
    const pairs: [DepartmentMeta, DepartmentMeta?][] = [];
    for (let i = 0; i < filteredDepartments.length; i += 2) {
      pairs.push([filteredDepartments[i], filteredDepartments[i + 1]]);
    }
    return pairs;
  }, [filteredDepartments]);

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
                        backgroundColor: isDark ? "#27272A" : "#FFF7ED",
                        borderColor: PRIMARY,
                        borderWidth: 2.5,
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
                      <Ionicons name="camera" size={15} color="#FFFFFF" />
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
                  FULL NAME
                </Text>
                <Pressable
                  onPress={() => nameInputRef.current?.focus()}
                  onPressIn={() => setNameFocused(true)}
                  style={[
                    styles.nameInputBoxContainer,
                    {
                      backgroundColor: isDark ? "#18181B" : "#F8FAFC",
                      borderColor: nameFocused
                        ? PRIMARY
                        : isDark
                        ? "#27272A"
                        : "#E2E8F0",
                    },
                  ]}
                >
                  <View style={styles.nameInputIcon}>
                    <AuthIcon
                      name="person"
                      size={20}
                      color={nameFocused ? PRIMARY : isDark ? "#94A3B8" : "#64748B"}
                    />
                  </View>
                  <TextInput
                    ref={nameInputRef}
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
                      if (name.trim().length >= 3) {
                        handleNextPress(0);
                      }
                    }}
                    style={[
                      styles.nameInputText,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  />
                </Pressable>
              </View>

              {/* Continue Button placed right near Name field */}
              <View style={styles.nameActionButtonWrapper}>
                <AppButton
                  title="Continue"
                  onPress={() => handleNextPress(0)}
                  disabled={!isPageValid(0)}
                  loading={false}
                  variant="primary"
                  size="lg"
                  isDark={isDark}
                />
              </View>
            </ScrollView>
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

            {/* 2-Column Grid (centered on screen, matching reference) */}
            <View style={styles.gridContainer}>
              {TEAM_PAIRS.map(([item1, item2], rowIndex) => (
                <View key={`team-row-${rowIndex}`} style={styles.gridRow}>
                  {[item1, item2].map((item) => {
                    const isSelected =
                      team === item.id ||
                      team === item.name ||
                      (item.id === "Worship" && team === "Worship & Choir") ||
                      (item.id === "I4U" && team.startsWith("I4U")) ||
                      (item.id === "Media" && team.startsWith("Media"));
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.gridCardOuter,
                          isDark && styles.gridCardOuterDark,
                          isSelected && styles.gridCardOuterSelected,
                          isSelected && isDark && styles.gridCardOuterSelectedDark,
                        ]}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setTeam(item.id);
                            requestAnimationFrame(() => {
                              void Haptics.selectionAsync().catch(() => {});
                            });
                          }}
                          activeOpacity={1}
                          accessibilityRole="button"
                          accessibilityLabel={`${item.name} team${isSelected ? ", selected" : ""}`}
                          accessibilityState={{ selected: isSelected }}
                          style={styles.gridCardInner}
                        >
                          <View style={styles.gridCardIconWrap}>
                            <AuthIcon
                              name={item.icon}
                              size={28}
                              color={
                                isSelected
                                  ? PRIMARY
                                  : isDark
                                  ? "#F1F5F9"
                                  : "#1E293B"
                              }
                            />
                          </View>
                          <Text
                            numberOfLines={2}
                            style={[
                              styles.gridCardTitle,
                              isDark && styles.gridCardTitleDark,
                              isSelected && styles.gridCardTitleSelected,
                            ]}
                          >
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.stepButtonWrapper}>
              <AppButton
                title="Next"
                onPress={() => handleNextPress(1)}
                disabled={!isPageValid(1)}
                loading={false}
                variant="primary"
                size="lg"
                isDark={isDark}
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

            {/* Department Search Input */}
            <View
              style={[
                styles.deptSearchContainer,
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
                placeholder="Search AAU department..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                style={[
                  styles.deptSearchInput,
                  { color: isDark ? "#FFFFFF" : "#0F172A" },
                ]}
                autoCorrect={false}
              />
              {departmentSearch.length > 0 && (
                <Pressable onPress={() => setDepartmentSearch("")} hitSlop={8}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={isDark ? "#94A3B8" : "#64748B"}
                  />
                </Pressable>
              )}
            </View>

            {/* 2-Column Grid for Departments */}
            <View style={styles.gridContainer}>
              {deptPairs.map(([dept1, dept2], rowIndex) => (
                <View key={`dept-row-${rowIndex}`} style={styles.gridRow}>
                  {[dept1, dept2].map((item, idx) => {
                    if (!item) {
                      return (
                        <View
                          key={`empty-placeholder-${idx}`}
                          style={{ width: cardWidth }}
                        />
                      );
                    }
                    const isSelected =
                      department === item.id || department === item.name;
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.gridCardOuter,
                          isDark && styles.gridCardOuterDark,
                          isSelected && styles.gridCardOuterSelected,
                          isSelected && isDark && styles.gridCardOuterSelectedDark,
                        ]}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setDepartment(item.id);
                            requestAnimationFrame(() => {
                              void Haptics.selectionAsync().catch(() => {});
                            });
                          }}
                          activeOpacity={1}
                          accessibilityRole="button"
                          accessibilityLabel={`${item.name} department${isSelected ? ", selected" : ""}`}
                          accessibilityState={{ selected: isSelected }}
                          style={styles.gridCardInner}
                        >
                          <View style={styles.gridCardIconWrap}>
                            <AuthIcon
                              name={item.icon}
                              size={28}
                              color={
                                isSelected
                                  ? PRIMARY
                                  : isDark
                                  ? "#F1F5F9"
                                  : "#1E293B"
                              }
                            />
                          </View>
                          <Text
                            numberOfLines={2}
                            style={[
                              styles.gridCardTitle,
                              isDark && styles.gridCardTitleDark,
                              isSelected && styles.gridCardTitleSelected,
                            ]}
                          >
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Empty search results state */}
            {filteredDepartments.length === 0 && (
              <View style={styles.emptySearchContainer}>
                <Ionicons
                  name="search-outline"
                  size={32}
                  color={isDark ? "#64748B" : "#94A3B8"}
                />
                <Text
                  style={[
                    styles.emptySearchText,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  No departments found matching &quot;{departmentSearch}&quot;
                </Text>
              </View>
            )}

            {/* Other Custom Department Input */}
            {department === "Other" && (
              <View style={styles.customDeptContainer}>
                <Text
                  style={[
                    styles.inputFieldLabel,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  SPECIFY YOUR AAU DEPARTMENT
                </Text>
                <TextInput
                  value={customDepartment}
                  onChangeText={setCustomDepartment}
                  placeholder="Enter your department name"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  autoCapitalize="words"
                  autoCorrect={false}
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

            <View style={styles.stepButtonWrapper}>
              <AppButton
                title="Next"
                onPress={() => handleNextPress(2)}
                disabled={!isPageValid(2)}
                loading={false}
                variant="primary"
                size="lg"
                isDark={isDark}
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

            {/* Inline Year Grid — 2-column small cards */}
            <View style={styles.yearGrid}>
              {FELLOWSHIP_YEARS.map((item) => {
                const isSelected = year === item.id;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.yearCardOuter,
                      isDark && styles.yearCardOuterDark,
                      isSelected && styles.yearCardOuterSelected,
                      isSelected && isDark && styles.yearCardOuterSelectedDark,
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setYear(item.id);
                        requestAnimationFrame(() => {
                          void Haptics.selectionAsync().catch(() => {});
                        });
                      }}
                      activeOpacity={1}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.name}${isSelected ? ", selected" : ""}`}
                      accessibilityState={{ selected: isSelected }}
                      style={styles.yearCardInner}
                    >
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.yearCardText,
                          isDark && styles.yearCardTextDark,
                          isSelected && styles.yearCardTextSelected,
                        ]}
                      >
                        {item.id}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.yearCardSubText,
                          isDark && styles.yearCardSubTextDark,
                          isSelected && styles.yearCardSubTextSelected,
                        ]}
                      >
                        {item.name.replace(item.id + " ", "").replace(/[()]/g, "").trim()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <View style={styles.stepButtonWrapper}>
              <AppButton
                title="Next"
                onPress={() => handleNextPress(3)}
                disabled={!isPageValid(3)}
                loading={false}
                variant="primary"
                size="lg"
                isDark={isDark}
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

              {/* Fellowship Welcome Scripture */}
              <View
                style={[
                  styles.communityCard,
                  {
                    backgroundColor: isDark ? "#18181B" : "#F8FAFC",
                    borderColor: isDark ? "#27272A" : "#E2E8F0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.communityCardBody,
                    {
                      color: isDark ? "#94A3B8" : "#64748B",
                      textAlign: "center",
                      fontStyle: "italic",
                    },
                  ]}
                >
                  {'"That which we have seen and heard declare we unto you, that ye also may have fellowship with us."'}
                </Text>
                <Text
                  style={[
                    styles.communityCardBody,
                    {
                      color: isDark ? "#64748B" : "#94A3B8",
                      textAlign: "center",
                      marginTop: 6,
                      fontSize: 12,
                    },
                  ]}
                >
                  — 1 John 1:3
                </Text>
              </View>

              <View style={styles.stepButtonWrapper}>
                <AppButton
                  title="Get Connected"
                  onPress={() => void handleComplete()}
                  disabled={!isPageValid(4)}
                  loading={submitting}
                  variant="primary"
                  size="lg"
                  isDark={isDark}
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
    paddingHorizontal: 20,
    paddingTop: 24,
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
  nameInputBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 16,
    gap: 12,
  },
  nameInputIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  nameInputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    height: "100%",
  },
  nameActionButtonWrapper: {
    marginTop: 24,
    marginBottom: 20,
  },
  textInputBox: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "500",
  },

  /* 2-Column Grid (Teams & Departments, centered with native ripple) */
  gridContainer: {
    width: "100%",
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  // Outer View: border, bg, shadow, overflow:hidden — the visual card shell
  gridCardOuter: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "solid",
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },  gridCardOuterDark: {
    borderColor: "#27272A",
    backgroundColor: "#18181B",
  },
  gridCardOuterSelected: {
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: "#FFF7ED",
  },
  gridCardOuterSelectedDark: {
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
  },
  // Inner Pressable: absolutely fills the card, centers content, handles ripple
  gridCardInner: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  gridCardIconWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
    color: "#0F172A",
  },
  gridCardTitleDark: {
    color: "#FFFFFF",
  },
  gridCardTitleSelected: {
    color: PRIMARY,
    fontWeight: "700",
  },
  deptSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 10,
  },
  deptSearchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 0,
  },

  /* Action Buttons */
  stepButtonWrapper: {
    marginTop: 28,
    paddingBottom: 24,
  },

  /* Year inline grid */
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  yearCardOuter: {
    width: "47%",
    height: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  yearCardOuterDark: {
    borderColor: "#27272A",
    backgroundColor: "#18181B",
  },
  yearCardOuterSelected: {
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: "#FFF7ED",
  },
  yearCardOuterSelectedDark: {
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
  },
  yearCardInner: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  yearCardText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    color: "#0F172A",
    lineHeight: 18,
  },
  yearCardTextDark: { color: "#FFFFFF" },
  yearCardTextSelected: { color: PRIMARY },
  yearCardSubText: {
    fontSize: 11,
    fontWeight: "400",
    textAlign: "center",
    color: "#64748B",
    lineHeight: 14,
    marginTop: 2,
  },
  yearCardSubTextDark: { color: "#94A3B8" },
  yearCardSubTextSelected: { color: PRIMARY, opacity: 0.8 },

  /* TNT Ethiopia Dropdown Selector */
  institutionInputSection: {
    marginBottom: 16,
  },
  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  dropdownSelectorSelected: {
    borderWidth: 1.5,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  dropdownValueText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  dropdownPlaceholderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownRight: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  customDeptContainer: {
    marginBottom: 16,
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
    marginTop: 16,
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

  /* TNT Ethiopia Style BottomSheet Header & List Rows */
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 10,
  },
  sheetSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 0,
  },
  sheetList: {
    flex: 1,
    width: "100%",
  },
  sheetListContent: {
    gap: 8,
    paddingBottom: Platform.OS === "ios" ? 44 : 36,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
  },
  sheetRowActive: {
    borderColor: PRIMARY,
  },
  sheetRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  sheetIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  sheetRowTextActive: {
    fontWeight: "700",
  },
  emptySearchContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 10,
  },
  emptySearchText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
