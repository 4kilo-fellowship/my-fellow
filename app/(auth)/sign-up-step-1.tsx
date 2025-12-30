import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpStep1() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
  });

  const handleNext = () => {
    // Basic validation could go here
    router.push({
      pathname: "/sign-up-step-2",
      params: { ...form }, // Passing data to next step
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
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
          Create Account
        </Text>
        <Text className="text-slate-500 mt-2 text-base">
          Step 1 of 2: Basic Details
        </Text>
      </View>

      {/* Form */}
      <View className="space-y-5">
        <View>
          <Text className="text-slate-600 font-medium mb-2 ml-1">
            Full Name
          </Text>
          <TextInput
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-primary focus:bg-white"
            placeholder="John Doe"
            value={form.fullName}
            onChangeText={(t) => setForm({ ...form, fullName: t })}
          />
        </View>

        <View>
          <Text className="text-slate-600 font-medium mb-2 ml-1">
            Phone Number
          </Text>
          <TextInput
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-primary focus:bg-white"
            placeholder="+1 234 567 890"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(t) => setForm({ ...form, phone: t })}
          />
        </View>

        <View>
          <Text className="text-slate-600 font-medium mb-2 ml-1">Password</Text>
          <TextInput
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-primary focus:bg-white"
            placeholder="Choose a strong password"
            secureTextEntry
            value={form.password}
            onChangeText={(t) => setForm({ ...form, password: t })}
          />
        </View>
      </View>

      {/* Next Button */}
      <View className="mt-auto mb-6">
        <TouchableOpacity
          onPress={handleNext}
          className="w-full bg-primary py-4 rounded-2xl shadow-sm shadow-primary/30 flex-row justify-center items-center space-x-2"
        >
          <Text className="text-white font-bold text-lg">Next Step</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-500">Already have an account? </Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-bold">Log In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
