import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    // Add auth logic here
    console.log("Sign In", email, password);
    // router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      {/* Header */}
      <View className="mb-10">
        <Text className="text-3xl font-bold text-slate-900">
          Let's Sign you in.
        </Text>
        <Text className="text-slate-500 mt-2 text-base">
          Welcome back. You've been missed!
        </Text>
      </View>

      {/* Form */}
      <View className="space-y-5">
        <View>
          <Text className="text-slate-600 font-medium mb-2 ml-1">Email</Text>
          <TextInput
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-primary focus:bg-white"
            placeholder="name@example.com"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-slate-600 font-medium mb-2 ml-1">Password</Text>
          <TextInput
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:border-primary focus:bg-white"
            placeholder="Enter your password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity className="items-end">
          <Text className="text-primary font-medium">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View className="mt-10">
        <TouchableOpacity
          onPress={handleSignIn}
          className="w-full bg-primary py-4 rounded-2xl shadow-sm shadow-primary/30 active:opacity-90"
        >
          <Text className="text-white text-center font-bold text-lg">
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="flex-row justify-center mt-8">
        <Text className="text-slate-500">Don't have an account? </Text>
        <Link href="/sign-up-step-1" asChild>
          <TouchableOpacity>
            <Text className="text-primary font-bold">Register</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
