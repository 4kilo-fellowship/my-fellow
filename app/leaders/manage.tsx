import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { AdminGuardFallback } from "@/components/Admin/AdminGuardFallback";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { InfoModal } from "@/components/Modals/InfoModal";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useLeadersStore } from "@/stores/leaders.store";
import { Leader } from "@/types/leader.types";

const LEADER_TYPES = ["Main", "Team"];

export default function ManageLeaderScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();

  const { leaders, createLeader, updateLeader, deleteLeader } =
    useLeadersStore();

  const [loadingInitial, setLoadingInitial] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form states
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLocalImage, setIsLocalImage] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [telegram, setTelegram] = useState<string>("");
  const [type, setType] = useState<"Main" | "Team">("Main");
  const [isVerified, setIsVerified] = useState<boolean>(true);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  useEffect(() => {
    if (!isEditing || !id) {
      setLoadingInitial(false);
      return;
    }

    const existing = leaders.find(
      (l) => l.id === id || (l as any)._id === id,
    );
    if (existing) {
      populateForm(existing);
      setLoadingInitial(false);
    } else {
      setLoadingInitial(false);
    }
  }, [id, isEditing, leaders]);

  const populateForm = (item: Leader) => {
    setName(item.name || "");
    setRole(item.role || "");
    setBio(item.bio || "");
    setPhoneNumber(item.phoneNumber || "");
    setTelegram(item.telegram || "");
    setType(item.type === "Team" ? "Team" : "Main");
    setIsVerified(Boolean(item.isVerified));
    if (item.image) {
      const src =
        typeof item.image === "string"
          ? item.image
          : (item.image as any)?.uri || "";
      setImageUri(src);
      setIsLocalImage(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setInfoModal({
          visible: true,
          title: "Permission Required",
          message:
            "Please allow photo library access to upload a leader portrait.",
          type: "info",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setIsLocalImage(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    } catch {
      setInfoModal({
        visible: true,
        title: "Image Selection Error",
        message: "Failed to open image picker. Please try again.",
        type: "error",
      });
    }
  };

  const validate = (): string | null => {
    if (!name.trim() || name.trim().length < 2) {
      return "Leader name must be at least 2 characters.";
    }
    if (!role.trim() || role.trim().length < 2) {
      return "Role/Ministry title is required.";
    }
    if (!bio.trim() || bio.trim().length < 10) {
      return "Bio must be at least 10 characters.";
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
      return "Valid phone number is required.";
    }
    if (!telegram.trim() || telegram.trim().length < 2) {
      return "Telegram handle is required (e.g., @username).";
    }
    if (!imageUri) {
      return "Please select a portrait photo for the leader.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Validation Error",
        message: errorMsg,
        type: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      const tg = telegram.trim().startsWith("@")
        ? telegram.trim()
        : `@${telegram.trim()}`;

      let payload: any;
      if (isLocalImage && imageUri) {
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("role", role.trim());
        formData.append("bio", bio.trim());
        formData.append("phoneNumber", phoneNumber.trim());
        formData.append("telegram", tg);
        formData.append("type", type);
        formData.append("isVerified", String(isVerified));

        const filename = imageUri.split("/").pop() || "leader_image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("image", {
          uri: imageUri,
          name: filename,
          type: fileType,
        } as any);

        payload = formData;
      } else {
        payload = {
          name: name.trim(),
          role: role.trim(),
          bio: bio.trim(),
          phoneNumber: phoneNumber.trim(),
          telegram: tg,
          type,
          isVerified,
          image: imageUri || "",
        };
      }

      if (isEditing && id) {
        await updateLeader(id, payload);
      } else {
        await createLeader(payload);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Leader Saved",
        message: `Leader profile has been successfully ${isEditing ? "updated" : "created"}.`,
        type: "success",
      });

      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (err: any) {
      const isOffline =
        !err?.response &&
        (err?.message?.includes("Network") ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ERR_NETWORK");
      setInfoModal({
        visible: true,
        title: isOffline ? "Connection Issue" : "Save Failed",
        message: isOffline
          ? "Network connection issue. Please check your internet connection and try again. Your form inputs have been preserved."
          : err?.response?.data?.message ||
            err?.message ||
            "Could not save leader profile.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await deleteLeader(id);
      setDeleteModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Leader Deleted",
        message: "The leader has been removed from directory.",
        type: "success",
      });
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err: any) {
      const isOffline =
        !err?.response &&
        (err?.message?.includes("Network") ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ERR_NETWORK");
      setInfoModal({
        visible: true,
        title: isOffline ? "Connection Issue" : "Delete Failed",
        message: isOffline
          ? "Network connection issue. Please check your internet connection and try again."
          : err?.response?.data?.message ||
            err?.message ||
            "Could not delete leader.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return <AdminGuardFallback title="Manage Leader" />;
  }

  if (loadingInitial) {
    return (
      <View
        style={[
          styles.screen,
          isDark ? styles.screenDark : styles.screenLight,
          styles.centerBox,
        ]}
      >
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        isDark ? styles.screenDark : styles.screenLight,
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader title={isEditing ? "Edit Leader" : "Add Leader"} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Portrait Photo Picker */}
          <View style={[styles.section, { alignItems: "center" }]}>
            <Pressable
              onPress={pickImage}
              style={[
                styles.avatarPicker,
                isDark ? styles.inputDark : styles.inputLight,
              ]}
            >
              {imageUri ? (
                <View style={styles.avatarWrapper}>
                  <ExpoImage
                    source={{ uri: imageUri }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                  <View style={styles.avatarBadge}>
                    <Ionicons name="camera" size={14} color="#fff" />
                  </View>
                </View>
              ) : (
                <View style={styles.avatarEmpty}>
                  <Ionicons name="person-outline" size={40} color="#94a3b8" />
                  <Text
                    style={[
                      styles.avatarHint,
                      isDark ? styles.descDark : styles.descLight,
                    ]}
                  >
                    Add Photo
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Nathan Daniel"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "name" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Role */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Role / Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={role}
              onChangeText={setRole}
              placeholder="e.g., Main Coordinator, Worship Pastor"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("role")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "role" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Type Selection */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Leader Classification <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.row}>
              {LEADER_TYPES.map((t) => {
                const selected = type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setType(t as any);
                    }}
                    style={[
                      styles.chip,
                      { flex: 1, alignItems: "center", justifyContent: "center" },
                      selected
                        ? styles.chipSelected
                        : isDark
                          ? styles.chipDark
                          : styles.chipLight,
                      t === "Main" ? { marginRight: 8 } : { marginLeft: 8 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected
                          ? styles.chipTextSelected
                          : isDark
                            ? styles.descDark
                            : styles.descLight,
                      ]}
                    >
                      {t === "Main" ? "Main Leader" : "Team Leader"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Verified Switch */}
          <View
            style={[
              styles.section,
              styles.rowBetween,
              styles.cardBox,
              isDark ? styles.cardBoxDark : styles.cardBoxLight,
            ]}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={[styles.row, { gap: 6 }]}>
                <Ionicons name="checkmark-circle" size={18} color={PRIMARY} />
                <Text
                  style={[
                    styles.cardBoxTitle,
                    isDark ? styles.textLight : styles.textDark,
                  ]}
                >
                  Verified Fellowship Leader
                </Text>
              </View>
              <Text
                style={[
                  styles.cardBoxDesc,
                  isDark ? styles.descDark : styles.descLight,
                ]}
              >
                Displays the orange verified badge on their directory profile.
              </Text>
            </View>
            <Switch
              value={isVerified}
              onValueChange={setIsVerified}
              trackColor={{ false: "#64748b", true: PRIMARY }}
              thumbColor={Platform.OS === "android" ? "#ffffff" : undefined}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="e.g., +251 91 123 4567"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "phone" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Telegram */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Telegram Handle <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={telegram}
              onChangeText={setTelegram}
              placeholder="e.g., @fellowship_leader"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("telegram")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "telegram" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Biography / Ministry Focus <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Share their testimony, ministry background, or prayer request..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              multiline
              numberOfLines={4}
              onFocus={() => setFocusedField("bio")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                styles.textArea,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "bio" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={[styles.primaryBtn, submitting && styles.btnDisabled]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons
                    name={isEditing ? "checkmark" : "add"}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.primaryBtnText}>
                    {isEditing ? "Update Leader" : "Create Leader"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(true)}
                disabled={deleting}
                style={[styles.deleteBtn, deleting && styles.btnDisabled]}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={styles.deleteBtnText}>Delete Leader</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        isDark={isDark}
        icon="trash-outline"
        iconColor="#ef4444"
        title="Delete Leader"
        description="Are you sure you want to delete this leader profile from the fellowship directory?"
        buttons={[
          {
            label: "Delete",
            variant: "danger",
            onPress: handleDelete,
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />

      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenDark: { backgroundColor: "#000" },
  screenLight: { backgroundColor: "#fff" },
  centerBox: { alignItems: "center", justifyContent: "center" },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  section: { marginBottom: 20 },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  required: { color: "#ef4444" },
  textLight: { color: "#f8fafc" },
  textDark: { color: "#0f172a" },
  descDark: { color: "#94a3b8" },
  descLight: { color: "#64748b" },
  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  inputDark: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
  },
  inputLight: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  inputFocused: {
    borderColor: PRIMARY,
  },
  avatarPicker: {
    width: 104,
    height: 104,
    borderRadius: 52,
    overflow: "hidden",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: { width: "100%", height: "100%", position: "relative" },
  avatarImage: { width: "100%", height: "100%" },
  avatarBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: PRIMARY,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmpty: { alignItems: "center", justifyContent: "center" },
  avatarHint: { fontSize: 11, fontWeight: "600", marginTop: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipDark: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
  },
  chipLight: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  chipSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  chipTextSelected: { color: "#ffffff" },
  cardBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardBoxDark: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
  },
  cardBoxLight: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  cardBoxTitle: { fontSize: 14, fontWeight: "600" },
  cardBoxDesc: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  btnRow: { marginTop: 10, gap: 12 },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  deleteBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  deleteBtnText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
  btnDisabled: { opacity: 0.6 },
});
