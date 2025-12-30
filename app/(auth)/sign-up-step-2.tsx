import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpStep2() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Data from Step 1

  const [image, setImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    team: "",
    department: "",
    year: "",
    telegram: "",
  });

  // Image Picker Logic
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleComplete = () => {
    // Combine Step 1 (params) and Step 2 (form)
    const finalData = {
      ...params,
      ...form,
      profileImage: image,
    };

    console.log("Registration Data:", finalData);
    Alert.alert("Success", "Account created successfully!");
    // router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        {/* Header Navigation */}
        <View className="mt-4 mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-900">
            Finish Profile
          </Text>
          <Text className="text-slate-500 mt-2 text-base">
            Step 2 of 2: Additional Info
          </Text>
        </View>

        {/* Image Upload - Premium Feel */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickImage} className="relative">
            <View className="w-28 h-28 rounded-full bg-slate-100 items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
              {image ? (
                <Image source={{ uri: image }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                  <Ionicons name="camera" size={32} color="#94a3b8" />
                  <Text className="text-xs text-slate-400 mt-1">Upload</Text>
                </View>
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-white">
              <Ionicons name="add" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View className="space-y-5">
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-slate-600 font-medium mb-2 ml-1">
                Team Name
              </Text>
              <TextInput
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-primary focus:bg-white"
                placeholder="e.g. Alpha"
                value={form.team}
                onChangeText={(t) => setForm({ ...form, team: t })}
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-600 font-medium mb-2 ml-1">
                Year of Study
              </Text>
              <TextInput
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-primary focus:bg-white"
                placeholder="e.g. 3rd"
                value={form.year}
                onChangeText={(t) => setForm({ ...form, year: t })}
              />
            </View>
          </View>

          <View>
            <Text className="text-slate-600 font-medium mb-2 ml-1">
              Department
            </Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-primary focus:bg-white"
              placeholder="Computer Science"
              value={form.department}
              onChangeText={(t) => setForm({ ...form, department: t })}
            />
          </View>

          <View>
            <Text className="text-slate-600 font-medium mb-2 ml-1">
              Telegram Username
            </Text>
            <View className="relative justify-center">
              <TextInput
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 text-slate-900 focus:border-primary focus:bg-white"
                placeholder="@username"
                value={form.telegram}
                onChangeText={(t) => setForm({ ...form, telegram: t })}
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
        </View>

        {/* Complete Button */}
        <View className="mt-10 mb-10">
          <TouchableOpacity
            onPress={handleComplete}
            className="w-full bg-primary py-4 rounded-2xl shadow-sm shadow-primary/30"
          >
            <Text className="text-white text-center font-bold text-lg">
              Complete Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
