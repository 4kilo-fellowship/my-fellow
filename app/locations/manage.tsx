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
import { useLocationsStore } from "@/stores/locations.store";

export default function ManageLocationScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();

  const { locations, createLocation, updateLocation, deleteLocation } =
    useLocationsStore();

  const [loadingInitial, setLoadingInitial] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form states
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLocalImage, setIsLocalImage] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("9.0358");
  const [longitude, setLongitude] = useState<string>("38.7619");
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>("");
  const [serviceTimes, setServiceTimes] = useState<string[]>([
    "Sunday 10:00 AM",
    "Friday 6:00 PM",
  ]);
  const [newServiceTime, setNewServiceTime] = useState<string>("");

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

    const existing = locations.find(
      (l) => l.id === id || l._id === id,
    );
    if (existing) {
      populateForm(existing);
      setLoadingInitial(false);
    } else {
      setLoadingInitial(false);
    }
  }, [id, isEditing, locations]);

  const populateForm = (item: any) => {
    setName(item.name || "");
    setAddress(item.address || "");
    setGoogleMapsUrl(item.googleMapsUrl || "");
    if (item.coordinates) {
      setLatitude(
        item.coordinates.latitude?.toString() ||
          item.coordinates.lat?.toString() ||
          "9.0358",
      );
      setLongitude(
        item.coordinates.longitude?.toString() ||
          item.coordinates.lng?.toString() ||
          "38.7619",
      );
    }
    if (Array.isArray(item.serviceTimes)) {
      setServiceTimes(item.serviceTimes);
    }
    if (item.image) {
      const src =
        typeof item.image === "string"
          ? item.image
          : item.image?.uri || "";
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
            "Please allow photo library access to upload a location cover photo.",
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

  const addServiceTime = () => {
    if (!newServiceTime.trim()) return;
    setServiceTimes([...serviceTimes, newServiceTime.trim()]);
    setNewServiceTime("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const removeServiceTime = (index: number) => {
    setServiceTimes(serviceTimes.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const validate = (): string | null => {
    if (!name.trim() || name.trim().length < 2) {
      return "Location name must be at least 2 characters.";
    }
    if (!address.trim() || address.trim().length < 2) {
      return "Address is required.";
    }
    if (!imageUri) {
      return "Please select a photo for the location.";
    }
    if (serviceTimes.length === 0) {
      return "Please add at least one service time (e.g. Sunday 10:00 AM).";
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
      const mapsUrl =
        googleMapsUrl.trim() ||
        `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`;

      let payload: any;
      if (isLocalImage && imageUri) {
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("address", address.trim());
        formData.append("googleMapsUrl", mapsUrl);
        formData.append(
          "coordinates",
          JSON.stringify({ latitude: parsedLat, longitude: parsedLng }),
        );
        formData.append("serviceTimes", JSON.stringify(serviceTimes));

        const filename = imageUri.split("/").pop() || "location_image.jpg";
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
          name: name.trim(),
          address: address.trim(),
          googleMapsUrl: mapsUrl,
          coordinates: { latitude: parsedLat, longitude: parsedLng },
          serviceTimes,
          image: imageUri || "",
        };
      }

      if (isEditing && id) {
        await updateLocation(id, payload);
      } else {
        await createLocation(payload);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Location Saved",
        message: `Location has been successfully ${isEditing ? "updated" : "created"}.`,
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
          "Could not save location.",
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
      await deleteLocation(id);
      setDeleteModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Location Deleted",
        message: "The location has been removed.",
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
          "Could not delete location.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return <AdminGuardFallback title="Manage Location" />;
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
      <ScreenHeader title={isEditing ? "Edit Location" : "Add Location"} />

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
          {/* Photo Picker */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Location Photo <Text style={styles.required}>*</Text>
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
                  <Ionicons name="location-outline" size={40} color="#94a3b8" />
                  <Text
                    style={[
                      styles.emptyImageText,
                      isDark ? styles.descDark : styles.descLight,
                    ]}
                  >
                    Tap to select photo
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
              Location Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., 4 Kilo Fellowship Main Hall"
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

          {/* Address */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g., King George VI St, Addis Ababa"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("address")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "address" && styles.inputFocused,
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

          {/* Google Maps URL */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Google Maps URL
            </Text>
            <TextInput
              value={googleMapsUrl}
              onChangeText={setGoogleMapsUrl}
              placeholder="https://maps.app.goo.gl/..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("googleMapsUrl")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "googleMapsUrl" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Service Times */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Service Times <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.serviceTimesList}>
              {serviceTimes.map((time, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.serviceTimeTag,
                    isDark ? styles.chipDark : styles.chipLight,
                  ]}
                >
                  <Text
                    style={[
                      styles.serviceTimeText,
                      isDark ? styles.textLight : styles.textDark,
                    ]}
                  >
                    {time}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeServiceTime(idx)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={[styles.row, { marginTop: 8 }]}>
              <TextInput
                value={newServiceTime}
                onChangeText={setNewServiceTime}
                placeholder="e.g., Saturday 4:00 PM"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                style={[
                  styles.input,
                  { flex: 1, marginRight: 10 },
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              />
              <TouchableOpacity
                onPress={addServiceTime}
                style={styles.addTagBtn}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
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
                    {isEditing ? "Update Location" : "Create Location"}
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
                <Text style={styles.deleteBtnText}>Delete Location</Text>
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
        title="Delete Location"
        description="Are you sure you want to delete this location? It will no longer be visible on the fellowship map."
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
  chipDark: {
    backgroundColor: "#111827",
    borderColor: "#1f2937",
  },
  chipLight: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  serviceTimesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  serviceTimeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  serviceTimeText: { fontSize: 13, fontWeight: "500" },
  addTagBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
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
