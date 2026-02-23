import { InfoModal } from "@/components/Modals/InfoModal";
import { DEPARTMENTS, TEAM_NAMES, YEARS } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { SignUpData } from "@/types";
import { SignUpStep2FormValues, signUpStep2Schema } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
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
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.08;

type DropdownNameProps = "team" | "department" | "year";

interface DropdownModalConfig {
  name: DropdownNameProps;
  label: string;
  options: readonly string[];
  placeholder: string;
}

export default function SignUpStep2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signup } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

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

  const openModal = useCallback(
    (config: DropdownModalConfig) => {
      Keyboard.dismiss();
      setModalConfig(config);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 40,
          stiffness: 200,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [slideAnim, backdropAnim],
  );

  const closeModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalConfig(null);
    });
  }, [slideAnim, backdropAnim]);

  const handleErrorModalClose = () => {
    const wasRegisteredError = errorModal.isRegisteredError;
    setErrorModal((prev) => ({ ...prev, visible: false }));

    if (wasRegisteredError) {
      router.push({
        pathname: "/sign-up-step-1",
        params: { focus: "phoneNumber" },
      });
    }
  };

  const selectOption = useCallback(
    (name: DropdownNameProps, option: string) => {
      setValue(name, option, { shouldValidate: true });
      closeModal();
    },
    [setValue, closeModal],
  );

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleComplete: (data: SignUpStep2FormValues) => Promise<void> = async (
    data,
  ) => {
    if (!params.fullName || !params.phoneNumber || !params.password) {
      Alert.alert(
        "Missing Information",
        "Please complete all required fields.",
      );
      router.back();
      return;
    }

    setLoading(true);

    try {
      const registrationData: SignUpData = {
        fullName: params.fullName as string,
        phoneNumber: params.phoneNumber as string,
        password: params.password as string,
        confirmPassword: params.password as string,
        team: data.team,
        pastTeam: "",
        department: data.department,
        yearOfStudy: data.year,
        telegramUserName: data.telegram || "",
        profileImage: image || undefined,
      };

      await signup(registrationData);

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
    const hasError = !!errors[name];
    const errorMessage = errors[name]?.message;

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
            <View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openModal({ name, label, options, placeholder })}
                className={`w-full ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"} border-2 rounded-2xl p-4 flex-row justify-between items-center ${
                  hasError ? "border-red-500" : ""
                }`}
              >
                <Text
                  className={
                    value
                      ? `${isDark ? "text-white" : "text-slate-900"} text-base`
                      : `${isDark ? "text-slate-600" : "text-slate-400"} text-base`
                  }
                >
                  {value || placeholder}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={isDark ? "#4b5563" : "#94a3b8"}
                />
              </TouchableOpacity>
              {errorMessage ? (
                <Text className="text-red-500 text-xs mt-1 ml-1">
                  {errorMessage}
                </Text>
              ) : null}
            </View>
          )}
        />
      </View>
    );
  };

  const renderModalOption = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    if (!modalConfig) return null;
    const currentValue = watch(modalConfig.name);
    const isSelected = currentValue === item;
    const isLast = index === modalConfig.options.length - 1;

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => selectOption(modalConfig.name, item)}
        style={[
          styles.optionItem,
          {
            backgroundColor: isSelected
              ? isDark
                ? "#1e293b"
                : "#f1f5f9"
              : "transparent",
            borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
            borderBottomColor: isDark ? "#1e293b" : "#e2e8f0",
          },
        ]}
      >
        <Text
          style={[
            styles.optionText,
            {
              color: isSelected ? "#ff6719" : isDark ? "#cbd5e1" : "#334155",
              fontWeight: isSelected ? "700" : "400",
            },
          ]}
        >
          {item}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={20} color="#ff6719" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-dark" : "bg-white"}`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View
            className={`${isDark ? "bg-dark shadow-gray-900/10" : "bg-white shadow-slate-100"}`}
            style={{
              height: HEADER_HEIGHT,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            <View
              className="flex-1 justify-center items-center px-6"
              style={{ paddingTop: 60 }}
            >
              <View className="absolute top-4 left-6">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.back()}
                  className={`w-12 h-12 ${isDark ? "bg-slate-800" : "bg-slate-50"} rounded-full items-center justify-center border ${isDark ? "border-slate-700" : "border-slate-200"} shadow-lg`}
                >
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={isDark ? "white" : "black"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View
              className={`flex-1 ${isDark ? "bg-dark" : "bg-white"} pt-8 px-6`}
            >
              <View className="items-center mb-6">
                <TouchableOpacity
                  onPress={pickImage}
                  activeOpacity={1}
                  className={`relative shadow-xl ${isDark ? "shadow-gray-900" : "shadow-slate-200"}`}
                >
                  <View
                    className={`w-32 h-32 rounded-full ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-300"} items-center justify-center border-2 border-dashed overflow-hidden`}
                  >
                    {image ? (
                      <Image
                        source={{ uri: image }}
                        className="w-full h-full"
                      />
                    ) : (
                      <View className="items-center">
                        <Ionicons
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
                  <View className="absolute bottom-1 right-1 bg-primary p-2.5 rounded-full border-[3px] border-white shadow-md">
                    <Ionicons
                      name={image ? "pencil" : "add"}
                      size={16}
                      color="white"
                    />
                  </View>
                </TouchableOpacity>
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
                  value={params.phoneNumber as string}
                  textContentType="username"
                  autoComplete="username"
                  importantForAutofill="yes"
                />
                <TextInput
                  value={params.password as string}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  importantForAutofill="yes"
                  secureTextEntry
                />
              </View>

              <View className="space-y-5">
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
                      <View className="relative justify-center">
                        <TextInput
                          className={`w-full ${isDark ? "bg-slate-900 text-white border-slate-800" : "bg-slate-50 text-slate-900 border-slate-200"} border-2 rounded-2xl p-4 pl-12 text-base focus:bg-transparent ${
                            errors.telegram
                              ? "border-red-500"
                              : "focus:border-primary"
                          }`}
                          placeholder="@username"
                          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                        />
                        <View className="absolute left-4">
                          <Ionicons
                            name="paper-plane-outline"
                            size={22}
                            color={isDark ? "#94a3b8" : "#64748b"}
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
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSubmit(handleComplete)}
                  disabled={loading}
                  className="w-full bg-primary py-5 rounded-2xl shadow-lg shadow-primary/40 active:scale-[0.98] flex-row justify-center items-center"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-bold text-lg">
                      Finish Registration
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Modal
        visible={modalConfig !== null}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim,
              },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: isDark ? "#0f172a" : "#ffffff",
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  {
                    backgroundColor: isDark ? "#334155" : "#cbd5e1",
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.sheetHeader,
                {
                  borderBottomColor: isDark ? "#1e293b" : "#f1f5f9",
                },
              ]}
            >
              <Text
                style={[
                  styles.sheetTitle,
                  { color: isDark ? "#f1f5f9" : "#0f172a" },
                ]}
              >
                {modalConfig?.label}
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                  },
                ]}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={modalConfig?.options ? [...modalConfig.options] : []}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderModalOption}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </Animated.View>
        </View>
      </Modal>

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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsList: {
    paddingHorizontal: 8,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  optionText: {
    fontSize: 16,
  },
});
