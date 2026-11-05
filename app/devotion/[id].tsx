import SignInPromptModal from "@/components/SignInPromptModal";
import { Placeholder } from "@/components";
import { PRIMARY } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { devotionsService } from "@/services/devotionsService";
import { useDevotionsStore } from "@/stores/devotions.store";
import { useStreakStore } from "@/stores/streak.store";
import { Devotion } from "@/types/devotion.types";
import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DevotionDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();

  const { markAsRead, savedDevotions, cacheDevotion, getCachedDevotion } =
    useDevotionsStore();

  const [devotion, setDevotion] = useState<Devotion | null>(null);
  const [allDevotions, setAllDevotions] = useState<Devotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number | string>(0);
  const [viewsCount, setViewsCount] = useState<number | string>(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(1);
  const { authState } = useAuth();

  const cachedDevotion = useMemo(() => getCachedDevotion(id), [id]);

  useEffect(() => {
    if (cachedDevotion) {
      setDevotion(cachedDevotion);
      setIsLiked(cachedDevotion.isLiked || false);
      setLikesCount(cachedDevotion.likesFormatted || cachedDevotion.likes);
      setViewsCount(cachedDevotion.viewsFormatted || cachedDevotion.views);
      setLoading(false);
    }
  }, [cachedDevotion]);

  // Configure Expo SDK 58 native audio session mode
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch((err) => console.log("Audio mode set error:", err));
  }, []);

  const player = useAudioPlayer(devotion?.audioUrl || "");
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (devotion && player && devotion.type === "voice") {
      player.setActiveForLockScreen(true, {
        title: devotion.title,
        artist: devotion.author,
        artworkUrl: devotion.image,
      });
    }

    return () => {
      try {
        player.clearLockScreenControls();
      } catch {}
    };
  }, [devotion, player]);

  const togglePlayPause = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeekPress = (e: GestureResponderEvent) => {
    if (status.duration > 0 && progressBarWidth > 0) {
      const clickX = e.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, clickX / progressBarWidth));
      player.seekTo(ratio * status.duration);
    }
  };

  useEffect(() => {
    const loadDevotion = async () => {
      try {
        const response = await devotionsService.getDevotionById(id);
        if (response.success) {
          setDevotion(response.data);
          cacheDevotion(response.data);
          setIsLiked(response.data.isLiked || false);
          setLikesCount(response.data.likesFormatted || response.data.likes);
          setViewsCount(response.data.viewsFormatted || response.data.views);
          markAsRead(id);
          useStreakStore.getState().recordDevotionRead();

          devotionsService.trackView(id).then((viewRes) => {
            if (viewRes.success) {
              setViewsCount(viewRes.data.viewsFormatted);
              cacheDevotion({
                ...response.data,
                viewsFormatted: viewRes.data.viewsFormatted,
              });
            }
          });

          if (response.data.type === "voice" && response.data.audioUrl) {
            downloadForOffline(response.data);
          }
        }

        const allResponse = await devotionsService.getDevotions();
        if (allResponse.success) {
          setAllDevotions(allResponse.data);
        }
      } catch (error) {
        console.error("Error loading devotion:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDevotion();
  }, [id]);

  const downloadForOffline = async (item: Devotion) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const folder = `${FileSystem.documentDirectory}devotions/${item._id}/`;
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true });

      let totalFiles = 0;
      if (item.image) totalFiles++;
      const mediaUrl = item.audioUrl;
      if (mediaUrl) totalFiles++;

      let completedFiles = 0;

      const onProgress = (downloadProgress: {
        totalBytesWritten: number;
        totalBytesExpectedToWrite: number;
      }) => {
        if (downloadProgress.totalBytesExpectedToWrite > 0) {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          const overallProgress =
            (completedFiles / totalFiles + progress / totalFiles) * 100;
          setDownloadProgress(Math.min(overallProgress, 100));
        }
      };

      if (item.image) {
        const imageFile = folder + "image.jpg";
        const imageInfo = await FileSystem.getInfoAsync(imageFile);
        if (!imageInfo.exists) {
          const downloadResumable = FileSystem.createDownloadResumable(
            item.image,
            imageFile,
            {},
            onProgress,
          );
          await downloadResumable.downloadAsync();
        }
        completedFiles++;
        setDownloadProgress((completedFiles / totalFiles) * 100);
      }

      if (mediaUrl) {
        const mediaFile = folder + "audio.mp3";
        const mediaInfo = await FileSystem.getInfoAsync(mediaFile);
        if (!mediaInfo.exists) {
          const downloadResumable = FileSystem.createDownloadResumable(
            mediaUrl,
            mediaFile,
            {},
            onProgress,
          );
          await downloadResumable.downloadAsync();
        }
        completedFiles++;
        setDownloadProgress((completedFiles / totalFiles) * 100);
      }
    } catch (error) {
      console.error("Error downloading for offline:", error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(100);
    }
  };

  const relatedDevotions = useMemo(() => {
    if (!devotion || !allDevotions.length) return [];
    return allDevotions
      .filter(
        (d) =>
          d._id !== devotion._id &&
          d.tags.some((tag) => devotion.tags.includes(tag)),
      )
      .slice(0, 3);
  }, [devotion, allDevotions]);

  const handleLike = async () => {
    if (!authState?.authenticated) {
      setShowSignInModal(true);
      return;
    }

    const action = isLiked ? "unlike" : "like";

    try {
      const response = await devotionsService.likeDevotion(id, action);
      if (response.success) {
        setIsLiked(!isLiked);
        setLikesCount(response.data.likesFormatted);
      }
    } catch (error) {
      console.error("Error liking devotion:", error);
    }
  };

  const handleShare = async () => {
    if (!devotion) return;
    try {
      await Share.share({
        message: `Devotion: ${devotion.title}\nBy ${devotion.author}\n\nRead more in My Fellow app!`,
        url: devotion.image,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const openLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Error opening link:", error);
    }
  };

  const formatTime = (secs: number) => {
    const totalSeconds = Math.floor(secs);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (loading && !devotion) {
    return (
      <View className={`flex-1 ${isDark ? "bg-[#0a0a0a]" : "bg-white"}`}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Minimal Header Skeleton */}
        <View
          className={`flex-row items-center justify-between px-5 ${
            isDark ? "bg-[#0a0a0a]" : "bg-white"
          }`}
          style={{
            paddingTop: top + 6,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#fff" : "#111"}
            />
          </TouchableOpacity>
          <Placeholder width={140} height={18} borderRadius={6} />
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8 }}
        >
          {/* Cover Image Placeholder */}
          <View className="w-full h-[260px]">
            <Placeholder width="100%" height={260} borderRadius={0} />
          </View>

          {/* Article Info Placeholder */}
          <View className="px-5 pt-6">
            <Placeholder width="90%" height={26} borderRadius={6} style={{ marginBottom: 10 }} />
            <Placeholder width="65%" height={24} borderRadius={6} style={{ marginBottom: 20 }} />

            {/* Author Row Placeholder */}
            <View
              className={`flex-row items-center justify-between pb-5 mb-6 border-b ${
                isDark ? "border-[#1a1a1a]" : "border-gray-100"
              }`}
            >
              <View className="flex-row items-center flex-1">
                <Placeholder width={40} height={40} borderRadius={20} />
                <View style={{ marginLeft: 10, flex: 1, gap: 6 }}>
                  <Placeholder width={110} height={14} borderRadius={4} />
                  <Placeholder width={75} height={12} borderRadius={4} />
                </View>
              </View>
              <Placeholder width={80} height={16} borderRadius={4} />
            </View>

            {/* Body Text Lines Placeholder */}
            <Placeholder width="100%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="96%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="92%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="98%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="80%" height={14} borderRadius={4} style={{ marginBottom: 24 }} />

            <Placeholder width="100%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="94%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="88%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!devotion) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-zinc-950" : "bg-gray-50"}`}
      >
        <Text className={isDark ? "text-white" : "text-black"}>
          Devotion not found
        </Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.back()}
          className="mt-4 px-6 py-2 bg-primary rounded-full"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0a0a0a]" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        className={`absolute z-20 w-full flex-row items-center justify-between px-5 ${
          isDark ? "bg-[#0a0a0a]" : "bg-white"
        }`}
        style={{
          paddingTop: top + 6,
          paddingBottom: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#fff" : "#111"}
          />
        </TouchableOpacity>

        <Text
          numberOfLines={1}
          className={`text-[15px] font-bold flex-1 text-center mx-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {devotion.title}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => router.push(`/devotion/manage?id=${devotion._id || id}`)}
              className="w-9 h-9 rounded-full items-center justify-center bg-orange-500/10"
            >
              <Ionicons name="pencil" size={18} color="#ff6719" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleShare}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={isDark ? "#fff" : "#111"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: top + 52 }}
      >
        <View className="w-full h-[280px]">
          <Image
            source={{ uri: devotion.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="px-5 pt-6">
          <Text
            className={`text-[26px] font-extrabold leading-[33px] mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {devotion.title}
          </Text>

          <View
            className={`flex-row items-center justify-between pb-5 mb-5 border-b ${
              isDark ? "border-[#1a1a1a]" : "border-gray-100"
            }`}
          >
            <View className="flex-row items-center flex-1">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
                }`}
              >
                <Ionicons name="person" size={18} color={PRIMARY} />
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text
                  className={`text-[14px] font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  numberOfLines={1}
                >
                  {devotion.author}
                </Text>
                <Text
                  className={`text-[11px] ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {new Date(devotion.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center" style={{ gap: 14 }}>
              <TouchableOpacity
                onPress={handleLike}
                className="flex-row items-center"
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={18}
                  color={isLiked ? "#ef4444" : isDark ? "#555" : "#aaa"}
                />
                <Text
                  className={`text-[11px] font-bold ml-1 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {likesCount}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center">
                <Ionicons
                  name="eye-outline"
                  size={18}
                  color={isDark ? "#555" : "#aaa"}
                />
                <Text
                  className={`text-[11px] font-bold ml-1 ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {viewsCount}
                </Text>
              </View>

              <View className="flex-row items-center">
                {isDownloading ? (
                  <View className="flex-row items-center">
                    <Text
                      className={`text-[10px] font-bold mr-2 ${isDark ? "text-primary" : "text-primary"}`}
                    >
                      {Math.round(downloadProgress)}%
                    </Text>
                    <ActivityIndicator size="small" color={PRIMARY} />
                  </View>
                ) : (
                  <Ionicons
                    name="cloud-done-outline"
                    size={16}
                    color="#10b981"
                  />
                )}
              </View>
            </View>
          </View>

          {devotion.type === "voice" && (
            <View
              className={`mb-6 p-5 rounded-2xl border ${
                isDark
                  ? "bg-[#141416] border-[#222]"
                  : "bg-[#f8f9fa] border-gray-200"
              }`}
            >
              {/* Audio Player Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2.5">
                    <Ionicons name="musical-notes" size={16} color={PRIMARY} />
                  </View>
                  <View>
                    <Text
                      className={`text-[13px] font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Audio Devotion & Message
                    </Text>
                    <Text
                      className={`text-[11px] ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {devotion.duration || "Voice with Caption"}
                    </Text>
                  </View>
                </View>

                {status.playing && (
                  <View className="flex-row items-center bg-primary/15 px-2.5 py-1 rounded-full">
                    <Ionicons name="volume-high" size={13} color={PRIMARY} />
                    <Text className="text-[10px] font-bold text-primary ml-1">
                      Playing
                    </Text>
                  </View>
                )}
              </View>

              {/* Progress Bar (Scrubbable) */}
              <View
                className="w-full mb-3"
                onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
              >
                <Pressable
                  hitSlop={12}
                  onPress={handleSeekPress}
                  className={`h-2.5 w-full rounded-full overflow-hidden ${
                    isDark ? "bg-[#252528]" : "bg-gray-200"
                  } justify-center`}
                >
                  <View
                    style={{
                      width:
                        status.duration > 0
                          ? `${Math.min(100, Math.max(0, (status.currentTime / status.duration) * 100))}%`
                          : "0%",
                    }}
                    className="h-full bg-primary rounded-full"
                  />
                </Pressable>
                <View className="flex-row justify-between mt-1.5">
                  <Text
                    className={`text-[11px] font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatTime(status.currentTime)}
                  </Text>
                  <Text
                    className={`text-[11px] font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {devotion.duration || formatTime(status.duration)}
                  </Text>
                </View>
              </View>

              {/* Player Controls */}
              <View className="flex-row items-center justify-center pt-1" style={{ gap: 24 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    player.seekTo(Math.max(0, status.currentTime - 10));
                  }}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isDark ? "bg-[#222]" : "bg-gray-100"
                  }`}
                >
                  <Ionicons
                    name="play-back"
                    size={18}
                    color={isDark ? "#ccc" : "#555"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={togglePlayPause}
                  className="w-14 h-14 bg-primary rounded-full items-center justify-center shadow-md shadow-primary/30"
                >
                  <Ionicons
                    name={status.playing ? "pause" : "play"}
                    size={26}
                    color="white"
                    style={!status.playing ? { marginLeft: 3 } : undefined}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    player.seekTo(
                      Math.min(status.duration, status.currentTime + 10),
                    );
                  }}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isDark ? "bg-[#222]" : "bg-gray-100"
                  }`}
                >
                  <Ionicons
                    name="play-forward"
                    size={18}
                    color={isDark ? "#ccc" : "#555"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Devotion Content & Caption */}
          <View className="mb-8">
            {devotion.type === "voice" && (
              <View className="flex-row items-center mb-3">
                <Ionicons name="chatbox-ellipses-outline" size={17} color={PRIMARY} />
                <Text
                  className={`text-[15px] font-bold ml-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Voice Caption & Message
                </Text>
              </View>
            )}

            {/* Display voice caption or article text */}
            {(devotion.caption || devotion.content) && (
              <Markdown
                style={{
                  body: {
                    color: isDark ? "#d1d5db" : "#374151",
                    fontSize: 16,
                    lineHeight: 28,
                  },
                  paragraph: {
                    marginBottom: 16,
                  },
                  heading2: {
                    color: isDark ? "#f9fafb" : "#111827",
                    fontSize: 22,
                    fontWeight: "800",
                    marginTop: 28,
                    marginBottom: 12,
                    lineHeight: 30,
                  },
                  heading3: {
                    color: isDark ? "#e5e7eb" : "#1f2937",
                    fontSize: 18,
                    fontWeight: "700",
                    marginTop: 24,
                    marginBottom: 10,
                    lineHeight: 26,
                  },
                  strong: {
                    fontWeight: "700",
                    color: isDark ? "#f3f4f6" : "#111827",
                  },
                  em: {
                    fontStyle: "italic",
                    color: isDark ? "#d1d5db" : "#4b5563",
                  },
                  blockquote: {
                    backgroundColor: isDark ? "#141416" : "#f9fafb",
                    borderLeftColor: PRIMARY,
                    borderLeftWidth: 3,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 8,
                    marginVertical: 16,
                  },
                  hr: {
                    backgroundColor: isDark ? "#1a1a1a" : "#e5e7eb",
                    height: 1,
                    marginVertical: 24,
                  },
                  list_item: {
                    marginBottom: 6,
                  },
                  bullet_list: {
                    marginBottom: 16,
                  },
                  ordered_list: {
                    marginBottom: 16,
                  },
                }}
              >
                {devotion.caption || devotion.content || ""}
              </Markdown>
            )}

            {/* If devotion has both distinct content and caption */}
            {devotion.type === "voice" &&
              devotion.content &&
              devotion.caption &&
              devotion.content !== devotion.caption && (
                <View className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
                  <Markdown
                    style={{
                      body: {
                        color: isDark ? "#d1d5db" : "#374151",
                        fontSize: 16,
                        lineHeight: 28,
                      },
                    }}
                  >
                    {devotion.content}
                  </Markdown>
                </View>
              )}
          </View>

          {relatedDevotions.length > 0 && (
            <View className="mb-8">
              <Text
                className={`text-[18px] font-bold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Related
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5 px-5"
              >
                {relatedDevotions.map((item) => (
                  <View
                    key={item._id}
                    className="mr-3 w-52 rounded-2xl overflow-hidden"
                  >
                    <Pressable
                      android_ripple={{
                        color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                        foreground: true,
                      }}
                      style={({ pressed }) => [
                        Platform.OS === "ios" && pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                      ]}
                      onPress={() => router.push(`/devotion/${item._id}`)}
                    >
                      <View
                        className={`h-32 w-full rounded-xl overflow-hidden mb-2 border ${
                          isDark ? "border-[#1a1a1a] bg-[#141414]" : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <Image
                          source={{ uri: item.image }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                      <Text
                        numberOfLines={2}
                        className={`text-[14px] font-bold leading-tight ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className={`text-[11px] mt-1 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {item.author}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: bottom + 20 }} />
        </View>
      </ScrollView>

      <SignInPromptModal
        visible={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignIn={() => {
          setShowSignInModal(false);
          router.push("/(auth)/sign-in");
        }}
        message="Sign in to like this devotion and save it to your favorites."
      />
    </View>
  );
};

export default DevotionDetail;
