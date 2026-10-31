import React, { useEffect, useState } from "react";
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
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { Host, Switch } from "@expo/ui";
import { Ionicons } from "@expo/vector-icons";

import { ScreenHeader } from "@/components/ScreenHeader";
import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { InfoModal } from "@/components/Modals/InfoModal";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useEventsStore } from "@/stores/events.store";

const PRESET_CTA_OPTIONS = [
  "Register Now",
  "Notify Me",
  "Join Service",
  "Learn More",
];

export default function ManageEventScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();

  const {
    eventsList,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    pendingGeneratedPoster,
    setPendingGeneratedPoster,
  } = useEventsStore();

  const [loadingInitial, setLoadingInitial] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

  // Focus tracking for input border colors
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Listen for AI poster generated on dedicated AI studio screen
  useEffect(() => {
    if (pendingGeneratedPoster) {
      setImageUri(pendingGeneratedPoster);
      setIsLocalImage(false);
      setPendingGeneratedPoster(null);
      setInfoModal({
        visible: true,
        title: "AI Poster Applied",
        message:
          "The AI-generated poster has been applied to this event banner.",
        type: "success",
      });
    }
  }, [pendingGeneratedPoster, setPendingGeneratedPoster]);

  // Form states
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLocalImage, setIsLocalImage] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");
  const [fullDescription, setFullDescription] = useState<string>("");

  // Dates
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 1);
  defaultStart.setHours(9, 0, 0, 0);

  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(12, 0, 0, 0);

  const [startDate, setStartDate] = useState<Date>(defaultStart);
  const [endDate, setEndDate] = useState<Date>(defaultEnd);
  const [buttonText, setButtonText] = useState<string>("Register Now");
  const [registrationLimit, setRegistrationLimit] = useState<string>("");
  const [enableScheduling, setEnableScheduling] = useState<boolean>(false);
  const [scheduledAt, setScheduledAt] = useState<Date>(new Date());

  // Android Material 3 Date/Time picker state
  const [activePicker, setActivePicker] = useState<{
    target: "start" | "end" | "schedule";
    mode: "date" | "time";
  } | null>(null);

  // Info modal alert
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  // Populate data when editing
  useEffect(() => {
    if (isEditing && id) {
      const existing = eventsList.find(
        (e) => e._id === id || (e as any).id === id,
      );
      if (existing) {
        setTitle(existing.title || "");
        setShortDescription(existing.shortDescription || "");
        setFullDescription(existing.fullDescription || "");
        if (existing.imageUrl) {
          setImageUri(existing.imageUrl);
          setIsLocalImage(false);
        }
        if (existing.startDate) {
          setStartDate(new Date(existing.startDate));
        }
        if (existing.endDate) {
          setEndDate(new Date(existing.endDate));
        }
        if (existing.buttonText) {
          setButtonText(existing.buttonText);
        }
        if (
          existing.registrationLimit !== undefined &&
          existing.registrationLimit !== null
        ) {
          setRegistrationLimit(String(existing.registrationLimit));
        }
        if (existing.scheduledAt) {
          setEnableScheduling(true);
          setScheduledAt(new Date(existing.scheduledAt));
        }
        setLoadingInitial(false);
      } else {
        fetchEvents().finally(() => setLoadingInitial(false));
      }
    }
  }, [id, isEditing, eventsList, fetchEvents]);

  const handlePickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
      Alert.alert("Error", "Could not open gallery to select banner image.");
    }
  };

  const handleDateChange = (selectedDate?: Date) => {
    if (!selectedDate || !activePicker) {
      setActivePicker(null);
      return;
    }

    const { target, mode } = activePicker;

    if (target === "start") {
      const updated = new Date(startDate);
      if (mode === "date") {
        updated.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
        );
        setStartDate(updated);
        // Automatically open time picker on Android
        setTimeout(() => {
          setActivePicker({ target: "start", mode: "time" });
        }, 50);
        return;
      } else {
        updated.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0);
        setStartDate(updated);
        if (updated >= endDate) {
          const autoEnd = new Date(updated);
          autoEnd.setHours(autoEnd.getHours() + 2);
          setEndDate(autoEnd);
        }
      }
    } else if (target === "end") {
      const updated = new Date(endDate);
      if (mode === "date") {
        updated.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
        );
        setEndDate(updated);
        setTimeout(() => {
          setActivePicker({ target: "end", mode: "time" });
        }, 50);
        return;
      } else {
        updated.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0);
        setEndDate(updated);
      }
    } else if (target === "schedule") {
      const updated = new Date(scheduledAt);
      if (mode === "date") {
        updated.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
        );
        setScheduledAt(updated);
        setTimeout(() => {
          setActivePicker({ target: "schedule", mode: "time" });
        }, 50);
        return;
      } else {
        updated.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0);
        setScheduledAt(updated);
      }
    }

    setActivePicker(null);
  };

  const validate = (): string | null => {
    if (!title.trim() || title.trim().length < 3) {
      return "Title must be at least 3 characters long.";
    }
    if (!shortDescription.trim() || shortDescription.trim().length < 5) {
      return "Short description must be at least 5 characters long.";
    }
    if (!imageUri) {
      return "Please select a banner image for the event.";
    }
    if (endDate <= startDate) {
      return "End date and time must be after the start date.";
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

      const payload: any = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim() || shortDescription.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        buttonText: buttonText.trim() || "Register Now",
      };

      if (registrationLimit.trim()) {
        const parsedLimit = parseInt(registrationLimit.trim(), 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          payload.registrationLimit = parsedLimit;
        }
      }

      if (enableScheduling && scheduledAt) {
        payload.scheduledAt = scheduledAt.toISOString();
      }

      if (isLocalImage && imageUri) {
        const formData = new FormData();
        const filename = imageUri.split("/").pop() || "event-banner.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", {
          uri: imageUri,
          name: filename,
          type,
        } as any);

        Object.keys(payload).forEach((key) => {
          if (payload[key] !== undefined && payload[key] !== null) {
            formData.append(key, String(payload[key]));
          }
        });

        if (isEditing && id) {
          await updateEvent(id, formData);
        } else {
          await createEvent(formData);
        }
      } else {
        const jsonPayload = {
          ...payload,
          imageUrl: imageUri,
        };

        if (isEditing && id) {
          await updateEvent(id, jsonPayload);
        } else {
          await createEvent(jsonPayload);
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      await fetchEvents();
      router.back();
    } catch (err: any) {
      setInfoModal({
        visible: true,
        title: isEditing ? "Update Failed" : "Create Failed",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Could not save event. Please check details and try again.",
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
      const success = await deleteEvent(id);
      if (success) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        await fetchEvents();
        router.back();
      } else {
        setInfoModal({
          visible: true,
          title: "Delete Failed",
          message: "Could not delete this event. Please try again.",
          type: "error",
        });
      }
    } catch (err: any) {
      setInfoModal({
        visible: true,
        title: "Delete Failed",
        message: err?.message || "Failed to delete event.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!isAdmin) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: isDark ? "#0A0A0A" : "#f8fafc" },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ScreenHeader title="Manage Event" />
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
            account to manage events.
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
          { backgroundColor: isDark ? "#0A0A0A" : "#f8fafc" },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ScreenHeader title={isEditing ? "Edit Event" : "Create Event"} />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text
            style={[
              styles.loadingText,
              { color: isDark ? "#a1a1aa" : "#64748b" },
            ]}
          >
            Loading event details...
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
        { backgroundColor: isDark ? "#0A0A0A" : "#f8fafc" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader
        title={isEditing ? "Edit Event" : "Create Event"}
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
          {/* Banner Image Picker */}
          <View style={styles.section}>
            <View style={styles.bannerHeaderRow}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? "#e4e4e7" : "#0f172a", marginBottom: 0 },
                ]}
              >
                Banner Poster <Text style={styles.required}>*</Text>
              </Text>

              <View
                style={[
                  styles.aiButtonWrap,
                  { borderColor: isDark ? "#3f3f46" : "#cbd5e1" },
                ]}
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                      () => {},
                    );
                    router.push({
                      pathname: "/events/ai-poster",
                      params: {
                        initialTitle: title,
                        initialDescription:
                          shortDescription || fullDescription,
                      },
                    } as any);
                  }}
                  android_ripple={{
                    color: rippleColor,
                    borderless: false,
                    foreground: true,
                  }}
                  style={({ pressed }) => [
                    styles.aiButtonInner,
                    pressed && Platform.OS === "ios" && { opacity: 0.75 },
                  ]}
                >
                  <Ionicons name="sparkles" size={14} color={PRIMARY} />
                  <Text
                    style={[
                      styles.aiButtonText,
                      { color: isDark ? "#e4e4e7" : "#334155" },
                    ]}
                  >
                    Generate with AI
                  </Text>
                </Pressable>
              </View>
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
                      onPress={handlePickImage}
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
                  onPress={handlePickImage}
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
                    Upload Event Banner
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

          {/* Title */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Event Title <Text style={styles.required}>*</Text>
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

          {/* Short Description */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Short Summary <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={shortDescription}
              onChangeText={setShortDescription}
              onFocus={() => setFocusedField("shortDescription")}
              onBlur={() => setFocusedField(null)}
              placeholder="Brief 1-2 sentence description for preview cards..."
              placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
              multiline
              numberOfLines={2}
              style={[
                styles.input,
                styles.multilineShort,
                {
                  color: isDark ? "#ffffff" : "#0f172a",
                  borderColor:
                    focusedField === "shortDescription"
                      ? PRIMARY
                      : isDark
                        ? "#27272a"
                        : "#cbd5e1",
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                },
              ]}
            />
          </View>

          {/* Full Description */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Full Details
            </Text>
            <TextInput
              value={fullDescription}
              onChangeText={setFullDescription}
              onFocus={() => setFocusedField("fullDescription")}
              onBlur={() => setFocusedField(null)}
              placeholder="Full event schedule, guest speakers, location highlights..."
              placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
              multiline
              numberOfLines={4}
              style={[
                styles.input,
                styles.multilineTall,
                {
                  color: isDark ? "#ffffff" : "#0f172a",
                  borderColor:
                    focusedField === "fullDescription"
                      ? PRIMARY
                      : isDark
                        ? "#27272a"
                        : "#cbd5e1",
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                },
              ]}
            />
          </View>

          {/* Dates Section */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Event Schedule <Text style={styles.required}>*</Text>
            </Text>

            {/* Start Date */}
            <View style={styles.datePickerRow}>
              <Text
                style={[
                  styles.dateSubLabel,
                  { color: isDark ? "#a1a1aa" : "#64748b" },
                ]}
              >
                Starts
              </Text>
              {Platform.OS === "ios" ? (
                <View style={styles.iosDatePickerWrap}>
                  <DateTimePicker
                    value={startDate}
                    mode="datetime"
                    display="compact"
                    accentColor={PRIMARY}
                    onValueChange={(_, selectedDate) => {
                      if (selectedDate) {
                        setStartDate(selectedDate);
                        if (selectedDate >= endDate) {
                          const autoEnd = new Date(selectedDate);
                          autoEnd.setHours(autoEnd.getHours() + 2);
                          setEndDate(autoEnd);
                        }
                      }
                    }}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.dateChipWrap,
                    {
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
                      setActivePicker({ target: "start", mode: "date" });
                    }}
                    android_ripple={{
                      color: rippleColor,
                      borderless: false,
                      foreground: true,
                    }}
                    style={styles.dateChipInner}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={PRIMARY}
                    />
                    <Text
                      style={[
                        styles.dateChipText,
                        { color: isDark ? "#ffffff" : "#0f172a" },
                      ]}
                    >
                      {formatDateTime(startDate)}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={isDark ? "#71717a" : "#94a3b8"}
                    />
                  </Pressable>
                </View>
              )}
            </View>

            {/* End Date */}
            <View style={[styles.datePickerRow, { marginTop: 10 }]}>
              <Text
                style={[
                  styles.dateSubLabel,
                  { color: isDark ? "#a1a1aa" : "#64748b" },
                ]}
              >
                Ends
              </Text>
              {Platform.OS === "ios" ? (
                <View style={styles.iosDatePickerWrap}>
                  <DateTimePicker
                    value={endDate}
                    mode="datetime"
                    display="compact"
                    accentColor={PRIMARY}
                    minimumDate={startDate}
                    onValueChange={(_, selectedDate) => {
                      if (selectedDate) setEndDate(selectedDate);
                    }}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.dateChipWrap,
                    {
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
                      setActivePicker({ target: "end", mode: "date" });
                    }}
                    android_ripple={{
                      color: rippleColor,
                      borderless: false,
                      foreground: true,
                    }}
                    style={styles.dateChipInner}
                  >
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={PRIMARY}
                    />
                    <Text
                      style={[
                        styles.dateChipText,
                        { color: isDark ? "#ffffff" : "#0f172a" },
                      ]}
                    >
                      {formatDateTime(endDate)}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={isDark ? "#71717a" : "#94a3b8"}
                    />
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* CTA Button Text Presets */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Action Button (CTA)
            </Text>
            <View style={styles.chipsRow}>
              {PRESET_CTA_OPTIONS.map((opt) => {
                const isSelected = buttonText === opt;
                return (
                  <View
                    key={opt}
                    style={[
                      styles.ctaChipWrap,
                      isSelected
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
                        setButtonText(opt);
                      }}
                      android_ripple={{
                        color: isSelected
                          ? "rgba(255,255,255,0.25)"
                          : rippleColor,
                        borderless: false,
                        foreground: true,
                      }}
                      style={styles.ctaChipInner}
                    >
                      <Text
                        style={[
                          styles.ctaChipText,
                          isSelected
                            ? { color: "#ffffff", fontWeight: "700" }
                            : { color: isDark ? "#a1a1aa" : "#475569" },
                        ]}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <TextInput
              value={buttonText}
              onChangeText={setButtonText}
              onFocus={() => setFocusedField("buttonText")}
              onBlur={() => setFocusedField(null)}
              placeholder="Or enter custom button text..."
              placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
              style={[
                styles.input,
                {
                  marginTop: 10,
                  color: isDark ? "#ffffff" : "#0f172a",
                  borderColor:
                    focusedField === "buttonText"
                      ? PRIMARY
                      : isDark
                        ? "#27272a"
                        : "#cbd5e1",
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                },
              ]}
            />
          </View>

          {/* Registration Limit */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                { color: isDark ? "#e4e4e7" : "#0f172a" },
              ]}
            >
              Attendee Limit (Optional)
            </Text>
            <TextInput
              value={registrationLimit}
              onChangeText={setRegistrationLimit}
              onFocus={() => setFocusedField("registrationLimit")}
              onBlur={() => setFocusedField(null)}
              keyboardType="numeric"
              placeholder="Leave blank for unlimited attendees"
              placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
              style={[
                styles.input,
                {
                  color: isDark ? "#ffffff" : "#0f172a",
                  borderColor:
                    focusedField === "registrationLimit"
                      ? PRIMARY
                      : isDark
                        ? "#27272a"
                        : "#cbd5e1",
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                },
              ]}
            />
          </View>

          {/* Scheduled Posting with Expo UI Native Switch */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? "#e4e4e7" : "#0f172a", marginBottom: 2 },
                  ]}
                >
                  Schedule Announcement
                </Text>
                <Text
                  style={[
                    styles.switchDesc,
                    { color: isDark ? "#a1a1aa" : "#64748b" },
                  ]}
                >
                  Hide from members until a specific future date
                </Text>
              </View>

              <Host matchContents>
                <Switch
                  value={enableScheduling}
                  onValueChange={(val) => {
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Light,
                    ).catch(() => {});
                    setEnableScheduling(val);
                  }}
                />
              </Host>
            </View>

            {enableScheduling && (
              <View
                style={[
                  styles.scheduleChipWrap,
                  {
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
                    setActivePicker({ target: "schedule", mode: "date" });
                  }}
                  android_ripple={{
                    color: rippleColor,
                    borderless: false,
                    foreground: true,
                  }}
                  style={styles.dateChipInner}
                >
                  <Ionicons name="time-outline" size={18} color={PRIMARY} />
                  <Text
                    style={[
                      styles.dateChipText,
                      { color: isDark ? "#ffffff" : "#0f172a" },
                    ]}
                  >
                    Publish at: {formatDateTime(scheduledAt)}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={isDark ? "#71717a" : "#94a3b8"}
                  />
                </Pressable>
              </View>
            )}
          </View>

          {/* Submit Action - Fully rounded pill matching prime buttons */}
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
                      {isEditing ? "Save Changes" : "Publish Event"}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Delete Option (Editing Mode Only) - Fully rounded pill */}
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
                      <Text style={styles.deleteButtonText}>Delete Event</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Android Native Jetpack Compose Material 3 Date/Time Dialog */}
      {Platform.OS === "android" && activePicker && (
        <DateTimePicker
          value={
            activePicker.target === "start"
              ? startDate
              : activePicker.target === "end"
                ? endDate
                : scheduledAt
          }
          mode={activePicker.mode}
          presentation="dialog"
          accentColor={PRIMARY}
          minimumDate={activePicker.target === "end" ? startDate : undefined}
          onValueChange={(_, selectedDate) => {
            handleDateChange(selectedDate);
          }}
          onDismiss={() => setActivePicker(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        isDark={isDark}
        icon="trash-outline"
        iconColor="#ef4444"
        title="Delete Event"
        description="Are you sure you want to delete this event? It will be removed from member feeds immediately."
        buttons={[
          {
            label: "Delete",
            variant: "danger",
            onPress: handleDelete,
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />

      {/* Info / Error Modal */}


      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal({ ...infoModal, visible: false })}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
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
  aiButtonWrap: {
    borderRadius: 9999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  aiButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aiButtonText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "700",
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
  multilineShort: {
    height: 72,
    paddingTop: 12,
    textAlignVertical: "top",
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
  datePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateSubLabel: {
    width: 44,
    fontSize: 13,
    fontWeight: "600",
  },
  iosDatePickerWrap: {
    flex: 1,
    alignItems: "flex-start",
  },
  dateChipWrap: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  dateChipInner: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateChipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ctaChipWrap: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  ctaChipInner: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  ctaChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchDesc: {
    fontSize: 12,
    fontWeight: "500",
  },
  scheduleChipWrap: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
    marginTop: 10,
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
