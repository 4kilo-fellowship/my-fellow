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
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { AdminGuardFallback } from "@/components/Admin/AdminGuardFallback";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { InfoModal } from "@/components/Modals/InfoModal";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useDevotionsStore } from "@/stores/devotions.store";
import { Devotion, DevotionType } from "@/types/devotion.types";

const DEVOTION_TYPES: { type: DevotionType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: "text", label: "Text Article", icon: "document-text-outline" },
  { type: "voice", label: "Voice / Audio", icon: "mic-outline" },
  { type: "pdf", label: "PDF Document", icon: "reader-outline" },
  { type: "book", label: "Book / eBook", icon: "book-outline" },
];

export default function ManageDevotionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();

  const {
    devotionsList,
    createDevotion,
    updateDevotion,
    deleteDevotion,
    getCachedDevotion,
  } = useDevotionsStore();

  const [loadingInitial, setLoadingInitial] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Common Form states
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLocalImage, setIsLocalImage] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [type, setType] = useState<DevotionType>("text");
  const [tags, setTags] = useState<string>("Faith, Prayer, Daily Word");
  const [featured, setFeatured] = useState<boolean>(false);

  // Type specific fields
  const [content, setContent] = useState<string>("");
  const [duration, setDuration] = useState<string>("5 min read");
  const [caption, setCaption] = useState<string>("");
  const [pageCount, setPageCount] = useState<string>("");
  const [bookFormat, setBookFormat] = useState<string>("EPUB / PDF");

  // Media file (audio, pdf, or book)
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaName, setMediaName] = useState<string | null>(null);
  const [mediaMime, setMediaMime] = useState<string | null>(null);
  const [isLocalMedia, setIsLocalMedia] = useState<boolean>(false);

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

    const existing =
      devotionsList.find((d) => d._id === id) || getCachedDevotion(id);
    if (existing) {
      populateForm(existing);
      setLoadingInitial(false);
    } else {
      setLoadingInitial(false);
    }
  }, [id, isEditing, devotionsList]);

  const populateForm = (item: Devotion) => {
    setTitle(item.title || "");
    setAuthor(item.author || "");
    setDate(item.date || new Date().toISOString().split("T")[0]);
    setType(item.type || "text");
    setTags(Array.isArray(item.tags) ? item.tags.join(", ") : "");
    setFeatured(Boolean(item.featured));
    setContent(item.content || "");
    setDuration(item.duration || "");
    setCaption(item.caption || "");
    setPageCount(item.pageCount ? String(item.pageCount) : "");
    setBookFormat(item.bookFormat || "EPUB / PDF");

    if (item.image) {
      setImageUri(item.image);
      setIsLocalImage(false);
    }

    if (item.audioUrl) {
      setMediaUri(item.audioUrl);
      setMediaName("Existing Audio");
      setIsLocalMedia(false);
    } else if (item.pdfUrl) {
      setMediaUri(item.pdfUrl);
      setMediaName("Existing PDF Document");
      setIsLocalMedia(false);
    } else if (item.bookUrl) {
      setMediaUri(item.bookUrl);
      setMediaName("Existing eBook");
      setIsLocalMedia(false);
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
            "Please allow photo library access to upload a devotion cover.",
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

  const pickMediaDocument = async () => {
    try {
      let mimeTypes: string[] = ["*/*"];
      if (type === "voice") {
        mimeTypes = ["audio/*"];
      } else if (type === "pdf") {
        mimeTypes = ["application/pdf"];
      } else if (type === "book") {
        mimeTypes = ["application/pdf", "application/epub+zip"];
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: mimeTypes,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setMediaName(asset.name);
        setMediaMime(asset.mimeType || "application/octet-stream");
        setIsLocalMedia(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    } catch {
      setInfoModal({
        visible: true,
        title: "Document Error",
        message: "Failed to pick file. Please try again.",
        type: "error",
      });
    }
  };

  const validate = (): string | null => {
    if (!title.trim() || title.trim().length < 3) {
      return "Devotion title must be at least 3 characters.";
    }
    if (!author.trim() || author.trim().length < 2) {
      return "Author name is required.";
    }
    if (!imageUri) {
      return "Please select a cover image for the devotion.";
    }
    if (type === "text" && (!content.trim() || content.trim().length < 10)) {
      return "Devotion content must be at least 10 characters.";
    }
    if (type === "voice" && !mediaUri) {
      return "Please attach an audio recording for voice devotion.";
    }
    if (type === "pdf" && !mediaUri) {
      return "Please attach a PDF document.";
    }
    if (type === "book" && !mediaUri) {
      return "Please attach the book/eBook file.";
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
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const hasLocalFiles = isLocalImage || isLocalMedia;

      let payload: any;
      if (hasLocalFiles) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("author", author.trim());
        formData.append("date", date);
        formData.append("type", type);
        formData.append("tags", JSON.stringify(parsedTags));
        formData.append("featured", String(featured));

        if (type === "text") {
          formData.append("content", content.trim());
          if (duration.trim()) formData.append("duration", duration.trim());
        } else if (type === "voice") {
          if (caption.trim()) formData.append("caption", caption.trim());
          if (duration.trim()) formData.append("duration", duration.trim());
          if (!isLocalMedia && mediaUri) formData.append("audioUrl", mediaUri);
        } else if (type === "pdf") {
          if (pageCount) formData.append("pageCount", pageCount);
          if (!isLocalMedia && mediaUri) formData.append("pdfUrl", mediaUri);
        } else if (type === "book") {
          if (bookFormat) formData.append("bookFormat", bookFormat);
          if (!isLocalMedia && mediaUri) formData.append("bookUrl", mediaUri);
        }

        if (isLocalImage && imageUri) {
          const filename = imageUri.split("/").pop() || "devotion_cover.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? `image/${match[1]}` : "image/jpeg";
          formData.append("image", {
            uri: imageUri,
            name: filename,
            type: fileType,
          } as any);
        } else if (imageUri) {
          formData.append("image", imageUri);
        }

        if (isLocalMedia && mediaUri) {
          const filename =
            mediaName ||
            mediaUri.split("/").pop() ||
            (type === "voice" ? "audio.mp3" : "document.pdf");
          formData.append("media", {
            uri: mediaUri,
            name: filename,
            type: mediaMime || "application/octet-stream",
          } as any);
        }

        payload = formData;
      } else {
        payload = {
          title: title.trim(),
          author: author.trim(),
          date,
          type,
          tags: parsedTags,
          featured,
          image: imageUri || "",
          content: type === "text" ? content.trim() : undefined,
          duration: duration.trim() || undefined,
          caption: type === "voice" ? caption.trim() : undefined,
          audioUrl: type === "voice" ? mediaUri || undefined : undefined,
          pdfUrl: type === "pdf" ? mediaUri || undefined : undefined,
          pageCount: type === "pdf" && pageCount ? parseInt(pageCount) : undefined,
          bookUrl: type === "book" ? mediaUri || undefined : undefined,
          bookFormat: type === "book" ? bookFormat : undefined,
        };
      }

      if (isEditing && id) {
        await updateDevotion(id, payload);
      } else {
        await createDevotion(payload);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Devotion Saved",
        message: `Devotion has been successfully ${isEditing ? "updated" : "published to the fellowship"}.`,
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
            "Could not save devotion.",
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
      await deleteDevotion(id);
      setDeleteModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      setInfoModal({
        visible: true,
        title: "Devotion Deleted",
        message: "The devotion has been removed.",
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
            "Could not delete devotion.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return <AdminGuardFallback title="Manage Devotion" />;
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
      <ScreenHeader title={isEditing ? "Edit Devotion" : "New Devotion"} />

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
              Cover Banner Image <Text style={styles.required}>*</Text>
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
                    Tap to select 16:9 cover
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Devotion Type Selector */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Devotion Format <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.typeGrid}>
              {DEVOTION_TYPES.map((t) => {
                const selected = type === t.type;
                return (
                  <TouchableOpacity
                    key={t.type}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setType(t.type);
                    }}
                    style={[
                      styles.typeCard,
                      selected
                        ? styles.typeCardSelected
                        : isDark
                          ? styles.cardBoxDark
                          : styles.cardBoxLight,
                    ]}
                  >
                    <Ionicons
                      name={t.icon}
                      size={20}
                      color={selected ? "#fff" : PRIMARY}
                    />
                    <Text
                      style={[
                        styles.typeCardLabel,
                        selected
                          ? styles.typeCardLabelSelected
                          : isDark
                            ? styles.textLight
                            : styles.textDark,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
              placeholder="e.g., Walking in Grace Every Morning"
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

          {/* Author */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Author / Preacher <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={author}
              onChangeText={setAuthor}
              placeholder="e.g., Pastor Daniel / 4 Kilo Devotion Team"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              onFocus={() => setFocusedField("author")}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                focusedField === "author" && styles.inputFocused,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Date & Duration */}
          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              >
                Date (YYYY-MM-DD)
              </Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="2026-11-03"
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
                Duration / Read Time
              </Text>
              <TextInput
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g., 5 min read"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                style={[
                  styles.input,
                  isDark ? styles.inputDark : styles.inputLight,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              />
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text
              style={[
                styles.label,
                isDark ? styles.textLight : styles.textDark,
              ]}
            >
              Tags (Comma separated)
            </Text>
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="Faith, Hope, Daily, Fasting"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              style={[
                styles.input,
                isDark ? styles.inputDark : styles.inputLight,
                isDark ? styles.textLight : styles.textDark,
              ]}
            />
          </View>

          {/* Featured Switch */}
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
                <Ionicons name="star" size={18} color={PRIMARY} />
                <Text
                  style={[
                    styles.cardBoxTitle,
                    isDark ? styles.textLight : styles.textDark,
                  ]}
                >
                  Featured Devotion
                </Text>
              </View>
              <Text
                style={[
                  styles.cardBoxDesc,
                  isDark ? styles.descDark : styles.descLight,
                ]}
              >
                Showcases this devotion banner in the top hero spotlight carousel.
              </Text>
            </View>
            <Switch
              value={featured}
              onValueChange={setFeatured}
              trackColor={{ false: "#64748b", true: PRIMARY }}
              thumbColor={Platform.OS === "android" ? "#ffffff" : undefined}
            />
          </View>

          {/* ── Type Specific Fields ── */}
          {type === "text" && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.label,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              >
                Devotion Content (Markdown supported) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Scripture passage, meditation thoughts, and prayer points..."
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                multiline
                numberOfLines={8}
                onFocus={() => setFocusedField("content")}
                onBlur={() => setFocusedField(null)}
                style={[
                  styles.input,
                  styles.textAreaContent,
                  isDark ? styles.inputDark : styles.inputLight,
                  focusedField === "content" && styles.inputFocused,
                  isDark ? styles.textLight : styles.textDark,
                ]}
              />
            </View>
          )}

          {type !== "text" && (
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
                {type === "voice"
                  ? "Audio Recording File"
                  : type === "pdf"
                    ? "PDF Document Attachment"
                    : "eBook File Attachment"}
              </Text>

              <TouchableOpacity
                onPress={pickMediaDocument}
                style={[
                  styles.mediaPickerBtn,
                  isDark ? styles.inputDark : styles.inputLight,
                ]}
              >
                <Ionicons
                  name={
                    type === "voice"
                      ? "mic"
                      : type === "pdf"
                        ? "document-attach"
                        : "book"
                  }
                  size={24}
                  color={PRIMARY}
                />
                <Text
                  style={[
                    styles.mediaPickerText,
                    isDark ? styles.textLight : styles.textDark,
                  ]}
                  numberOfLines={1}
                >
                  {mediaName ||
                    `Tap to attach ${type === "voice" ? "audio (.mp3, .m4a)" : type === "pdf" ? "PDF (.pdf)" : "eBook (.epub, .pdf)"}`}
                </Text>
              </TouchableOpacity>

              {type === "voice" && (
                <View style={{ marginTop: 12 }}>
                  <Text
                    style={[
                      styles.label,
                      isDark ? styles.textLight : styles.textDark,
                    ]}
                  >
                    Audio Caption / Voice Description
                  </Text>
                  <TextInput
                    value={caption}
                    onChangeText={setCaption}
                    placeholder="Short sermon overview or prayer note..."
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    style={[
                      styles.input,
                      isDark ? styles.inputDark : styles.inputLight,
                      isDark ? styles.textLight : styles.textDark,
                    ]}
                  />
                </View>
              )}

              {type === "pdf" && (
                <View style={{ marginTop: 12 }}>
                  <Text
                    style={[
                      styles.label,
                      isDark ? styles.textLight : styles.textDark,
                    ]}
                  >
                    Page Count
                  </Text>
                  <TextInput
                    value={pageCount}
                    onChangeText={setPageCount}
                    keyboardType="numeric"
                    placeholder="e.g., 14"
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    style={[
                      styles.input,
                      isDark ? styles.inputDark : styles.inputLight,
                      isDark ? styles.textLight : styles.textDark,
                    ]}
                  />
                </View>
              )}

              {type === "book" && (
                <View style={{ marginTop: 12 }}>
                  <Text
                    style={[
                      styles.label,
                      isDark ? styles.textLight : styles.textDark,
                    ]}
                  >
                    Book Format
                  </Text>
                  <TextInput
                    value={bookFormat}
                    onChangeText={setBookFormat}
                    placeholder="e.g., EPUB, PDF"
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    style={[
                      styles.input,
                      isDark ? styles.inputDark : styles.inputLight,
                      isDark ? styles.textLight : styles.textDark,
                    ]}
                  />
                </View>
              )}
            </View>
          )}

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
                    {isEditing ? "Update Devotion" : "Publish Devotion"}
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
                <Text style={styles.deleteBtnText}>Delete Devotion</Text>
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
        title="Delete Devotion"
        description="Are you sure you want to permanently delete this devotion? All comments and bookmarks will also be deleted."
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
  subSectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  textAreaContent: {
    height: 160,
    paddingTop: 14,
    textAlignVertical: "top",
    lineHeight: 22,
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
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeCard: {
    width: "48%",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  typeCardSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  typeCardLabel: { fontSize: 13, fontWeight: "600" },
  typeCardLabelSelected: { color: "#ffffff" },
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
  cardBoxTitle: { fontSize: 14, fontWeight: "600" },
  cardBoxDesc: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  mediaPickerBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  mediaPickerText: { flex: 1, fontSize: 13, fontWeight: "500" },
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
