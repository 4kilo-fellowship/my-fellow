import { useAuth } from "@/context/AuthContext";
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
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.08;

// --- Data Lists ---
const TEAMS = [
  "Bible Study Team",
  "Action Team",
  "Worship Team",
  "I4U",
  "Prayer Team",
  "Evangelism",
  "Literature",
  "Media",
];

const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Architecture",
  "Medicine",
  "Business & Econ",
  "Other",
];

const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "GC",
];

const signUpStep2Schema = z.object({
  team: z.string().min(1, "Team is required"),
  department: z.string().min(1, "Department is required"),
  year: z.string().min(1, "Year is required"),
  telegram: z
    .string()
    .transform((val) => val.trim())
    .refine(
      (val) => val === "" || /^@?[a-zA-Z0-9_]{3,32}$/.test(val),
      "Enter a valid Telegram handle"
    ),
});

type SignUpStep2FormValues = z.infer<typeof signUpStep2Schema>;

// --- Reusable Dropdown Modal Component ---
const SelectionModal = ({
  visible,
  onClose,
  title,
  options,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  onSelect: (val: string) => void;
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity
      activeOpacity={1}
      onPress={onClose}
      className="flex-1 bg-black/50 justify-center items-center px-6"
    >
      <View className="bg-white w-full max-h-[70%] rounded-3xl overflow-hidden p-6 shadow-2xl">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-slate-900">{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-circle" size={28} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
              className="py-4 border-b border-slate-100 flex-row justify-between items-center"
            >
              <Text className="text-slate-700 text-lg font-medium">
                {option}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

export default function SignUpStep2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signup } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Dropdown States
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleComplete: (data: SignUpStep2FormValues) => Promise<void> = async (
    data
  ) => {
    // Validate step 1 data from params
    if (!params.fullName || !params.phone || !params.password) {
      Alert.alert(
        "Missing Information",
        "Please complete all required fields."
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
      Alert.alert("Welcome!", "Your account has been created successfully.");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header Background with rounded bottom corners */}
          <View
            className="bg-white"
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
              {/* Back Button */}
              <View className="absolute top-4 left-6">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border border-white/30 shadow-lg"
                >
                  <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* Header Section */}
              <View className="items-center"></View>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Form Container */}
            <View className="flex-1 bg-white pt-8 px-6">
              {/* Image Picker */}
              <View className="items-center mb-6">
                <TouchableOpacity
                  onPress={pickImage}
                  className="relative shadow-xl shadow-slate-200"
                >
                  <View className="w-32 h-32 rounded-full bg-slate-50 items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                    {image ? (
                      <Image
                        source={{ uri: image }}
                        className="w-full h-full"
                      />
                    ) : (
                      <View className="items-center">
                        <Ionicons name="camera" size={32} color="#94a3b8" />
                        <Text className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
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
                  <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                    Team
                  </Text>
                  <Controller
                    control={control}
                    name="team"
                    render={({ field: { value } }) => (
                      <>
                        <TouchableOpacity
                          onPress={() => setModalType("team")}
                          className={`w-full bg-slate-50 border-2 rounded-2xl p-4 flex-row justify-between items-center ${
                            errors.team ? "border-red-500" : "border-slate-200"
                          }`}
                        >
                          <Text
                            className={
                              value
                                ? "text-slate-900 text-base"
                                : "text-slate-400 text-base"
                            }
                          >
                            {value || "Select your team"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#94a3b8"
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
                  <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                    Department
                  </Text>
                  <Controller
                    control={control}
                    name="department"
                    render={({ field: { value } }) => (
                      <>
                        <TouchableOpacity
                          onPress={() => setModalType("department")}
                          className={`w-full bg-slate-50 border-2 rounded-2xl p-4 flex-row justify-between items-center ${
                            errors.department
                              ? "border-red-500"
                              : "border-slate-200"
                          }`}
                        >
                          <Text
                            className={
                              value
                                ? "text-slate-900 text-base"
                                : "text-slate-400 text-base"
                            }
                          >
                            {value || "Select your department"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#94a3b8"
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
                  <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                    Year
                  </Text>
                  <Controller
                    control={control}
                    name="year"
                    render={({ field: { value } }) => (
                      <>
                        <TouchableOpacity
                          onPress={() => setModalType("year")}
                          className={`w-full bg-slate-50 border-2 rounded-2xl p-4 flex-row justify-between items-center ${
                            errors.year ? "border-red-500" : "border-slate-200"
                          }`}
                        >
                          <Text
                            className={
                              value
                                ? "text-slate-900 text-base"
                                : "text-slate-400 text-base"
                            }
                          >
                            {value || "Select your academic year"}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#94a3b8"
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
                  <Text className="text-slate-800 font-bold mb-3 ml-1 text-base">
                    Telegram Handle
                  </Text>
                  <Controller
                    control={control}
                    name="telegram"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View className="relative justify-center">
                        <TextInput
                          className={`w-full bg-slate-50 border-2 rounded-2xl p-4 pl-12 text-slate-900 text-base focus:bg-white ${
                            errors.telegram
                              ? "border-red-500"
                              : "border-slate-200 focus:border-primary"
                          }`}
                          placeholder="@username"
                          placeholderTextColor="#94a3b8"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                        />
                        <View className="absolute left-4">
                          <Ionicons
                            name="paper-plane-outline"
                            size={22}
                            color="#64748b"
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
            options={TEAMS}
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
