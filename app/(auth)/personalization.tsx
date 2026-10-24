import AppButton from "@/components/AppButton";
import AuthIcon, { AuthIconName } from "@/components/AuthIcon";
import { InfoModal } from "@/components/Modals/InfoModal";
import { DEPARTMENTS, TEAM_NAMES, YEARS } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSignupStore } from "@/stores/signup.store";
import { SignUpData } from "@/types";
import { SignUpStep2FormValues, signUpStep2Schema } from "@/utils";
import { formatErrorMessage } from "@/utils/alertUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const PRIMARY = "#ff6719";

type DropdownNameProps = "team" | "department" | "year";

interface DropdownModalConfig {
  name: DropdownNameProps;
  label: string;
  options: readonly string[];
  placeholder: string;
}

const FIELD_META: Record<
  DropdownNameProps,
  { icon: AuthIconName; label: string }
> = {
  team: { icon: "team", label: "TEAM" },
  department: { icon: "department", label: "DEPARTMENT" },
  year: { icon: "year", label: "ACADEMIC YEAR" },
};

const OPTION_ICONS: Record<string, AuthIconName> = {
  "Bible Study": "book",
  Evangelism: "megaphone",
  Freshman: "school",
  I4U: "heart",
  Media: "video",
  Prayer: "hand",
  Worship: "music",
  Other: "apps",
  "Applied Chemistry": "flask",
  "Applied Mathematics": "calculator",
  "Applied Biology": "leaf",
  "Applied Physics": "globe",
  "Information System": "server",
  "Computer Science": "laptop",
  Statistics: "chart",
  "Engineering(5 Kilo)": "wrench",
  "Social Science(6 Kilo)": "groups",
  "1st Year": "ribbon",
  "2nd Year": "ribbon",
  "3rd Year": "ribbon",
  "4th Year": "ribbon",
  "5th Year": "ribbon",
};

interface OptionBottomSheetProps {
  config: DropdownModalConfig | null;
  onClose: () => void;
  onSelect: (name: DropdownNameProps, value: string) => void;
  currentValue: string;
  isDark: boolean;
  insetsBottom: number;
}

