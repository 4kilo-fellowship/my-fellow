import { VideoItem, VideoPlayerModal } from "@/components";
import { PRIMARY } from "@/constants";
import { Video, DEFAULT_VIDEOS } from "@/constants/videos";
import { useTheme } from "@/context/ThemeContext";
import { useCanPublishVideos } from "@/hooks/useCanPublishVideos";
import { socialApi } from "@/services/socialApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VideosScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const canPublish = useCanPublishVideos();
  const [videos, setVideos] = useState<Video[]>(DEFAULT_VIDEOS);
  const [selected, setSelected] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await socialApi.getContentVideos();
      setVideos(res && res.length > 0 ? res : DEFAULT_VIDEOS);
    } catch {
      setVideos(DEFAULT_VIDEOS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  return (
    <View
      style={{ flex: 1, backgroundColor: isDark ? "#09090b" : "#f8fafc" }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 36,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load().catch(() => setRefreshing(false));
            }}
            tintColor={PRIMARY}
          />
        }
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-950"}`}>
              Fellowship videos
            </Text>
            <Text className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Teach, worship, and share what God is doing.
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Close videos"
            className={`h-10 w-10 items-center justify-center rounded-full ${isDark ? "bg-white/10" : "bg-white"}`}
          >
            <Ionicons name="close" size={22} color={isDark ? "#fff" : "#111827"} />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={PRIMARY} size="large" />
        ) : videos.length === 0 ? (
          <View className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}>
            <Ionicons name="videocam-outline" size={34} color={PRIMARY} />
            <Text className={`mt-3 text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              No videos published yet
            </Text>
            <Text className={`mt-2 leading-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {canPublish
                ? "You can publish the first fellowship video for everyone to watch."
                : "A fellowship leader will publish the first video soon."}
            </Text>
            {canPublish ? (
              <Pressable
                onPress={() => router.push("/videos/manage")}
                className="mt-5 self-start rounded-xl bg-orange-500 px-4 py-3"
              >
                <Text className="font-bold text-white">Publish first video</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          videos.map((video) => (
            <VideoItem
              key={video.id}
              item={video}
              isDark={isDark}
              onPress={() => setSelected(video)}
            />
          ))
        )}
      </ScrollView>

      {canPublish && videos.length > 0 ? (
        <Pressable
          onPress={() => router.push("/videos/manage")}
          className="absolute bottom-7 right-5 flex-row items-center rounded-full bg-orange-500 px-5 py-4"
          style={{ elevation: 5 }}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text className="ml-1 font-bold text-white">Post video</Text>
        </Pressable>
      ) : null}

      <VideoPlayerModal
        visible={Boolean(selected)}
        video={selected}
        videos={videos}
        onClose={() => setSelected(null)}
        onSelectVideo={setSelected}
      />
    </View>
  );
}
