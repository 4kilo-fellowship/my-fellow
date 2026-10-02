import AppButton from "@/components/AppButton";
import AuthIcon, { AuthIconName } from "@/components/AuthIcon";
import { InfoModal } from "@/components/Modals/InfoModal";
import { DEPARTMENTS, TEAM_NAMES, YEARS } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSignupStore } from "@/stores/signup.store";
import { SignUpData } from "@/types";
import { SignUpStep2FormValues, signUpStep2Schema } from "@/utils";
import { BottomSheet } from "@expo/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const PRIMARY = "#ff6719";

type DropdownNameProps = "team" | "department" | "year";

interface DropdownModalConfig {
  name: DropdownNameProps;
  label: string;
  options: readonly string[];
  placeholder: string;
}

const FIELD_META: Record<DropdownNameProps, { icon: AuthIconName }> = {
  team: { icon: "team" },
  department: { icon: "department" },
  year: { icon: "year" },
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

export default function SignUpStep2() {
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

  const [modalConfig, setModalConfig] = useState<DropdownModalConfig | null>(
    null,
  );

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
    teamValue && teamValue.trim().length > 0 &&
    departmentValue && departmentValue.trim().length > 0 &&
    yearValue && yearValue.trim().length > 0 &&
    telegramValue && telegramValue.trim().length >= 3
  );

  const isButtonDisabled = !isFilled;

  const openModal = useCallback((config: DropdownModalConfig) => {
    Keyboard.dismiss();
    setModalConfig(config);
  }, []);

  const closeModal = useCallback(() => {
    setModalConfig(null);
  }, []);

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

  const selectOption = useCallback(
    (name: DropdownNameProps, option: string) => {
      setValue(name, option, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      setModalConfig(null);
    },
    [setValue],
  );

  const pickImage = async () => {
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
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handleComplete: (data: SignUpStep2FormValues) => Promise<void> = async (
    data,
  ) => {
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

      setErrorModal({
        visible: true,
        title: isRegisteredError ? "Account Exists" : "Registration Failed",
        message: errorMessage,
        isRegisteredError,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDropdownField = (
    name: DropdownNameProps,
    label: string,
    options: readonly string[],
    placeholder: string,
  ) => {
    const meta = FIELD_META[name];

    return (
      <View>
        <Text
          className={`${isDark ? "text-slate-200" : "text-slate-800"} font-bold mb-3 ml-1 text-base`}
        >
          {label}
        </Text>
        <Controller
          control={control}
          name={name}
          render={({ field: { value } }) => (
            <View
              style={{
                height: 56,
                minHeight: 56,
                borderRadius: 22,
                overflow: "hidden",
              }}
            >
              <Pressable
                onPress={() =>
                  openModal({ name, label, options, placeholder })
                }
                android_ripple={{
                  color: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.06)",
                  borderless: false,
                }}
                style={({ pressed }) => [
                  { height: 56 },
                  Platform.OS === "ios" && pressed
                    ? { opacity: 0.8 }
                    : undefined,
                ]}
                className={`w-full flex-row items-center gap-3 border-2 rounded-[22px] px-4 ${
                  isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <AuthIcon
                  name={meta.icon}
                  size={23}
                  color={isDark ? "#CBD5E1" : "#475569"}
                />
                <Text
                  numberOfLines={1}
                  className={`flex-1 text-base ${
                    value
                      ? `font-medium ${isDark ? "text-white" : "text-slate-900"}`
                      : isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                  }`}
                >
                  {value || placeholder}
                </Text>
                <AuthIcon
                  name="chevron-down"
                  size={20}
                  color={isDark ? "#64748b" : "#94a3b8"}
                />
              </Pressable>
            </View>
          )}
        />
        {errors[name]?.message ? (
          <Text className="text-red-500 text-xs mt-1 ml-1">
            {errors[name]?.message}
          </Text>
        ) : null}
      </View>
    );
  };

  const currentValue = modalConfig ? watch(modalConfig.name) : "";

  const renderOptionCard = (item: string, index: number) => {
    if (!modalConfig) return null;
    const isSelected = currentValue === item;
    const icon = OPTION_ICONS[item] ?? FIELD_META[modalConfig.name].icon;

    return (
      <Pressable
        key={`${item}-${index}`}
        onPress={() => selectOption(modalConfig.name, item)}
        android_ripple={{
          color: isSelected
            ? "rgba(255, 103, 25, 0.2)"
            : isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.06)",
          borderless: false,
        }}
        style={({ pressed }) => [
          styles.card,
          {
            overflow: "hidden",
            borderColor: isSelected
              ? PRIMARY
              : isDark
                ? "#2a2a2e"
                : "#e2e8f0",
            backgroundColor: isSelected
              ? isDark
                ? "rgba(255,103,25,0.14)"
                : "#fff3ec"
              : isDark
                ? "#242427"
                : "#ffffff",
          },
          Platform.OS === "ios" && pressed ? { opacity: 0.8 } : undefined,
        ]}
      >
        <View
          style={[
            styles.cardIcon,
            {
              backgroundColor: isSelected
                ? PRIMARY
                : isDark
                  ? "#333338"
                  : "#f1f5f9",
            },
          ]}
        >
          <AuthIcon
            name={icon}
            size={22}
            color={isSelected ? "#ffffff" : isDark ? "#cbd5e1" : "#64748b"}
          />
        </View>
        <Text
          numberOfLines={2}
          style={[
            styles.cardLabel,
            {
              color: isSelected ? PRIMARY : isDark ? "#e2e8f0" : "#334155",
            },
          ]}
        >
          {item}
        </Text>
        {isSelected ? (
          <View style={styles.cardCheck}>
            <AuthIcon name="checkmark-circle" size={20} color={PRIMARY} />
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-dark" : "bg-white"}`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 20}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 32,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View
              className={`flex-1 ${isDark ? "bg-dark" : "bg-white"} pt-8 px-6`}
            >
              <View className="items-center mb-6">
                <Pressable
                  onPress={pickImage}
                  android_ripple={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(0, 0, 0, 0.1)",
                    borderless: false,
                  }}
                  style={({ pressed }) => [
                    { borderRadius: 9999, overflow: "hidden" },
                    Platform.OS === "ios" && pressed
                      ? { opacity: 0.85 }
                      : undefined,
                  ]}
                  className={`relative shadow-xl ${isDark ? "shadow-gray-900" : "shadow-slate-200"}`}
                >
                  <View
                    className={`w-32 h-32 rounded-full ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-300"} items-center justify-center border-2 border-dashed overflow-hidden`}
                  >
                    {image ? (
                      <Image
                        source={{ uri: image }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="items-center">
                        <AuthIcon
                          name="camera"
                          size={32}
                          color={isDark ? "#4b5563" : "#94a3b8"}
                        />
                        <Text
                          className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"} mt-1 font-bold uppercase tracking-wider`}
                        >
                          Upload
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="absolute bottom-0 right-0 w-11 h-11 bg-primary rounded-full border-[3px] border-white items-center justify-center shadow-md">
                    <AuthIcon
                      name={image ? "edit" : "add"}
                      size={16}
                      color="white"
                    />
                  </View>
                </Pressable>
              </View>

              <View
                style={{
                  height: 0,
                  width: 0,
                  opacity: 0,
                  position: "absolute",
                }}
              >
                <TextInput
                  value={phoneNumber}
                  textContentType="username"
                  autoComplete="username"
                  importantForAutofill="yes"
                />
                <TextInput
                  value={password}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  importantForAutofill="yes"
                  secureTextEntry
                />
              </View>

              <View className="gap-5">
                {renderDropdownField(
                  "team",
                  "Team",
                  TEAM_NAMES,
                  "Select your team",
                )}

                {renderDropdownField(
                  "department",
                  "Department",
                  DEPARTMENTS,
                  "Select your department",
                )}

                {renderDropdownField(
                  "year",
                  "Year",
                  YEARS,
                  "Select your academic year",
                )}

                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-800"} font-bold mb-3 ml-1 text-base`}
                  >
                    Telegram Handle
                  </Text>
                  <Controller
                    control={control}
                    name="telegram"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        style={{ height: 58, justifyContent: "center" }}
                        className="relative"
                      >
                        <TextInput
                          style={{
                            height: 58,
                            borderRadius: 22,
                            paddingLeft: 50,
                            paddingRight: 16,
                            textAlignVertical: "center",
                            includeFontPadding: false,
                          }}
                          className={`w-full ${isDark ? "bg-slate-900 text-white border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-[22px] text-base focus:border-primary`}
                          placeholder="@username"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                        />
                        <View
                          style={{
                            position: "absolute",
                            left: 16,
                            height: 58,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          pointerEvents="none"
                        >
                          <AuthIcon
                            name="telegram"
                            size={23}
                            color={isDark ? "#cbd5e1" : "#475569"}
                          />
                        </View>
                      </View>
                    )}
                  />
                  {errors.telegram?.message ? (
                    <Text className="text-red-500 text-xs mt-1 ml-1">
                      {errors.telegram.message}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="mt-8 mb-6">
                <AppButton
                  title="Finish Registration"
                  onPress={handleSubmit(handleComplete)}
                  loading={loading}
                  disabled={isButtonDisabled}
                  isDark={isDark}
                  variant="primary"
                  size="lg"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <BottomSheet
        isPresented={modalConfig !== null}
        onDismiss={closeModal}
        showDragIndicator
        snapPoints={["half", "full"]}
      >
        {modalConfig ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <Text
              style={[
                styles.sheetTitle,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              Select {modalConfig.label}
            </Text>
            <Text
              style={[
                styles.sheetSubtitle,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              Choose the option that fits you best
            </Text>
            <View style={styles.grid}>
              {modalConfig.options.map(renderOptionCard)}
            </View>
          </ScrollView>
        ) : null}
      </BottomSheet>

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
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  card: {
    width: "48%",
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 10,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  cardCheck: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
