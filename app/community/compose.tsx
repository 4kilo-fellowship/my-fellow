import { PRIMARY } from "@/constants";
import { useConfirmUnsavedChanges } from "@/hooks/useConfirmUnsavedChanges";
import { useTheme } from "@/context/ThemeContext";
import { useCommunityStore } from "@/stores/community.store";
import { useUserStore } from "@/stores/user.store";
import { getPrefilledAvatar } from "@/utils/avatar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image as ExpoImage } from "expo-image";
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
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AUDIENCES = [
  { id: "everyone", label: "Everyone", description: "Anyone on 4 Kilo Fellowship" },
  { id: "fellowship", label: "Fellowship Members", description: "Verified fellowship students" },
  { id: "team", label: "My Ministry Team", description: "Members in your assigned ministry" },
] as const;

export default function ComposePostScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useUserStore();
  const createPost = useCommunityStore((s) => s.createPost);

  const [content, setContent] = useState("");
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [selectedAudience] = useState<string>("everyone");
  const [hasLocation, setHasLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const textColor = isDark ? "#ffffff" : "#0f172a";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#27272a" : "#f1f5f9";
  const bg = isDark ? "#09090b" : "#ffffff";

  const userAvatar =
    user?.profileImage ||
    getPrefilledAvatar(user?.phoneNumber || user?.id);

  const handlePickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPickedImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Permission Required", "Please allow photo library access.");
    }
  };

  const handleCameraCapture = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Camera Access", "Please grant camera permission to snap a fellowship photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPickedImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Could not open camera.");
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !pickedImageUri) return;

    try {
      setSubmitting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      const finalContent = hasLocation && !content.includes("📍")
        ? `${content.trim()}\n\n📍 4 Kilo Campus, AAU`
        : content.trim();

      await createPost({
        body: finalContent,
        kind: "post",
        image: pickedImageUri ? { uri: pickedImageUri } : null,
        author: user,
      });

      router.back();
    } catch {
      Alert.alert("Error", "Could not publish post. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const showComingSoonToast = () => {
    Haptics.selectionAsync().catch(() => {});
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravity(
        "Coming soon",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else {
      Alert.alert("Coming soon");
    }
  };

  const currentAudienceObj =
    AUDIENCES.find((a) => a.id === selectedAudience) || AUDIENCES[0];

  const charLimit = 500;
  const charsLeft = charLimit - content.length;
  const isOverLimit = charsLeft < 0;
  const hasContent = (!!content.trim() || !!pickedImageUri) && !isOverLimit;
  const hasUnsavedChanges = content.trim().length > 0 || !!pickedImageUri;

  useConfirmUnsavedChanges(hasUnsavedChanges, {
    title: "Discard draft?",
    message: "You have an unsaved fellowship post that will be lost.",
    discardLabel: "Discard",
    continueLabel: "Keep Editing",
  });

  const handleDismiss = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Bar matching reference */}
      <View style={[styles.topBar, { borderBottomColor: borderColor }]}>
        <Pressable
          onPress={handleDismiss}
          hitSlop={10}
          android_ripple={{
            color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
            borderless: true,
            radius: 20,
          }}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={24} color={textColor} />
        </Pressable>

        <Pressable
          onPress={handlePost}
          disabled={!hasContent || submitting}
          accessibilityRole="button"
          accessibilityLabel="Publish post"
          android_ripple={{
            color: "rgba(255, 255, 255, 0.3)",
            borderless: false,
          }}
          style={[
            styles.postBtn,
            {
              backgroundColor: hasContent
                ? PRIMARY
                : isDark
                  ? "rgba(255, 103, 25, 0.35)"
                  : "rgba(255, 103, 25, 0.45)",
            },
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.contentWrap}
      >
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User Row + Audience Picker */}
          <View style={styles.userRow}>
            <ExpoImage
              source={{ uri: userAvatar }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />

            <View style={styles.audienceCol}>
              <Pressable
                onPress={showComingSoonToast}
                accessibilityRole="button"
                accessibilityLabel="Audience selector, coming soon"
                android_ripple={{
                  color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                  borderless: false,
                  radius: 14,
                }}
                style={[
                  styles.audiencePill,
                  {
                    borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#cbd5e1",
                    backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
                  },
                ]}
              >
                <Text style={[styles.audienceText, { color: mutedColor }]}>
                  {currentAudienceObj.label}
                </Text>
                <Ionicons name="chevron-down" size={14} color={mutedColor} />
              </Pressable>
            </View>
          </View>

          {/* Text Input */}
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="What's happening in fellowship?"
            placeholderTextColor={isDark ? "#71717a" : "#94a3b8"}
            multiline
            autoFocus
            style={[styles.textInput, { color: textColor }]}
          />

          {/* Attached Location Tag */}
          {hasLocation && (
            <View
              style={[
                styles.locationBadge,
                {
                  borderColor: isDark ? "#27272a" : "#fed7aa",
                  backgroundColor: isDark ? "#1c1917" : "#fff7ed",
                },
              ]}
            >
              <Ionicons name="location" size={14} color={PRIMARY} />
              <Text style={[styles.locationText, { color: PRIMARY }]}>
                4 Kilo Campus, AAU
              </Text>
              <Pressable onPress={() => setHasLocation(false)} hitSlop={6}>
                <Ionicons name="close-circle" size={16} color={PRIMARY} />
              </Pressable>
            </View>
          )}

          {/* Attached Image Preview */}
          {pickedImageUri && (
            <View style={styles.imagePreviewWrapper}>
              <ExpoImage
                source={{ uri: pickedImageUri }}
                style={styles.imagePreview}
                contentFit="cover"
              />
              <Pressable
                onPress={() => setPickedImageUri(null)}
                style={styles.removeImageBtn}
                hitSlop={6}
              >
                <Ionicons name="close" size={18} color="#ffffff" />
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Reply Permission Hint Row matching screenshot */}
        <Pressable
          onPress={showComingSoonToast}
          accessibilityRole="button"
          accessibilityLabel="Reply permissions, coming soon"
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
            borderless: false,
          }}
          style={styles.replyHintRow}
        >
          <Ionicons name="globe-outline" size={15} color={mutedColor} />
          <Text style={[styles.replyHintText, { color: mutedColor }]}>
            Everyone can reply
          </Text>
        </Pressable>

        {/* Bottom Toolbar matching screenshot */}
        <View style={[styles.bottomToolbar, { borderTopColor: borderColor }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarIconsRow}
          >
            {/* 1. Gallery (Active) */}
            <Pressable
              onPress={handlePickImage}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Attach photo from gallery"
              android_ripple={{
                color: isDark ? "rgba(255, 103, 25, 0.25)" : "rgba(255, 102, 25, 0.15)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="image-outline" size={22} color={PRIMARY} />
            </Pressable>

            {/* 2. Camera (Active) */}
            <Pressable
              onPress={handleCameraCapture}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Take photo with camera"
              android_ripple={{
                color: isDark ? "rgba(255, 103, 25, 0.25)" : "rgba(255, 102, 25, 0.15)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="camera-outline" size={22} color={PRIMARY} />
            </Pressable>

            {/* 3. Audio / Devotion Scripture (Muted / Coming soon) */}
            <Pressable
              onPress={showComingSoonToast}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Audio notes, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="stats-chart-outline" size={21} color={mutedColor} />
            </Pressable>

            {/* 4. GIF badge (Muted / Coming soon) */}
            <Pressable
              onPress={showComingSoonToast}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Attach GIF, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: false,
                radius: 12,
              }}
              style={[
                styles.gifBadgeBtn,
                {
                  borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#cbd5e1",
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
                },
              ]}
            >
              <Text style={[styles.gifBadgeText, { color: mutedColor }]}>GIF</Text>
            </Pressable>

            {/* 5. Poll / Questionnaire (Muted / Coming soon) */}
            <Pressable
              onPress={showComingSoonToast}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Create poll, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="list-outline" size={22} color={mutedColor} />
            </Pressable>

            {/* 6. Location Pin (Muted / Coming soon) */}
            <Pressable
              onPress={showComingSoonToast}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Tag location, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons
                name="location-outline"
                size={22}
                color={mutedColor}
              />
            </Pressable>

            {/* 7. Bookmark / Tag (Muted / Coming soon) */}
            <Pressable
              onPress={showComingSoonToast}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Add bookmark tag, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="bookmark-outline" size={21} color={mutedColor} />
            </Pressable>

            {/* 8. Plus Chip button (Muted / Coming soon) */}
            <Pressable
              onPress={showComingSoonToast}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="More attachments, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="add-circle-outline" size={22} color={mutedColor} />
            </Pressable>
          </ScrollView>

          {/* 9. Circular Character Counter */}
          <Pressable
            onPress={showComingSoonToast}
            hitSlop={6}
            style={styles.charCounterWrap}
          >
            <Text
              style={[
                styles.charCounter,
                {
                  color:
                    charsLeft < 0
                      ? "#ef4444"
                      : charsLeft < 20
                        ? "#f59e0b"
                        : mutedColor,
                },
              ]}
            >
              {charsLeft}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    padding: 6,
  },
  postBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  contentWrap: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e2e8f0",
  },
  audienceCol: {
    marginLeft: 12,
  },
  audiencePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  audienceText: {
    fontSize: 13,
    fontWeight: "700",
  },
  textInput: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 180,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  imagePreviewWrapper: {
    position: "relative",
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    height: 200,
    width: "100%",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  replyHintRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
  replyHintText: {
    fontSize: 13,
    fontWeight: "600",
  },
  bottomToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbarIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toolIconBtn: {
    padding: 6,
  },
  gifBadgeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gifBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  charCounterWrap: {
    paddingHorizontal: 8,
  },
  charCounter: {
    fontSize: 13,
    fontWeight: "600",
  },
});
