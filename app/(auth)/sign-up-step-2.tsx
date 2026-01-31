import SelectionModal from "@/components/SelectionModal";
import { DEPARTMENTS, TEAM_NAMES, YEARS } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { SignUpStep2FormValues, signUpStep2Schema } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";

import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.08;

export default function SignUpStep2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signup } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // state variables for the drop down
  const [modalType, setModalType] = useState<
    "team" | "department" | "year" | null
  >(null);

  const {
    control,
    handleSubmit,
    setValue,
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

  // image picker for the profile picture
  const pickImage = async () => {
    // Ask for gallery library permission
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
    // Validate step 1 data from params
    if (!params.fullName || !params.phone || !params.password) {
      Alert.alert(
        "Missing Information",
        "Please complete all required fields.",
      );
      router.back();
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data
      const registrationData = {
        fullName: params.fullName as string,
        phone: params.phone as string,
        password: params.password as string,
        confirmPassword: params.password as string,
        team: data.team,
        department: data.department,
        year: data.year,
        telegram: data.telegram || undefined,
        profileImage: image || undefined,
      };

      // Call signup service
      await signup(registrationData);

      // Success - navigation will be handled by AuthProvider/auth state
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-dark" : "bg-white"}`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {/* header */}
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
              {/* back */}
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
            {/* Form */}
            <View
              className={`flex-1 ${isDark ? "bg-dark" : "bg-white"} pt-8 px-6`}
            >
              {/* Image Picker */}
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

              {/* Form Fields */}
              <View className="space-y-5">
                {/* Team Dropdown */}
                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-800"} font-bold mb-3 ml-1 text-base`}
                  >
                    Team
                  </Text>
                  <Controller
                    control={control}
                    name="team"
                    render={({ field: { value } }) => (
                      <>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => setModalType("team")}
                          className={`w-full ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"} border-2 rounded-2xl p-4 flex-row justify-between items-center ${
                            errors.team ? "border-red-500" : ""
                          }`}
                        >
                          <Text
                            className={
                              value
                                ? `${isDark ? "text-white" : "text-slate-900"} text-base`
                                : `${isDark ? "text-slate-600" : "text-slate-400"} text-base`
                            }
                          >
                            {value || "Select your team"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color={isDark ? "#4b5563" : "#94a3b8"}
                          />
                        </TouchableOpacity>
                        {errors.team?.message ? (
                          <Text className="text-red-500 text-xs mt-1 ml-1">
                            {errors.team.message}
                          </Text>
                        ) : null}
                      </>
                    )}
                  />
                </View>

                {/* Department Dropdown */}
                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-800"} font-bold mb-3 ml-1 text-base`}
                  >
                    Department
                  </Text>
                  <Controller
                    control={control}
                    name="department"
                    render={({ field: { value } }) => (
                      <>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => setModalType("department")}
                          className={`w-full ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"} border-2 rounded-2xl p-4 flex-row justify-between items-center ${
                            errors.department ? "border-red-500" : ""
                          }`}
                        >
                          <Text
                            className={
                              value
                                ? `${isDark ? "text-white" : "text-slate-900"} text-base`
                                : `${isDark ? "text-slate-600" : "text-slate-400"} text-base`
                            }
                          >
                            {value || "Select your department"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color={isDark ? "#4b5563" : "#94a3b8"}
                          />
                        </TouchableOpacity>
                        {errors.department?.message ? (
                          <Text className="text-red-500 text-xs mt-1 ml-1">
                            {errors.department.message}
                          </Text>
                        ) : null}
                      </>
                    )}
                  />
                </View>

                {/* Year Dropdown */}
                <View>
                  <Text
                    className={`${isDark ? "text-slate-200" : "text-slate-800"} font-bold mb-3 ml-1 text-base`}
                  >
                    Year
                  </Text>
                  <Controller
                    control={control}
                    name="year"
                    render={({ field: { value } }) => (
                      <>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => setModalType("year")}
                          className={`w-full ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"} border-2 rounded-2xl p-4 flex-row justify-between items-center ${
                            errors.year ? "border-red-500" : ""
                          }`}
                        >
                          <Text
                            className={
                              value
                                ? `${isDark ? "text-white" : "text-slate-900"} text-base`
                                : `${isDark ? "text-slate-600" : "text-slate-400"} text-base`
                            }
                          >
                            {value || "Select your academic year"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color={isDark ? "#4b5563" : "#94a3b8"}
                          />
                        </TouchableOpacity>
                        {errors.year?.message ? (
                          <Text className="text-red-500 text-xs mt-1 ml-1">
                            {errors.year.message}
                          </Text>
                        ) : null}
                      </>
                    )}
                  />
                </View>

                {/* Telegram Input */}
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

              {/* Footer Button */}
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

          {/* Modals for Selection */}
          <SelectionModal
            visible={modalType === "team"}
            onClose={() => setModalType(null)}
            title="Select Team"
            options={TEAM_NAMES}
            onSelect={(val) => setValue("team", val, { shouldValidate: true })}
          />
          <SelectionModal
            visible={modalType === "department"}
            onClose={() => setModalType(null)}
            title="Select Department"
            options={DEPARTMENTS}
            onSelect={(val) =>
              setValue("department", val, { shouldValidate: true })
            }
          />
          <SelectionModal
            visible={modalType === "year"}
            onClose={() => setModalType(null)}
            title="Select Year"
            options={YEARS}
            onSelect={(val) => setValue("year", val, { shouldValidate: true })}
          />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
