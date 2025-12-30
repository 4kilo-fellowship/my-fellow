import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [image, setImage] = useState<string | null>(null);

  // Dropdown States
  const [modalType, setModalType] = useState<
    "team" | "department" | "year" | null
  >(null);

  const [form, setForm] = useState({
    team: "",
    department: "",
    year: "",
    telegram: "",
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

  const handleComplete = () => {
    if (!form.team || !form.department || !form.year) {
      Alert.alert(
        "Missing Information",
        "Please select your Team, Department, and Year."
      );
      return;
    }
    const finalData = { ...params, ...form, profileImage: image };
    console.log("Registration Success:", finalData);
    Alert.alert("Welcome!", "Profile setup complete.");
    // router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              className="mt-4 items-start"
            >
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
              >
                <Ionicons name="arrow-back" size={20} color="#334155" />
              </TouchableOpacity>
            </Animated.View>

            {/* Header Section (Consistent with Step 1) */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              className="mt-6 mb-8 items-center"
            >
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                <Ionicons name="person" size={30} color="#4F46E5" />
              </View>
              <Text className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">
                Personal Details
              </Text>
              <Text className="text-slate-500 mt-2 text-base text-center font-medium leading-6">
                Tell us a bit more about yourself
              </Text>
            </Animated.View>

            {/* Image Picker */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(500).springify()}
              className="items-center mb-8"
            >
              <TouchableOpacity
                onPress={pickImage}
                className="relative shadow-xl shadow-slate-200"
              >
                <View className="w-32 h-32 rounded-full bg-slate-50 items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                  {image ? (
                    <Image source={{ uri: image }} className="w-full h-full" />
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
            </Animated.View>

            {/* Form Fields */}
            <Animated.View
              entering={FadeInDown.delay(400).duration(500)}
              className="space-y-5"
            >
              {/* Team Dropdown */}
              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">
                  Team
                </Text>
                <TouchableOpacity
                  onPress={() => setModalType("team")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-row justify-between items-center"
                >
                  <Text
                    className={
                      form.team
                        ? "text-slate-900 text-base"
                        : "text-slate-400 text-base"
                    }
                  >
                    {form.team || "Select your team"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Department Dropdown */}
              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">
                  Department
                </Text>
                <TouchableOpacity
                  onPress={() => setModalType("department")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-row justify-between items-center"
                >
                  <Text
                    className={
                      form.department
                        ? "text-slate-900 text-base"
                        : "text-slate-400 text-base"
                    }
                  >
                    {form.department || "Select your department"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Year Dropdown */}
              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">
                  Year
                </Text>
                <TouchableOpacity
                  onPress={() => setModalType("year")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-row justify-between items-center"
                >
                  <Text
                    className={
                      form.year
                        ? "text-slate-900 text-base"
                        : "text-slate-400 text-base"
                    }
                  >
                    {form.year || "Select your academic year"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Telegram Input */}
              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">
                  Telegram Handle
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 text-slate-900 text-base focus:border-primary focus:bg-white"
                    placeholder="@username"
                    placeholderTextColor="#94a3b8"
                    value={form.telegram}
                    onChangeText={(t) => setForm({ ...form, telegram: t })}
                    autoCapitalize="none"
                  />
                  <View className="absolute left-4">
                    <Ionicons
                      name="paper-plane-outline"
                      size={20}
                      color="#64748b"
                    />
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Footer Button */}
            <Animated.View
              entering={FadeInUp.delay(600).duration(500)}
              className="mt-10 mb-10"
            >
              <TouchableOpacity
                onPress={handleComplete}
                className="w-full bg-primary py-4 rounded-2xl shadow-lg shadow-primary/40 active:scale-[0.98]"
              >
                <Text className="text-white text-center font-bold text-lg">
                  Finish Registration
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>

          {/* Modals for Selection */}
          <SelectionModal
            visible={modalType === "team"}
            onClose={() => setModalType(null)}
            title="Select Team"
            options={TEAMS}
            onSelect={(val) => setForm({ ...form, team: val })}
          />
          <SelectionModal
            visible={modalType === "department"}
            onClose={() => setModalType(null)}
            title="Select Department"
            options={DEPARTMENTS}
            onSelect={(val) => setForm({ ...form, department: val })}
          />
          <SelectionModal
            visible={modalType === "year"}
            onClose={() => setModalType(null)}
            title="Select Year"
            options={YEARS}
            onSelect={(val) => setForm({ ...form, year: val })}
          />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
