import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpStep1() {
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);

  const handleImagePick = () => {};

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Navigation  */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">
            Create Account
          </Text>
          <Text className="text-gray-500 mt-2">
            Step 1 of 2: Profile Details
          </Text>
        </View>

        {/* Image Upload UI */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={handleImagePick} className="relative">
            <View className="h-28 w-28 bg-gray-100 rounded-full items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
              {image ? (
                <Image source={{ uri: image }} className="h-full w-full" />
              ) : (
                <Ionicons name="camera" size={32} color="#9CA3AF" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-primary h-8 w-8 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="add" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-gray-400 text-sm mt-2">
            Upload Profile Picture
          </Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 font-medium mb-1">Full Name</Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-primary"
              placeholder="John Doe"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-1">Phone Number</Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-primary"
              placeholder="+251 911..."
              keyboardType="phone-pad"
            />
          </View>

          <View>
            <Text className="text-gray-700 font-medium mb-1">
              Telegram Username
            </Text>
            <TextInput
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-primary"
              placeholder="@john_doe"
            />
          </View>

          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-1">Password</Text>
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-primary"
                secureTextEntry
                placeholder="••••••"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-1">Confirm</Text>
              <TextInput
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:border-primary"
                secureTextEntry
                placeholder="••••••"
              />
            </View>
          </View>
        </View>

        {/* Next Button */}
        <View className="mt-8 mb-4">
          <TouchableOpacity
            className="w-full bg-primary py-4 rounded-xl shadow-md shadow-primary/40 flex-row justify-center items-center"
            onPress={() => router.push("/sign-up-step-2")}
          >
            <Text className="text-white font-bold text-lg mr-2">Next Step</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mb-8">
          <Text className="text-gray-500">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/sign-in")}>
            <Text className="text-primary font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
