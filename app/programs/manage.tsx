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
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

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
  "General",
  "Team",
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
  const [category, setCategory] = useState<string>("General");
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
    setCategory(item.category || "General");
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
    if (!imageUri) {
      return "Please select a cover banner for the program.";
    }
    if (!title.trim() || title.trim().length < 2) {
      return "Program title must be at least 2 characters.";
    }
    if (!time.trim()) {
      return "Service time is required (e.g., 5:00 PM - 8:00 PM).";
    }
    if (!location.trim()) {
      return "Location / Venue is required.";
    }
    if (!description.trim() || description.trim().length < 5) {
      return "Program description must be at least 5 characters.";
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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
            "Could not delete program.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: isDark ? "#0A0A0A" : "#ffffff" },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ScreenHeader title={isEditing ? "Edit Program" : "Manage Program"} />
        <View style={styles.centerBox}>
          <Ionicons
            name="shield-outline"
            size={56}
            color={isDark ? "#52525b" : "#94a3b8"}
          />
          <Text
            style={[
              styles.unauthorizedTitle,
              { color: isDark ? "#fff" : "#0f172a" },
            ]}
          >
            Admin Access Required
          </Text>
          <Text
            style={[
              styles.unauthorizedDesc,
              { color: isDark ? "#a1a1aa" : "#64748b" },
            ]}
          >
            You must be signed in with an authorized fellowship administrator
            account to manage programs.
          </Text>
        </View>
      </View>
    );
  }

  if (loadingInitial) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: isDark ? "#0A0A0A" : "#ffffff" },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ScreenHeader title={isEditing ? "Edit Program" : "Create Program"} />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text
            style={[
              styles.loadingText,
              { color: isDark ? "#a1a1aa" : "#64748b" },
            ]}
          >
            Loading program details...
          </Text>
        </View>
      </View>
    );
  }

  const rippleColor = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isDark ? "#0A0A0A" : "#ffffff" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader
        title={isEditing ? "Edit Program" : "Create Program"}
        containerStyle={{
          backgroundColor: isDark ? "#0A0A0A" : "#ffffff",
          borderBottomColor: isDark ? "#27272a" : "#e2e8f0",
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cover Banner Picker */}
          <View style={styles.section}>
            <View style={styles.bannerHeaderRow}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? "#e4e4e7" : "#0f172a", marginBottom: 0 },
                ]}
              >
                Cover Banner <Text style={styles.required}>*</Text>
              </Text>
            </View>

            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <ExpoImage
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                  contentFit="cover"
                />
                <View style={styles.imageOverlayRow}>
                  <View style={styles.changeImageBtnWrap}>
                    <Pressable
                      onPress={pickImage}
                      android_ripple={{
                        color: "rgba(255, 255, 255, 0.25)",
                        borderless: false,
                        foreground: true,
                      }}
                      style={styles.changeImageBtnInner}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={16}
                        color="#ffffff"
                      />
                      <Text style={styles.changeImageText}>Change</Text>
                    </Pressable>
                  </View>
                  <View style={styles.removeImageBtnWrap}>
                    <Pressable
                      onPress={() => {
                        setImageUri(null);
                        setIsLocalImage(false);
                      }}
                      android_ripple={{
                        color: "rgba(239, 68, 68, 0.3)",
                        borderless: false,
                        foreground: true,
                      }}
                      style={styles.removeImageBtnInner}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#ef4444"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.uploadPlaceholderContainer,
                  {
                    borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                    backgroundColor: isDark ? "#18181b" : "#f1f5f9",
                  },
                ]}
              >
                <Pressable
                  onPress={pickImage}
                  android_ripple={{
                    color: rippleColor,
                    borderless: false,
                    foreground: true,
                  }}
                  style={styles.uploadPlaceholderInner}
                >
                  <View style={styles.uploadIconCircle}>
                    <Ionicons name="image-outline" size={28} color={PRIMARY} />
                  </View>
                  <Text
                    style={[
                      styles.uploadTitle,
                      { color: isDark ? "#ffffff" : "#0f172a" },
                    ]}
                  >
                    Upload Program Banner
                  </Text>
                  <Text
                    style={[
                      styles.uploadSubtitle,
                      { color: isDark ? "#a1a1aa" : "#64748b" },
                    ]}
                  >
                    Recommended aspect ratio 16:9 • High resolution
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Program Title */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Program Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Monday Fellowship Service"
              placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
              style={[
                styles.input,
                {
                  color: isDark ? "#ffffff" : "#0f172a",
                  borderColor:
                    focusedField === "title"
                      ? PRIMARY
                      : isDark
                        ? "#27272a"
                        : "#cbd5e1",
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                },
              ]}
            />
          </View>

          {/* Category Chips */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Category <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.wrapChips}>
              {CATEGORY_PRESETS.map((cat) => {
                const selected = category === cat;
                return (
                  <View
                    key={cat}
                    style={[
                      styles.chipWrap,
                      selected
                        ? { backgroundColor: PRIMARY, borderColor: PRIMARY }
                        : {
                            backgroundColor: isDark ? "#18181b" : "#ffffff",
                            borderColor: isDark ? "#27272a" : "#cbd5e1",
                          },
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light,
                        ).catch(() => {});
                        setCategory(cat);
                      }}
                      android_ripple={{
                        color: selected
                          ? "rgba(255, 255, 255, 0.25)"
                          : rippleColor,
                        borderless: false,
                        foreground: true,
                      }}
                      style={styles.chipInner}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected
                            ? { color: "#ffffff", fontWeight: "700" }
                            : { color: isDark ? "#a1a1aa" : "#475569" },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Day of Week Chips */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Day of Week <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalChipsRow}
            >
              {DAY_OPTIONS.map((d) => {
                const selected = day === d;
                return (
                  <View
                    key={d}
                    style={[
                      styles.chipWrap,
                      selected
                        ? { backgroundColor: PRIMARY, borderColor: PRIMARY }
                        : {
                            backgroundColor: isDark ? "#18181b" : "#ffffff",
                            borderColor: isDark ? "#27272a" : "#cbd5e1",
                          },
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light,
                        ).catch(() => {});
                        setDay(d);
                      }}
                      android_ripple={{
                        color: selected
                          ? "rgba(255, 255, 255, 0.25)"
                          : rippleColor,
                        borderless: false,
                        foreground: true,
                      }}
                      style={styles.chipInner}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected
                            ? { color: "#ffffff", fontWeight: "700" }
                            : { color: isDark ? "#a1a1aa" : "#475569" },
                        ]}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Time */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Time <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              onFocus={() => setFocusedField("time")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. 5:00 PM - 8:00 PM"
              placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
              style={[
                styles.input,
                {
                  color: isDark ? "#ffffff" : "#0f172a",
                  borderColor:
                    focusedField === "time"
                      ? PRIMARY
                      : isDark
                        ? "#27272a"
                        : "#cbd5e1",
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                },
              ]}
            />
          </View>

          {/* Location / Venue */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Location / Venue <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              onFocus={() => setFocusedField("location")}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Hibret Amba, 4 Kilo Campus"
              placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
              style={[
                styles.input,
                {
                  color: isDark ? "#ffffff" : "#0f172a",
                  borderColor:
                    focusedField === "location"
                      ? PRIMARY
                      : isDark
                        ? "#27272a"
                        : "#cbd5e1",
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                },
              ]}
            />
          </View>

          {/* Coordinates (Latitude & Longitude) */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Coordinates (Map Coordinates)
            </Text>
            <View style={styles.coordinatesRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={latitude}
                  onChangeText={setLatitude}
                  onFocus={() => setFocusedField("latitude")}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="numeric"
                  placeholder="Latitude (e.g. 9.0358)"
                  placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
                  style={[
                    styles.input,
                    {
                      color: isDark ? "#ffffff" : "#0f172a",
                      borderColor:
                        focusedField === "latitude"
                          ? PRIMARY
                          : isDark
                            ? "#27272a"
                            : "#cbd5e1",
                      backgroundColor: isDark ? "#18181b" : "#ffffff",
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={longitude}
                  onChangeText={setLongitude}
                  onFocus={() => setFocusedField("longitude")}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="numeric"
                  placeholder="Longitude (e.g. 38.7619)"
                  placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
                  style={[
                    styles.input,
                    {
                      color: isDark ? "#ffffff" : "#0f172a",
                      borderColor:
                        focusedField === "longitude"
                          ? PRIMARY
                          : isDark
                            ? "#27272a"
                            : "#cbd5e1",
                      backgroundColor: isDark ? "#18181b" : "#ffffff",
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Program Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
              placeholder="Detailed overview of the program, topics, and schedule..."
              placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
              multiline
              numberOfLines={4}
              style={[
                styles.input,
                styles.multilineTall,
                {
                  color: isDark ? "#ffffff" : "#0f172a",
                  borderColor:
                    focusedField === "description"
                      ? PRIMARY
                      : isDark
                        ? "#27272a"
                        : "#cbd5e1",
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                },
              ]}
            />
          </View>

          {/* Action Buttons - Fully rounded pill matching event manager */}
          <View style={styles.submitSection}>
            <View
              style={[
                styles.submitBtnWrap,
                { backgroundColor: PRIMARY },
              ]}
            >
              <Pressable
                onPress={handleSubmit}
                disabled={submitting || deleting}
                android_ripple={{
                  color: "rgba(255, 255, 255, 0.3)",
                  borderless: false,
                  foreground: true,
                }}
                style={styles.submitBtnInner}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <View style={styles.btnContent}>
                    <Ionicons
                      name={
                        isEditing
                          ? "checkmark-circle-outline"
                          : "paper-plane-outline"
                      }
                      size={20}
                      color="#ffffff"
                    />
                    <Text style={styles.submitButtonText}>
                      {isEditing ? "Save Changes" : "Publish Program"}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Delete Option (Editing Mode Only) */}
            {isEditing && (
              <View style={styles.deleteBtnWrap}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Medium,
                    ).catch(() => {});
                    setDeleteModalVisible(true);
                  }}
                  disabled={submitting || deleting}
                  android_ripple={{
                    color: "rgba(239, 68, 68, 0.25)",
                    borderless: false,
                    foreground: true,
                  }}
                  style={styles.deleteBtnInner}
                >
                  {deleting ? (
                    <ActivityIndicator color="#ef4444" size="small" />
                  ) : (
                    <View style={styles.btnContent}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ef4444"
                      />
                      <Text style={styles.deleteButtonText}>Delete Program</Text>
                    </View>
                  )}
                </Pressable>
              </View>
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
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  bannerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  required: {
    color: PRIMARY,
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "500",
  },
  multilineTall: {
    height: 110,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  imagePreviewContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imageOverlayRow: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  changeImageBtnWrap: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  changeImageBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  changeImageText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  removeImageBtnWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  removeImageBtnInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadPlaceholderContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  uploadPlaceholderInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,103,25,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  wrapChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  horizontalChipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  chipWrap: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  chipInner: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  coordinatesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  submitSection: {
    marginTop: 14,
    gap: 12,
  },
  submitBtnWrap: {
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    elevation: 3,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  submitBtnInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteBtnWrap: {
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(239,68,68,0.35)",
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  deleteBtnInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "700",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  unauthorizedTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  unauthorizedDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
});
