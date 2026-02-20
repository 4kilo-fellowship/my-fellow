import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function UpdatePhoneScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const { updatePhone } = useAuth();
  const { user } = useUserStore();
  const router = useRouter();
  const isDark = theme === "dark";

  const [newPhoneNumber, setNewPhoneNumber] = useState(user?.phoneNumber || "");
  const [password, setPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePhone = async () => {
    if (!newPhoneNumber || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPhoneNumber === user?.phoneNumber) {
      Alert.alert("Info", "This is already your current phone number");
      return;
    }

    setIsUpdating(true);
    try {
      await updatePhone({
        phoneNumber: newPhoneNumber,
        password: password,
      });
      Alert.alert("Success", "Phone number updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update phone number");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#ffffff" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        className={`px-5 pb-4 flex-row items-center border-b ${isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"}`}
        style={{ paddingTop: top + 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full items-center justify-center mr-4"
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            borderless: true,
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "white" : "#0f172a"}
          />
        </Pressable>
        <Text
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Update Phone Number
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Text
              style={[styles.infoText, { color: isDark ? "#9ca3af" : "#666" }]}
            >
              Enter your new phone number and verify with your current password.
              You'll need to use your new number to sign in next time.
            </Text>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#9ca3af" : "#666" },
                ]}
              >
                New Phone Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: isDark ? "#fff" : "#000",
                    borderColor: isDark ? "#333" : "#e5e7eb",
                  },
                ]}
                value={newPhoneNumber}
                onChangeText={setNewPhoneNumber}
                keyboardType="phone-pad"
                placeholder="254..."
                placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#9ca3af" : "#666" },
                ]}
              >
                Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: isDark ? "#fff" : "#000",
                    borderColor: isDark ? "#333" : "#e5e7eb",
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Current password"
                placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdatePhone}
              activeOpacity={0.7}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Update Phone Number</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  form: {
    gap: 20,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    fontStyle: "italic",
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#ff6619",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
