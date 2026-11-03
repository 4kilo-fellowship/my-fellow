import React, { useEffect, useState } from "react";
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
import { useProgramsStore } from "@/stores/programs.store";
import { Program } from "@/types";

const DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CATEGORY_PRESETS = [
  "Weekly Service",
  "Prayer Meeting",
  "Bible Study",
  "Fellowship",
  "Youth",
  "Special",
];

export default function ManageProgramScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();

  const { programs, createProgram, updateProgram, deleteProgram } =
    useProgramsStore();

  const [loadingInitial, setLoadingInitial] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form states
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLocalImage, setIsLocalImage] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [day, setDay] = useState<string>("Monday");
  const [time, setTime] = useState<string>("");
  const [category, setCategory] = useState<string>("Weekly Service");
  const [location, setLocation] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("9.0358");
  const [longitude, setLongitude] = useState<string>("38.7619");

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

    const existing = programs.find(
      (p) => p.id === id || (p as any)._id === id,
    );
    if (existing) {
      populateForm(existing);
      setLoadingInitial(false);
    } else {
      setLoadingInitial(false);
    }
  }, [id, isEditing, programs]);

  const populateForm = (item: Program) => {
    setTitle(item.title || "");
    setDescription(item.description || "");
    setDay(item.day || "Monday");
    setTime(item.time || "");
    setCategory(item.category || "Weekly Service");
    setLocation(item.location || "");
    if (item.coordinates) {
      setLatitude(item.coordinates.lat?.toString() || "9.0358");
      setLongitude(item.coordinates.lng?.toString() || "38.7619");
    }
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
            "Please allow photo library access to upload a program cover image.",
          type: "info",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
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
    if (!title.trim() || title.trim().length < 2) {
      return "Program title must be at least 2 characters.";
    }
    if (!description.trim() || description.trim().length < 5) {
      return "Program description must be at least 5 characters.";
    }
    if (!time.trim()) {
      return "Service time is required (e.g., 6:00 PM - 8:00 PM).";
    }
    if (!location.trim()) {
      return "Location is required.";
    }
    if (!imageUri) {
      return "Please select a cover image for the program.";
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
      const parsedLat = parseFloat(latitude) || 9.0358;
      const parsedLng = parseFloat(longitude) || 38.7619;

      let payload: any;
      if (isLocalImage && imageUri) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("day", day);
        formData.append("time", time.trim());
        formData.append("category", category);
        formData.append("location", location.trim());
        formData.append(
          "coordinates",
          JSON.stringify({ lat: parsedLat, lng: parsedLng }),
        );

        const filename = imageUri.split("/").pop() || "program_image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("image", {
          uri: imageUri,
          name: filename,
          type,
        } as any);

        payload = formData;
      } else {
        payload = {
          title: title.trim(),
          description: description.trim(),
          day,
          time: time.trim(),
          category,
          location: location.trim(),
          coordinates: { lat: parsedLat, lng: parsedLng },
          image: imageUri || "",
        };
      }

      if (isEditing && id) {
        await updateProgram(id, payload);
      } else {
        await createProgram(payload);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Program Saved",
        message: `The program has been successfully ${isEditing ? "updated" : "created"}.`,
        type: "success",
      });

      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (err: any) {
      setInfoModal({
        visible: true,
        title: "Save Failed",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Could not save program.",
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
      await deleteProgram(id);
      setDeleteModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Program Deleted",
        message: "The program has been removed.",
        type: "success",
      });
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err: any) {
      setInfoModal({
        visible: true,
        title: "Delete Failed",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Could not delete program.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return <AdminGuardFallback title="Manage Program" />;
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
        { paddingTop: insets.top },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader title={isEditing ? "Edit Program" : "Add Program"} />

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
          {/* Cover Image Picker */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Cover Banner <Text style={styles.required}>*</Text>
            </Text>
            <Pressable
              onPress={pickImage}
              style={[
                styles.imagePicker,
                isDark ? styles.inputDark : styles.inputLight,
                imageUri ? styles.imagePickerWithImage : null,
              ]}
            >
              {imageUri ? (
                <View style={styles.imageWrapper}>
                  <ExpoImage
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                  <View style={styles.imageOverlayBadge}>
                    <Ionicons name="camera" size={16} color="#fff" />
                    <Text style={styles.imageOverlayText}>Change</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyImageState}>
                  <Ionicons name="image-outline" size={40} color="#94a3b8" />
                  <Text
                    style={[
                      styles.emptyImageText,
                      isDark ? styles.descDark : styles.descLight,
                    ]}
                  >
                    Tap to select 16:9 banner
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Friday Youth Worship Service"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "title" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Day Selection */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Day of Week <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {DAY_OPTIONS.map((d) => {
                const selected = day === d;
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setDay(d);
                    }}
                    style={[
                      styles.chip,
                      selected ? styles.chipSelected : isDark ? styles.chipDark : styles.chipLight,
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
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Time <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="e.g., 6:00 PM - 8:00 PM"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("time")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "time" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Category <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.wrapChips}>
              {CATEGORY_PRESETS.map((cat) => {
                const selected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setCategory(cat);
                    }}
                    style={[
                      styles.chip,
                      selected ? styles.chipSelected : isDark ? styles.chipDark : styles.chipLight,
                      { marginBottom: 8 },
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
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Location / Venue <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Main Sanctuary, 4 Kilo Campus"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("location")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "location" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Coordinates */}
          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              >
                Latitude
              </Text>
              <TextInput
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
                placeholder="9.0358"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              />
            </View>
            <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              >
                Longitude
              </Text>
              <TextInput
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
                placeholder="38.7619"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Detailed description of the program and schedule..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              multiline
              numberOfLines={4}
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                styles.textArea,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "description" && styles.inputFocused,
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
                    {isEditing ? "Update Program" : "Create Program"}
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
                <Text style={styles.deleteBtnText}>Delete Program</Text>
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
        title="Delete Program"
        description="Are you sure you want to permanently delete this program? This action cannot be undone."
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
  chipsRow: { gap: 8 },
  wrapChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
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
  imagePicker: {
    height: 180,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePickerWithImage: { borderStyle: "solid" },
  imageWrapper: { width: "100%", height: "100%", position: "relative" },
  previewImage: { width: "100%", height: "100%" },
  imageOverlayBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  imageOverlayText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  emptyImageState: { alignItems: "center", gap: 8 },
  emptyImageText: { fontSize: 13 },
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
