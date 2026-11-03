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
import { useTeamsStore } from "@/stores/teams.store";
import { Team } from "@/types";

const COLOR_PRESETS = [
  "#ff6719",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#06b6d4",
  "#64748b",
];

const ICON_PRESETS: (keyof typeof Ionicons.glyphMap)[] = [
  "musical-notes",
  "heart",
  "book",
  "people",
  "mic",
  "videocam",
  "camera",
  "chatbubbles",
  "globe",
  "school",
  "flame",
  "shield",
];

const CATEGORY_PRESETS = [
  "Ministry",
  "Worship",
  "Media & Tech",
  "Discipleship",
  "Evangelism & Outreach",
  "Prayer & Intercession",
  "Fellowship Care",
];

export default function ManageTeamScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();

  const { teams, createTeam, updateTeam, deleteTeam } = useTeamsStore();

  const [loadingInitial, setLoadingInitial] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [category, setCategory] = useState<string>("Ministry");
  const [color, setColor] = useState<string>("#ff6719");
  const [icon, setIcon] = useState<string>("people");
  const [meetingDay, setMeetingDay] = useState<string>("Saturday");
  const [time, setTime] = useState<string>("3:00 PM - 5:00 PM");
  const [location, setLocation] = useState<string>("4 Kilo Campus");
  const [latitude, setLatitude] = useState<string>("9.0358");
  const [longitude, setLongitude] = useState<string>("38.7619");

  // Banner image
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLocalImage, setIsLocalImage] = useState<boolean>(false);

  // Leader sub-form
  const [leaderName, setLeaderName] = useState<string>("");
  const [leaderRole, setLeaderRole] = useState<string>("Team Leader");
  const [leaderPhone, setLeaderPhone] = useState<string>("");
  const [leaderTelegram, setLeaderTelegram] = useState<string>("");
  const [leaderImageUri, setLeaderImageUri] = useState<string | null>(null);
  const [isLocalLeaderImage, setIsLocalLeaderImage] = useState<boolean>(false);

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

    const existing = teams.find(
      (t) => t.id === id || (t as any)._id === id,
    );
    if (existing) {
      populateForm(existing);
      setLoadingInitial(false);
    } else {
      setLoadingInitial(false);
    }
  }, [id, isEditing, teams]);

  const populateForm = (item: Team) => {
    setName(item.name || "");
    setDescription(item.description || "");
    setAbout(item.about || "");
    setCategory(item.category || "Ministry");
    setColor(item.color || "#ff6719");
    setIcon(item.icon || "people");
    setMeetingDay(item.meetingDay || "Saturday");
    setTime(item.time || "");
    setLocation(item.location || "");
    if (item.coordinates) {
      setLatitude(item.coordinates.lat?.toString() || "9.0358");
      setLongitude(item.coordinates.lng?.toString() || "38.7619");
    }
    if (item.imageUrl) {
      setImageUri(item.imageUrl);
      setIsLocalImage(false);
    }
    if (item.leader) {
      setLeaderName(item.leader.name || "");
      setLeaderRole(item.leader.role || "Team Leader");
      setLeaderPhone(item.leader.phone || "");
      setLeaderTelegram(item.leader.telegram || "");
      if (item.leader.imageUrl) {
        setLeaderImageUri(item.leader.imageUrl);
        setIsLocalLeaderImage(false);
      }
    }
  };

  const pickImage = async (type: "banner" | "leader") => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setInfoModal({
          visible: true,
          title: "Permission Required",
          message: "Please allow photo library access to upload photos.",
          type: "info",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "banner" ? [16, 9] : [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (type === "banner") {
          setImageUri(result.assets[0].uri);
          setIsLocalImage(true);
        } else {
          setLeaderImageUri(result.assets[0].uri);
          setIsLocalLeaderImage(true);
        }
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
    if (!name.trim() || name.trim().length < 3) {
      return "Team name must be at least 3 characters.";
    }
    if (!description.trim() || description.trim().length < 10) {
      return "Short description must be at least 10 characters.";
    }
    if (!about.trim() || about.trim().length < 10) {
      return "Detailed About text is required.";
    }
    if (!meetingDay.trim()) {
      return "Meeting day is required.";
    }
    if (!time.trim()) {
      return "Meeting time is required.";
    }
    if (!location.trim()) {
      return "Meeting place/location is required.";
    }
    if (!leaderName.trim()) {
      return "Leader name is required.";
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
      const tg = leaderTelegram.trim().startsWith("@")
        ? leaderTelegram.trim()
        : leaderTelegram.trim()
          ? `@${leaderTelegram.trim()}`
          : "";

      const leaderData = {
        name: leaderName.trim(),
        role: leaderRole.trim() || "Team Leader",
        phone: leaderPhone.trim(),
        telegram: tg,
        imageUrl: leaderImageUri || "",
      };

      const hasLocalImages = isLocalImage || isLocalLeaderImage;

      let payload: any;
      if (hasLocalImages) {
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("description", description.trim());
        formData.append("about", about.trim());
        formData.append("category", category);
        formData.append("color", color);
        formData.append("icon", icon);
        formData.append("meetingDay", meetingDay.trim());
        formData.append("time", time.trim());
        formData.append("location", location.trim());
        formData.append(
          "coordinates",
          JSON.stringify({ lat: parsedLat, lng: parsedLng }),
        );
        formData.append("leader", JSON.stringify(leaderData));

        if (isLocalImage && imageUri) {
          const filename = imageUri.split("/").pop() || "team_banner.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? `image/${match[1]}` : "image/jpeg";
          formData.append("image", {
            uri: imageUri,
            name: filename,
            type: fileType,
          } as any);
        } else if (imageUri) {
          formData.append("imageUrl", imageUri);
        }

        if (isLocalLeaderImage && leaderImageUri) {
          const filename =
            leaderImageUri.split("/").pop() || "leader_image.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? `image/${match[1]}` : "image/jpeg";
          formData.append("leaderImage", {
            uri: leaderImageUri,
            name: filename,
            type: fileType,
          } as any);
        }

        payload = formData;
      } else {
        payload = {
          name: name.trim(),
          description: description.trim(),
          about: about.trim(),
          category,
          color,
          icon,
          meetingDay: meetingDay.trim(),
          time: time.trim(),
          location: location.trim(),
          coordinates: { lat: parsedLat, lng: parsedLng },
          imageUrl: imageUri || "",
          leader: leaderData,
        };
      }

      if (isEditing && id) {
        await updateTeam(id, payload);
      } else {
        await createTeam(payload);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Team Saved",
        message: `Fellowship team has been successfully ${isEditing ? "updated" : "created"}.`,
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
            "Could not save team.",
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
      await deleteTeam(id);
      setDeleteModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Team Deleted",
        message: "The team has been removed from fellowship ministries.",
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
            "Could not delete team.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return <AdminGuardFallback title="Manage Ministry Team" />;
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
      <ScreenHeader title={isEditing ? "Edit Team" : "Add Team"} />

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
          {/* Team Banner Picker */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Team Banner Cover
            </Text>
            <Pressable
              onPress={() => pickImage("banner")}
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
                  <Ionicons name="people-outline" size={40} color="#94a3b8" />
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

          {/* Name */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Team Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Worship & Praise Ministry"
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
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
                      selected
                        ? styles.chipSelected
                        : isDark
                          ? styles.chipDark
                          : styles.chipLight,
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
            </ScrollView>
          </View>

          {/* Color & Icon Row */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Accent Color
            </Text>
            <View style={styles.colorRow}>
              {COLOR_PRESETS.map((c) => {
                const selected = color === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setColor(c);
                    }}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: c },
                      selected && styles.colorCircleSelected,
                    ]}
                  >
                    {selected && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Icon Selector */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Icon
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {ICON_PRESETS.map((ic) => {
                const selected = icon === ic;
                return (
                  <TouchableOpacity
                    key={ic}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setIcon(ic);
                    }}
                    style={[
                      styles.iconCircle,
                      selected
                        ? { backgroundColor: color, borderColor: color }
                        : isDark
                          ? styles.chipDark
                          : styles.chipLight,
                    ]}
                  >
                    <Ionicons
                      name={ic}
                      size={20}
                      color={
                        selected ? "#fff" : isDark ? "#94a3b8" : "#64748b"
                      }
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Meeting Details */}
          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              >
                Meeting Day <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={meetingDay}
                onChangeText={setMeetingDay}
                placeholder="e.g., Saturday"
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
                Meeting Time <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="e.g., 3:00 PM"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              />
            </View>
          </View>

          {/* Meeting Location */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Meeting Place <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Room 204, Student Center"
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

          {/* Short Description */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Short Summary <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Brief summary of the ministry team mission..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              multiline
              numberOfLines={2}
              onFocus={() => setFocusedField("description")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                { height: 68, paddingTop: 10, textAlignVertical: "top" },
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "description" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Detailed About */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Detailed About & Expectations <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={about}
              onChangeText={setAbout}
              placeholder="Full details, spiritual goals, requirements for joining..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              multiline
              numberOfLines={4}
              onFocus={() => setFocusedField("about")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                styles.textArea,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "about" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Team Leader Sub-Section */}
          <View
            style={[
              styles.section,
              styles.cardBox,
              isDark ? styles.cardBoxDark : styles.cardBoxLight,
            ]}
          >
            <Text
              style={[
                styles.subSectionTitle,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Team Leader Information
            </Text>

            {/* Leader Image */}
            <View style={{ alignItems: "center", marginVertical: 12 }}>
              <Pressable
                onPress={() => pickImage("leader")}
                style={[
                  styles.avatarPicker,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
              >
                {leaderImageUri ? (
                  <View style={styles.avatarWrapper}>
                    <ExpoImage
                      source={{ uri: leaderImageUri }}
                      style={styles.avatarImage}
                      contentFit="cover"
                    />
                    <View style={styles.avatarBadge}>
                      <Ionicons name="camera" size={14} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.avatarEmpty}>
                    <Ionicons name="person-outline" size={32} color="#94a3b8" />
                    <Text
                      style={[
                        styles.avatarHint,
                        isDark ? styles.descDark : styles.descLight,
                      ]}
                    >
                      Leader Photo
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              >
                Leader Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={leaderName}
                onChangeText={setLeaderName}
                placeholder="e.g., Caleb Tesfaye"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              >
                Leader Role
              </Text>
              <TextInput
                value={leaderRole}
                onChangeText={setLeaderRole}
                placeholder="e.g., Team Leader"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text
                  style={[
                    styles.label,
                    isDark ? styles.textLight : styles.textDark,
                  ]}
                >
                  Phone
                </Text>
                <TextInput
                  value={leaderPhone}
                  onChangeText={setLeaderPhone}
                  placeholder="+251 9..."
                  keyboardType="phone-pad"
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  style={[
                    styles.input,
                    isDark ? styles.inputDark : styles.inputLight,
                    isDark ? styles.textLight : styles.textDark,
                  ]}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text
                  style={[
                    styles.label,
                    isDark ? styles.textLight : styles.textDark,
                  ]}
                >
                  Telegram
                </Text>
                <TextInput
                  value={leaderTelegram}
                  onChangeText={setLeaderTelegram}
                  placeholder="@handle"
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  style={[
                    styles.input,
                    isDark ? styles.inputDark : styles.inputLight,
                    isDark ? styles.textLight : styles.textDark,
                  ]}
                />
              </View>
            </View>
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
                    {isEditing ? "Update Team" : "Create Team"}
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
                <Text style={styles.deleteBtnText}>Delete Team</Text>
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
        title="Delete Team"
        description="Are you sure you want to delete this ministry team? All associated schedule details will be removed."
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
  subSectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
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
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPicker: {
    width: 88,
    height: 88,
    borderRadius: 44,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmpty: { alignItems: "center", justifyContent: "center" },
  avatarHint: { fontSize: 10, fontWeight: "600", marginTop: 4 },
  cardBox: {
    padding: 16,
    borderRadius: 18,
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
