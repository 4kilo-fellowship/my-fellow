import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// STRICTLY import SafeAreaView from here to fix the warning
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpStep1() {
  const router = useRouter();

  // State Management
  const [image, setImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Handle Input Changes
  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  // Image Picker Logic
  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section (No Back Button) */}
        <View className="mt-4 mb-8">
          <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Account
          </Text>
          <Text className="text-gray-500 mt-2 text-base">
            Step 1 of 2: Profile & Security
          </Text>
        </View>

        {/* Image Upload UI */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={handleImagePick}
            className="relative active:opacity-80"
          >
            <View className="h-32 w-32 bg-gray-50 rounded-full items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {image ? (
                <Image source={{ uri: image }} className="h-full w-full" />
              ) : (
                <View className="items-center justify-center">
                  <Ionicons name="camera" size={36} color="#9CA3AF" />
                  <Text className="text-xs text-gray-400 mt-1">Add Photo</Text>
                </View>
              )}
            </View>
            {/* Plus Icon Badge */}
            <View className="absolute bottom-1 right-1 bg-primary h-9 w-9 rounded-full items-center justify-center border-2 border-white shadow-sm">
              <Ionicons name="add" size={22} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="space-y-5">
          {/* Full Name */}
          <View>
            <Text className="text-gray-700 font-semibold mb-2 ml-1">
              Full Name
            </Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:border-primary focus:bg-white"
              placeholder="e.g., Sarah Connor"
              placeholderTextColor="#9CA3AF"
              value={formData.fullName}
              onChangeText={(text) => handleChange("fullName", text)}
              autoCapitalize="words"
            />
          </View>

          {/* Phone Number */}
          <View>
            <Text className="text-gray-700 font-semibold mb-2 ml-1">
              Phone Number
            </Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:border-primary focus:bg-white"
              placeholder="e.g., +251 911 234 567"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => handleChange("phone", text)}
            />
          </View>

          {/* Password Section */}
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">
                Password
              </Text>
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:border-primary focus:bg-white"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
              />
            </View>

            <View className="flex-1">
              <Text className="text-gray-700 font-semibold mb-2 ml-1">
                Confirm
              </Text>
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:border-primary focus:bg-white"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-10 mb-4">
          <TouchableOpacity
            className="w-full bg-primary py-4 rounded-xl shadow-lg shadow-primary/30 flex-row justify-center items-center active:bg-opacity-90"
            onPress={() => {
              // You can add validation here before moving next
              if (!formData.fullName || !formData.password) {
                Alert.alert(
                  "Missing Fields",
                  "Please fill in your name and password."
                );
                return;
              }
              router.push("/sign-up-step-2");
            }}
          >
            <Text className="text-white font-bold text-lg mr-2">Next Step</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center items-center mb-6">
          <Text className="text-gray-500">Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push("/sign-in")}
            className="py-2"
          >
            <Text className="text-primary font-bold text-base">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
