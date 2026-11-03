import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useCanPublishVideos } from "@/hooks/useCanPublishVideos";
import { socialApi } from "@/services/socialApi";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ManageVideoScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const canPublish = useCanPublishVideos();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [thumbnail, setThumbnail] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [saving, setSaving] = useState(false);

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission required", "Allow photo library access to choose a video.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 600,
      quality: 1,
    });
    if (!result.canceled) setVideo(result.assets[0]);
  };

  const pickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled) setThumbnail(result.assets[0]);
  };

  const publish = async () => {
    if (!title.trim() || !video) {
      Alert.alert("Missing details", "Add a title and choose a video before publishing.");
      return;
    }
    setSaving(true);
    try {
      await socialApi.createContentVideo({
        title: title.trim(),
        description: description.trim(),
        video: {
          uri: video.uri,
          name: video.fileName || `fellowship-video-${Date.now()}.mp4`,
          type: video.mimeType || "video/mp4",
        },
        thumbnail: thumbnail
          ? {
              uri: thumbnail.uri,
              name: thumbnail.fileName || `video-thumbnail-${Date.now()}.jpg`,
              type: thumbnail.mimeType || "image/jpeg",
            }
          : undefined,
      });
      Alert.alert("Video published", "Your video is now available in Latest Videos.", [
        { text: "Done", onPress: () => router.replace("/videos") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Could not publish video",
        error?.response?.data?.message || "Please check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!canPublish) {
    return (
      <View className={`flex-1 items-center justify-center px-8 ${isDark ? "bg-black" : "bg-slate-50"}`}>
        <Ionicons name="lock-closed-outline" size={38} color={PRIMARY} />
        <Text className={`mt-4 text-center text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Leader access required
        </Text>
        <Text className={`mt-2 text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Only Leaders and Super Admins can publish fellowship videos.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: isDark ? "#09090b" : "#f8fafc" }}
    >
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-7 flex-row items-center justify-between">
          <View>
            <Text className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-950"}`}>
              Post a video
            </Text>
            <Text className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Publish a clear, helpful fellowship moment.
            </Text>
          </View>
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-black/5">
            <Ionicons name="close" size={22} color={isDark ? "#fff" : "#111827"} />
          </Pressable>
        </View>

        <Text className={`mb-2 text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Sunday fellowship recap"
          placeholderTextColor={isDark ? "#71717a" : "#94a3b8"}
          maxLength={120}
          className={`mb-5 rounded-2xl border px-4 py-4 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-white text-gray-900"}`}
        />

        <Text className={`mb-2 text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}>Description <Text className="font-normal text-gray-400">(optional)</Text></Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What should members know about this video?"
          placeholderTextColor={isDark ? "#71717a" : "#94a3b8"}
          multiline
          maxLength={1000}
          textAlignVertical="top"
          className={`mb-5 min-h-[110px] rounded-2xl border px-4 py-4 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-white text-gray-900"}`}
        />

        <Pressable
          onPress={pickVideo}
          className={`mb-3 rounded-2xl border p-5 ${isDark ? "border-orange-400/30 bg-orange-400/10" : "border-orange-200 bg-orange-50"}`}
        >
          <Ionicons name={video ? "checkmark-circle" : "videocam-outline"} size={28} color={PRIMARY} />
          <Text className={`mt-2 font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {video ? video.fileName || "Video selected" : "Choose video"}
          </Text>
          <Text className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            MP4 or another supported video format, up to 10 minutes.
          </Text>
        </Pressable>

        <Pressable
          onPress={pickThumbnail}
          className={`mb-7 rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}
        >
          <Ionicons name={thumbnail ? "checkmark-circle" : "image-outline"} size={26} color={thumbnail ? "#16a34a" : "#64748b"} />
          <Text className={`mt-2 font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {thumbnail ? thumbnail.fileName || "Thumbnail selected" : "Add a thumbnail (optional)"}
          </Text>
          <Text className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            A 16:9 image makes the video easier to discover.
          </Text>
        </Pressable>

        <Pressable
          disabled={saving}
          onPress={publish}
          className="items-center rounded-2xl bg-orange-500 px-5 py-4"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-bold text-white">Publish video</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
