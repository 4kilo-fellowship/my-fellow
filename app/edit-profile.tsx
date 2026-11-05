import { InfoModal, ScreenHeader } from "@/components";
import { useConfirmUnsavedChanges } from "@/hooks/useConfirmUnsavedChanges";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { useCommunityStore } from "@/stores/community.store";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
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

const editProfileSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
  location: z.string().max(80, "Location cannot exceed 80 characters").optional(),
  department: z.string().optional(),
  yearOfStudy: z.string().optional(),
  telegramUserName: z.string().optional(),
  team: z.string().optional(),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export default function EditProfileScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const { updateProfile } = useAuth();
  const { user } = useUserStore();
  const currentMember = useCommunityStore((s) =>
    user?.id ? s.members[user.id] : undefined
  );
  const router = useRouter();
  const isDark = theme === "dark";

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  }>({ title: "", message: "", type: "success" });

  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profileImage || null,
  );
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      bio: currentMember?.bio || (user as any)?.bio || "",
      location: currentMember?.location || (user as any)?.location || "",
      department: user?.department || currentMember?.department || "",
      yearOfStudy: user?.yearOfStudy || currentMember?.academicYear || "",
      telegramUserName: user?.telegramUserName || currentMember?.telegramUsername || "",
      team:
        typeof user?.team === "string"
          ? user.team
          : (user?.team as any)?.name || (user?.team as any)?.fullName || currentMember?.team || "",
    },
  });

  const hasUnsavedImage = profileImage !== (user?.profileImage || null);
  const hasUnsavedChanges = isDirty || hasUnsavedImage;

  useConfirmUnsavedChanges(hasUnsavedChanges, {
    title: "Discard profile changes?",
    message: "You have unsaved edits to your profile.",
    discardLabel: "Discard",
    continueLabel: "Keep Editing",
  });

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const onSave = async (data: EditProfileFormValues) => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        ...data,
        profileImage,
      });

      // Synchronize bio, location, and department with social profile API
      try {
        await api.patch("/v1/me/profile", {
          bio: data.bio,
          location: data.location,
          department: data.department,
        });
      } catch {}

      if (user?.id) {
        useCommunityStore.getState().updateMemberProfile(user.id, {
          bio: data.bio,
          location: data.location,
          department: data.department,
          academicYear: data.yearOfStudy,
        });
      }

      setModalConfig({
        title: "Success",
        message: "Profile updated.",
        type: "success",
      });
      setModalVisible(true);
    } catch (error: any) {
      setModalConfig({
        title: "Error",
        message: error.message || "Failed to update profile.",
        type: "error",
      });
      setModalVisible(true);
    } finally {
      setIsUpdatingProfile(false);
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

      <ScreenHeader
        title="Edit Profile"
        containerStyle={{
          backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
          borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? top + 60 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              onPress={handlePickImage}
              activeOpacity={1}
              style={styles.imageContainer}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View
                  style={[
                    styles.imagePlaceholder,
                    { backgroundColor: isDark ? "#111" : "#f3f4f6" },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={40}
                    color={isDark ? "#333" : "#d1d5db"}
                  />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#9ca3af" : "#666" },
                ]}
              >
                Full Name
              </Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        borderColor: errors.fullName
                          ? "#ef4444"
                          : isDark
                            ? "#333"
                            : "#e5e7eb",
                      },
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Full name"
                    placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                  />
                )}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#9ca3af" : "#666" },
                ]}
              >
                Bio
              </Text>
              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        borderColor: errors.bio
                          ? "#ef4444"
                          : isDark
                            ? "#333"
                            : "#e5e7eb",
                        minHeight: 64,
                        textAlignVertical: "top",
                        paddingTop: 10,
                      },
                    ]}
                    multiline
                    numberOfLines={3}
                    maxLength={300}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Tell fellowship members about yourself"
                    placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                  />
                )}
              />
              {errors.bio && (
                <Text style={styles.errorText}>{errors.bio.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#9ca3af" : "#666" },
                ]}
              >
                Campus Location
              </Text>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        borderColor: errors.location
                          ? "#ef4444"
                          : isDark
                            ? "#333"
                            : "#e5e7eb",
                      },
                    ]}
                    maxLength={80}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g. AAU 4 Kilo Campus, Block 54"
                    placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                  />
                )}
              />
              {errors.location && (
                <Text style={styles.errorText}>{errors.location.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#9ca3af" : "#666" },
                ]}
              >
                Department
              </Text>
              <Controller
                control={control}
                name="department"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        borderColor: isDark ? "#333" : "#e5e7eb",
                      },
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Department"
                    placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#9ca3af" : "#666" },
                ]}
              >
                Year of Study
              </Text>
              <Controller
                control={control}
                name="yearOfStudy"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        borderColor: isDark ? "#333" : "#e5e7eb",
                      },
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Year of study"
                    placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#9ca3af" : "#666" },
                ]}
              >
                Telegram Handle
              </Text>
              <Controller
                control={control}
                name="telegramUserName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        borderColor: isDark ? "#333" : "#e5e7eb",
                      },
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="@username"
                    placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                    autoCapitalize="none"
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#9ca3af" : "#666" },
                ]}
              >
                Team
              </Text>
              <Controller
                control={control}
                name="team"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: isDark ? "#fff" : "#000",
                        borderColor: isDark ? "#333" : "#e5e7eb",
                      },
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Team name"
                    placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                  />
                )}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                Platform.OS === "ios" && pressed && { opacity: 0.85 },
              ]}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.25)",
                borderless: false,
                foreground: true,
              }}
              onPress={() => handleSubmit(onSave)()}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </Pressable>
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
  imageSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  imageContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    position: "relative",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  imagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#ff6619",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  form: {
    gap: 20,
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
    overflow: "hidden",
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
