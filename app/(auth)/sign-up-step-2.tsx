import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpStep2() {
  const router = useRouter();

  const handleComplete = () => {
    // 1. Validate inputs
    // 2. Combine data from Step 1 and Step 2
    // 3. API Call
    alert("Sign Up Completed!");
    // router.replace('/(tabs)'); // Navigate to home
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Navigation Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">
            Academic Info
          </Text>
          <Text className="text-gray-500 mt-2">
            Step 2 of 2: Team & Department
          </Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-6">
          {/* Department */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Department</Text>
            <View className="relative">
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-primary pr-10"
                placeholder="Software Engineering"
              />
              <Ionicons
                name="school-outline"
                size={20}
                color="#9CA3AF"
                className="absolute right-4 top-4"
              />
            </View>
          </View>

          {/* Team */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">Team Name</Text>
            <View className="relative">
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-primary pr-10"
                placeholder="Alpha Squad"
              />
              <Ionicons
                name="people-outline"
                size={20}
                color="#9CA3AF"
                className="absolute right-4 top-4"
              />
            </View>
          </View>

          {/* Year of Study */}
          <View>
            <Text className="text-gray-700 font-medium mb-1">
              Year of Study
            </Text>
            <View className="flex-row space-x-3">
              {["1", "2", "3", "4", "5+"].map((year) => (
                <TouchableOpacity
                  key={year}
                  className="flex-1 bg-gray-50 border border-gray-200 py-3 rounded-lg items-center active:bg-primary/10 active:border-primary"
                >
                  <Text className="text-gray-700 font-medium">{year}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Complete Button */}
        <View className="mt-auto pt-8">
          <TouchableOpacity
            className="w-full bg-primary py-4 rounded-xl shadow-md shadow-primary/40 flex-row justify-center items-center"
            onPress={handleComplete}
          >
            <Text className="text-white font-bold text-lg mr-2">
              Complete Registration
            </Text>
            <Ionicons name="checkmark-circle-outline" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-4 mt-2 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-gray-500 font-medium">Back to Step 1</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
