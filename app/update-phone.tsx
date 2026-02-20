import { InfoModal } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
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
import { z } from "zod";

const updatePhoneSchema = z.object({
  newPhoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(09|07)\d{8}$/, "Enter a valid phone number"),
  password: z.string().min(1, "Password is required"),
});

type UpdatePhoneFormValues = z.infer<typeof updatePhoneSchema>;

export default function UpdatePhoneScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const { updatePhone } = useAuth();
  const { user } = useUserStore();
  const router = useRouter();
  const isDark = theme === "dark";

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  }>({ title: "", message: "", type: "success" });

  const [isUpdating, setIsUpdating] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePhoneFormValues>({
    resolver: zodResolver(updatePhoneSchema),
    defaultValues: {
      newPhoneNumber: user?.phoneNumber || "",
      password: "",
    },
  });

  const onSubmit = async (data: UpdatePhoneFormValues) => {
    if (data.newPhoneNumber === user?.phoneNumber) {
      setModalConfig({
        title: "Info",
        message: "This is already your current phone number",
        type: "error",
      });
      setModalVisible(true);
      return;
    }

    setIsUpdating(true);
    try {
      await updatePhone({
        phoneNumber: data.newPhoneNumber,
        password: data.password,
      });
      setModalConfig({
        title: "Success",
        message: "Phone number updated successfully",
        type: "success",
      });
      setModalVisible(true);
    } catch (error: any) {
      setModalConfig({
        title: "Error",
        message: error.message || "Failed to update phone number",
        type: "error",
      });
      setModalVisible(true);
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
              <Controller
                control={control}
                name="newPhoneNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        borderColor: errors.newPhoneNumber
                          ? "#ef4444"
                          : isDark
                            ? "#333"
                            : "#e5e7eb",
                      },
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="phone-pad"
                    placeholder="254..."
                    placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                  />
                )}
              />
              {errors.newPhoneNumber && (
                <Text style={styles.errorText}>
                  {errors.newPhoneNumber.message}
                </Text>
              )}
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
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        borderColor: errors.password
                          ? "#ef4444"
                          : isDark
                            ? "#333"
                            : "#e5e7eb",
                      },
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    placeholder="Current password"
                    placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={1}
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

      <InfoModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          if (modalConfig.type === "success") {
            router.back();
          }
        }}
        isDark={isDark}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
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
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: "#ff6619",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#ff6619",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