function OptionBottomSheet({
  config,
  onClose,
  onSelect,
  currentValue,
  isDark,
  insetsBottom,
}: OptionBottomSheetProps) {
  const [activeConfig, setActiveConfig] = useState<DropdownModalConfig | null>(
    config,
  );
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string>(currentValue);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const handleCloseComplete = useCallback(() => {
    setModalVisible(false);
    setActiveConfig(null);
    onClose();
  }, [onClose]);

  const dismiss = useCallback(() => {
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 220, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(handleCloseComplete)();
        }
      },
    );
    backdropOpacity.value = withTiming(0, { duration: 180 });
  }, [handleCloseComplete, translateY, backdropOpacity]);

  useEffect(() => {
    if (config) {
      setActiveConfig(config);
      setSelectedItem(currentValue);
      setModalVisible(true);
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
      translateY.value = withSpring(0, {
        damping: 26,
        stiffness: 280,
        mass: 0.8,
      });
      backdropOpacity.value = withTiming(1, { duration: 220 });
    }
  }, [config, currentValue, translateY, backdropOpacity]);

  const panGesture = Gesture.Pan()
    .activeOffsetY([0, 5])
    .onUpdate((event) => {
      "worklet";
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      } else {
        translateY.value = event.translationY * 0.18;
      }
    })
    .onEnd((event) => {
      "worklet";
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(
          SCREEN_HEIGHT,
          { duration: 200, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) {
              runOnJS(handleCloseComplete)();
            }
          },
        );
        backdropOpacity.value = withTiming(0, { duration: 180 });
      } else {
        translateY.value = withSpring(0, {
          damping: 24,
          stiffness: 280,
          mass: 0.8,
        });
      }
    });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, 250],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity: backdropOpacity.value * opacity,
    };
  });

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: Math.max(-25, translateY.value) }],
    };
  });

  if (!modalVisible || !activeConfig) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <View style={styles.sheetOverlay}>
        <TouchableWithoutFeedback onPress={dismiss}>
          <Animated.View style={[styles.sheetBackdrop, backdropAnimatedStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheetContainer,
            sheetAnimatedStyle,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              paddingBottom: Math.max(insetsBottom + 16, 24),
            },
          ]}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.sheetTopDragArea}>
              <View style={styles.handleContainer}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: isDark ? "#475569" : "#cbd5e1" },
                  ]}
                />
              </View>

              <View style={styles.sheetHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.sheetTitle,
                      { color: isDark ? "#f8fafc" : "#0f172a" },
                    ]}
                  >
                    Select {activeConfig.label}
                  </Text>
                  <Text
                    style={[
                      styles.sheetSubtitle,
                      { color: isDark ? "#94a3b8" : "#64748b" },
                    ]}
                  >
                    Choose the option that fits you best
                  </Text>
                </View>

                <Pressable
                  onPress={dismiss}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  android_ripple={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(0, 0, 0, 0.1)",
                    borderless: true,
                    radius: 18,
                  }}
                  style={({ pressed }) => [
                    styles.sheetCloseBtn,
                    {
                      backgroundColor: isDark ? "#334155" : "#f1f5f9",
                    },
                    Platform.OS === "ios" && pressed
                      ? { opacity: 0.6 }
                      : undefined,
                  ]}
                >
                  <AuthIcon
                    name="close"
                    size={20}
                    color={isDark ? "#cbd5e1" : "#64748b"}
                  />
                </Pressable>
              </View>
            </Animated.View>
          </GestureDetector>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsList}
            style={{ maxHeight: SCREEN_HEIGHT * 0.58 }}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {activeConfig.options.map((item, index) => {
              const isSelected = (selectedItem || currentValue) === item;
              const icon =
                OPTION_ICONS[item] ?? FIELD_META[activeConfig.name].icon;

              return (
                <Pressable
                  key={`${item}-${index}`}
                  onPress={() => {
                    setSelectedItem(item);
                    onSelect(activeConfig.name, item);
                    dismiss();
                  }}
                  android_ripple={{
                    color: "rgba(255, 103, 25, 0.12)",
                    borderless: false,
                  }}
                  style={({ pressed }) => [
                    styles.optionCard,
                    {
                      borderColor: isSelected
                        ? PRIMARY
                        : isDark
                          ? "#334155"
                          : "#e2e8f0",
                      backgroundColor: isSelected
                        ? isDark
                          ? "rgba(255, 103, 25, 0.14)"
                          : "#fff7f2"
                        : isDark
                          ? "#1e293b"
                          : "#ffffff",
                    },
                    Platform.OS === "ios" && pressed
                      ? { opacity: 0.8 }
                      : undefined,
                  ]}
                >
                  <View
                    style={[
                      styles.optionCardIcon,
                      {
                        backgroundColor: isSelected
                          ? "rgba(255, 103, 25, 0.16)"
                          : isDark
                            ? "#0f172a"
                            : "#f1f5f9",
                      },
                    ]}
                  >
                    <AuthIcon
                      name={icon}
                      size={22}
                      color={
                        isSelected ? PRIMARY : isDark ? "#cbd5e1" : "#64748b"
                      }
                    />
                  </View>

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.optionCardLabel,
                      {
                        color: isSelected
                          ? PRIMARY
                          : isDark
                            ? "#f8fafc"
                            : "#0f172a",
                        fontWeight: isSelected ? "700" : "600",
                      },
                    ]}
                  >
                    {item}
                  </Text>

                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected
                          ? PRIMARY
                          : isDark
                            ? "#475569"
                            : "#cbd5e1",
                      },
                    ]}
                  >
                    {isSelected ? <View style={styles.radioInner} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function PersonalizationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const headerHeight = useHeaderHeight();

  const signupStore = useSignupStore.getState();
  const fullName = (params.fullName as string) || signupStore.fullName || "";
  const phoneNumber =
    (params.phoneNumber as string) || signupStore.phoneNumber || "";
  const password = (params.password as string) || signupStore.password || "";

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [telegramFocused, setTelegramFocused] = useState<boolean>(false);
  const [modalConfig, setModalConfig] = useState<DropdownModalConfig | null>(
    null,
  );

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    isRegisteredError: boolean;
  }>({
    visible: false,
    title: "",
    message: "",
    isRegisteredError: false,
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpStep2FormValues>({
    resolver: zodResolver(signUpStep2Schema),
    defaultValues: {
      team: "",
      department: "",
      year: "",
      telegram: "",
    },
  });

  const teamValue = watch("team");
  const departmentValue = watch("department");
  const yearValue = watch("year");
  const telegramValue = watch("telegram");

  const isFilled = Boolean(
    teamValue &&
      teamValue.trim().length > 0 &&
      departmentValue &&
      departmentValue.trim().length > 0 &&
      yearValue &&
      yearValue.trim().length > 0 &&
      telegramValue &&
      telegramValue.trim().length >= 3,
  );

  const avatarInitial = useMemo(() => {
    if (fullName.trim()) return fullName.trim().charAt(0).toUpperCase();
    return "F";
  }, [fullName]);

  const openModal = useCallback((config: DropdownModalConfig) => {
    Keyboard.dismiss();
    setModalConfig(config);
  }, []);

  const closeModal = useCallback(() => {
    setModalConfig(null);
  }, []);

  const selectOption = useCallback(
    (name: DropdownNameProps, option: string) => {
      setValue(name, option, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    },
    [setValue],
  );

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setErrorModal({
          visible: true,
          title: "Permission Needed",
          message:
            "Allow photo library access in Settings to upload a profile picture.",
          isRegisteredError: false,
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
      }
    } catch {
      setErrorModal({
        visible: true,
        title: "Image Upload",
        message: "Could not select picture. Please try again.",
        isRegisteredError: false,
      });
    }
  };

  const handleErrorModalClose = () => {
    const wasRegisteredError = errorModal.isRegisteredError;
    setErrorModal((prev) => ({ ...prev, visible: false }));

    if (wasRegisteredError) {
      useSignupStore.getState().clear();
      router.push({
        pathname: "/sign-up-step-1",
        params: { focus: "phoneNumber" },
      });
    }
  };

  const handleComplete = async (data: SignUpStep2FormValues) => {
    if (!fullName || !phoneNumber || !password) {
      setErrorModal({
        visible: true,
        title: "Missing Information",
        message: "Please complete all required fields.",
        isRegisteredError: false,
      });
      router.back();
      return;
    }

    setLoading(true);

    try {
      const registrationData: SignUpData = {
        fullName,
        phoneNumber,
        password,
        team: data.team,
        department: data.department,
        yearOfStudy: data.year,
        telegramUserName: data.telegram || "",
        profileImage: image || undefined,
      };

      await signup(registrationData);

      useSignupStore.getState().clear();
      router.replace("/(tabs)");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";
      const isRegisteredError =
        errorMessage.toLowerCase().includes("already registered") ||
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("phone number already in use");

      const formatted = formatErrorMessage(error);
      setErrorModal({
        visible: true,
        title: isRegisteredError ? "Already Registered" : formatted.title,
        message: isRegisteredError
          ? "This phone number is already registered. Please sign in."
          : formatted.message,
        isRegisteredError,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDropdownSelector = (
    name: DropdownNameProps,
    label: string,
    options: readonly string[],
    placeholder: string,
  ) => {
    const meta = FIELD_META[name];

    return (
      <View style={styles.fieldWrapper}>
        <Text
          style={[
            styles.fieldLabel,
            { color: isDark ? "#94a3b8" : "#64748b" },
          ]}
        >
          {meta.label}
        </Text>
        <Controller
          control={control}
          name={name}
          render={({ field: { value } }) => {
            const isSelected = Boolean(value && value.trim().length > 0);

            return (
              <View style={styles.selectorOuterWrap}>
                <Pressable
                  onPress={() =>
                    openModal({ name, label, options, placeholder })
                  }
                  android_ripple={{
                    color: "rgba(255, 103, 25, 0.1)",
                    borderless: false,
                  }}
                  style={({ pressed }) => [
                    styles.selectorButton,
                    {
                      borderColor: isSelected
                        ? PRIMARY
                        : isDark
                          ? "#334155"
                          : "#e2e8f0",
                      backgroundColor: isSelected
                        ? isDark
                          ? "rgba(255, 103, 25, 0.08)"
                          : "#fffbf7"
                        : isDark
                          ? "#1e293b"
                          : "#f8fafc",
                    },
                    Platform.OS === "ios" && pressed
                      ? { opacity: 0.8 }
                      : undefined,
                  ]}
                >
                  <View
                    style={[
                      styles.iconBadge,
                      {
                        backgroundColor: isSelected
                          ? "rgba(255, 103, 25, 0.15)"
                          : isDark
                            ? "#0f172a"
                            : "#ffffff",
                      },
                    ]}
                  >
                    <AuthIcon
                      name={meta.icon}
                      size={20}
                      color={
                        isSelected
                          ? PRIMARY
                          : isDark
                            ? "#cbd5e1"
                            : "#64748b"
                      }
                    />
                  </View>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.selectorValueText,
                      {
                        color: isSelected
                          ? isDark
                            ? "#ffffff"
                            : "#0f172a"
                          : isDark
                            ? "#64748b"
                            : "#94a3b8",
                        fontWeight: isSelected ? "600" : "400",
                      },
                    ]}
                  >
                    {value || placeholder}
                  </Text>

                  <AuthIcon
                    name="chevron-down"
                    size={18}
                    color={
                      isSelected
                        ? PRIMARY
                        : isDark
                          ? "#64748b"
                          : "#94a3b8"
                    }
                  />
                </Pressable>
              </View>
            );
          }}
        />
        {errors[name]?.message ? (
          <Text style={styles.errorText}>{errors[name]?.message}</Text>
        ) : null}
      </View>
    );
  };

  const currentValue = modalConfig ? watch(modalConfig.name) : "";

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#1A1A1B" : "#ffffff" },
      ]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 20}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Top Stepper Indicator inspired by tnt-ethiopia */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
              <View style={[styles.progressSegment, styles.progressSegmentActive]} />
            </View>

            {/* Header Block */}
            <View style={styles.headerBlock}>
              <Text
                style={[
                  styles.titleText,
                  { color: isDark ? "#ffffff" : "#0f172a" },
                ]}
              >
                Personalize your profile
              </Text>
              <Text
                style={[
                  styles.subtitleText,
                  { color: isDark ? "#94a3b8" : "#64748b" },
                ]}
              >
                Choose your fellowship team, department, and academic year to get connected.
              </Text>
            </View>

            {/* Profile Avatar Uploader inspired by tnt-ethiopia */}
            <View style={styles.avatarSection}>
              <Pressable
                onPress={pickImage}
                accessibilityRole="button"
                accessibilityLabel="Upload profile picture"
                style={({ pressed }) => [
                  styles.avatarPressable,
                  Platform.OS === "ios" && pressed
                    ? { opacity: 0.88, transform: [{ scale: 0.98 }] }
                    : undefined,
                ]}
              >
                <View
                  style={[
                    styles.avatarCircle,
                    {
                      backgroundColor: isDark ? "#1e293b" : "#fff5ed",
                      borderColor: isDark ? "#334155" : "#fed7aa",
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
                      <Text style={styles.avatarInitialText}>
                        {avatarInitial}
                      </Text>
                    </View>
                  )}

                  {/* Camera / Plus badge at bottom-right */}
                  <View
                    style={[
                      styles.avatarBadge,
                      {
                        borderColor: isDark ? "#1A1A1B" : "#ffffff",
                      },
                    ]}
                  >
                    <AuthIcon
                      name={image ? "edit" : "camera"}
                      size={15}
                      color="#ffffff"
                    />
                  </View>
                </View>
              </Pressable>
              <Text
                style={[
                  styles.avatarHintText,
                  { color: isDark ? "#94a3b8" : "#64748b" },
                ]}
              >
                {image ? "Tap to change photo" : "Add a profile photo"}
              </Text>
            </View>

            {/* Dropdown Selectors Stack */}
            <View style={styles.fieldsStack}>
              {renderDropdownSelector(
                "team",
                "Team",
                TEAM_NAMES,
                "Select your team",
              )}

              {renderDropdownSelector(
                "department",
                "Department",
                DEPARTMENTS,
                "Select your department",
              )}

              {renderDropdownSelector(
                "year",
                "Year",
                YEARS,
                "Select your academic year",
              )}

              {/* Telegram Handle Input Field matching selector card styling */}
              <View style={styles.fieldWrapper}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: isDark ? "#94a3b8" : "#64748b" },
                  ]}
                >
                  TELEGRAM USERNAME
                </Text>
                <Controller
                  control={control}
                  name="telegram"
                  render={({ field: { onChange, onBlur, value } }) => {
                    const hasValue = Boolean(value && value.trim().length > 0);
                    const isActive = telegramFocused || hasValue;

                    return (
                      <View
                        style={[
                          styles.inputContainer,
                          {
                            borderColor: isActive
                              ? PRIMARY
                              : isDark
                                ? "#334155"
                                : "#e2e8f0",
                            backgroundColor: isActive
                              ? isDark
                                ? "rgba(255, 103, 25, 0.08)"
                                : "#fffbf7"
                              : isDark
                                ? "#1e293b"
                                : "#f8fafc",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.iconBadge,
                            {
                              backgroundColor: isActive
                                ? "rgba(255, 103, 25, 0.15)"
                                : isDark
                                  ? "#0f172a"
                                  : "#ffffff",
                            },
                          ]}
                        >
                          <AuthIcon
                            name="telegram"
                            size={20}
                            color={
                              isActive
                                ? PRIMARY
                                : isDark
                                  ? "#cbd5e1"
                                  : "#64748b"
                            }
                          />
                        </View>
                        <TextInput
                          style={[
                            styles.textInput,
                            {
                              color: isDark ? "#ffffff" : "#0f172a",
                            },
                          ]}
                          placeholder="@username"
                          placeholderTextColor={
                            isDark ? "#64748b" : "#94a3b8"
                          }
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setTelegramFocused(true)}
                          onBlur={() => {
                            setTelegramFocused(false);
                            onBlur();
                          }}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    );
                  }}
                />
                {errors.telegram?.message ? (
                  <Text style={styles.errorText}>
                    {errors.telegram.message}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Bottom CTA Button */}
            <View style={styles.buttonWrapper}>
              <AppButton
                title="Finish Registration"
                onPress={handleSubmit(handleComplete)}
                loading={loading}
                disabled={!isFilled}
                isDark={isDark}
                variant="primary"
                size="lg"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Options Selection BottomSheet Modal */}
      {/* Options Selection BottomSheet Modal */}
      <OptionBottomSheet
        config={modalConfig}
        onClose={closeModal}
        onSelect={selectOption}
        currentValue={currentValue}
        isDark={isDark}
        insetsBottom={insets.bottom}
      />

      <InfoModal
        visible={errorModal.visible}
        onClose={handleErrorModalClose}
        title={errorModal.title}
        message={errorModal.message}
        type="error"
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 36,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
  },
  progressSegmentActive: {
    backgroundColor: PRIMARY,
  },
  headerBlock: {
    marginBottom: 24,
  },
  titleText: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    lineHeight: 21,
  },

  /* Avatar Uploader */
  avatarSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
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
  avatarInitialText: {
    fontSize: 40,
    fontWeight: "800",
    color: PRIMARY,
  },
  avatarBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PRIMARY,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarHintText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },

  /* Fields Stack */
  fieldsStack: {
    gap: 18,
  },
  fieldWrapper: {
    width: "100%",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
  },
  selectorOuterWrap: {
    borderRadius: 16,
    overflow: "hidden",
  },
  selectorButton: {
    height: 56,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorValueText: {
    flex: 1,
    fontSize: 15,
  },
  inputContainer: {
    height: 56,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: 56,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
    marginLeft: 4,
  },

  /* Button */
  buttonWrapper: {
    marginTop: 28,
  },

  /* BottomSheet Options List */
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  sheetTopDragArea: {
    width: "100%",
    paddingTop: 4,
    paddingBottom: 2,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  sheetHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 4,
  },
  sheetCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    marginTop: 3,
  },
  optionsList: {
    gap: 10,
    paddingBottom: 8,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 14,
  },
  optionCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCardLabel: {
    flex: 1,
    fontSize: 15,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: PRIMARY,
  },
});
