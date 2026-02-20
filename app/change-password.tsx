import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
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

export default function ChangePasswordScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const { changePassword } = useAuth();
  const router = useRouter();
  const isDark = theme === "dark";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    setIsChanging(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      Alert.alert("Success", "Password updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update password");
    } finally {
      setIsChanging(false);
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

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: top + 10,
            borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
            borderless: true,
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "white" : "#000"}
          />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: isDark ? "white" : "#000" }]}
        >
          Change Password
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
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#9ca3af" : "#666" },
                ]}
              >
                Current Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: isDark ? "#fff" : "#000",
                    borderColor: isDark ? "#333" : "#e5e7eb",
                  },
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Current password"
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
                New Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: isDark ? "#fff" : "#000",
                    borderColor: isDark ? "#333" : "#e5e7eb",
                  },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Minimum 6 characters"
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
                Confirm New Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: isDark ? "#fff" : "#000",
                    borderColor: isDark ? "#333" : "#e5e7eb",
                  },
                ]}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
                placeholder="Confirm your new password"
                placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleChangePassword}
              activeOpacity={0.7}
              disabled={isChanging}
            >
              {isChanging ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Update Password</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 24,
  },
  form: {
    gap: 20,
    marginTop: 10,
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
    backgroundColor: "#000000",
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
