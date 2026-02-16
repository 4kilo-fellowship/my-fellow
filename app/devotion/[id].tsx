import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { devotionsService } from "@/services/devotionsService";
import { useDevotionsStore } from "@/stores/devotions.store";
import { Devotion } from "@/types/devotion.types";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
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

  const { markAsRead, savedDevotions } = useDevotionsStore();

  const [devotion, setDevotion] = useState<Devotion | null>(null);
  const [allDevotions, setAllDevotions] = useState<Devotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const player = useAudioPlayer(devotion?.audioUrl || "");
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    const loadDevotion = async () => {
      try {
        const response = await devotionsService.getDevotionById(id);
        if (response.success) {
          setDevotion(response.data);
          setIsLiked(response.data.isLiked || false);
          setLikesCount(response.data.likes);

          // Mark as read
          markAsRead(id);

          // Track view
          devotionsService.trackView(id);

          // Trigger offline download
          downloadForOffline(response.data);
        }

        // Fetch all devotions for related section
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
      const folder = `${FileSystem.documentDirectory}devotions/${item._id}/`;
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true });

      // Download main image
      if (item.image) {
        const imageFile = folder + "image.jpg";
        await FileSystem.downloadAsync(item.image, imageFile);
      }

      // Download audio if applicable
      if (item.audioUrl) {
        const audioFile = folder + "audio.mp3";
        await FileSystem.downloadAsync(item.audioUrl, audioFile);
      }

      // Download PDF if applicable
      if (item.pdfUrl) {
        const pdfFile = folder + "document.pdf";
        await FileSystem.downloadAsync(item.pdfUrl, pdfFile);
      }

      console.log("Devotion downloaded for offline use");
    } catch (error) {
      console.error("Error downloading for offline:", error);
    } finally {
      setIsDownloading(false);
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
    try {
      const response = await devotionsService.likeDevotion(id);
      if (response.success) {
        setIsLiked(response.isLiked);
        setLikesCount((prev) => (response.isLiked ? prev + 1 : prev - 1));
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

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (loading) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-zinc-950" : "bg-gray-50"}`}
      >
        <ActivityIndicator size="large" color={PRIMARY} />
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
          onPress={() => router.back()}
          className="mt-4 px-6 py-2 bg-primary rounded-full"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-zinc-950" : "bg-white"}`}>
      <StatusBar style="light" />

      {/* Hero Header - Background and Overlay */}
      <View
        style={{ position: "absolute", top: 0, width: "100%", height: 400 }}
      >
        <Image
          source={{ uri: devotion.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/40" />
      </View>

      <View
        className="flex-row items-center justify-between px-6 z-10"
        style={{ marginTop: top + 10 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md border border-white/20"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md border border-white/20"
        >
          <Ionicons name="share-social-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 200 }}
      >
        {/* Content Container with Rounded Corners */}
        <View className="bg-white dark:bg-zinc-950 rounded-t-[40px] px-6 pt-8 pb-20 mt-20">
          {/* Metadata */}
          <View className="flex-row items-center mb-4">
            <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Text className="text-primary text-[10px] font-black uppercase tracking-widest">
                {devotion.type}
              </Text>
            </View>
            <Text className="text-zinc-400 text-xs ml-3 font-bold uppercase tracking-tighter">
              {new Date(devotion.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>

          <Text
            className={`text-4xl font-black leading-[1.1] mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}
          >
            {devotion.title}
          </Text>
          <Text className="text-primary text-base font-bold mb-8 italic">
            By {devotion.author}
          </Text>

          {/* Audio Player at the TOP if it exists */}
          {devotion.type === "voice" && (
            <View className="mb-10 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
              <View className="flex-row items-center mb-6">
                <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center">
                  <Ionicons name="mic" size={24} color={PRIMARY} />
                </View>
                <View className="ml-4 flex-1">
                  <Text
                    className={`text-lg font-black ${isDark ? "text-white" : "text-zinc-900"}`}
                  >
                    Audio Message
                  </Text>
                  <Text className="text-zinc-500 text-xs font-medium">
                    {devotion.caption || "Listen and reflect on the word"}
                  </Text>
                </View>
              </View>

              <View className="w-full">
                <View className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
                  <View
                    style={{
                      width:
                        status.duration > 0
                          ? `${(status.currentTime / status.duration) * 100}%`
                          : "0%",
                    }}
                    className="h-full bg-primary rounded-full"
                  />
                </View>
                <View className="flex-row justify-between mb-6">
                  <Text className="text-zinc-400 text-[10px] font-black">
                    {formatTime(status.currentTime)}
                  </Text>
                  <Text className="text-zinc-400 text-[10px] font-black">
                    {devotion.duration || formatTime(status.duration)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-center">
                  <TouchableOpacity
                    onPress={() =>
                      player.seekTo(Math.max(0, status.currentTime - 10000))
                    }
                  >
                    <Ionicons
                      name="play-back"
                      size={24}
                      color={isDark ? "#71717a" : "#18181b"}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      status.playing ? player.pause() : player.play()
                    }
                    className="mx-10 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/30"
                  >
                    <Ionicons
                      name={status.playing ? "pause" : "play"}
                      size={28}
                      color="white"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      player.seekTo(
                        Math.min(status.duration, status.currentTime + 10000),
                      )
                    }
                  >
                    <Ionicons
                      name="play-forward"
                      size={24}
                      color={isDark ? "#71717a" : "#18181b"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Quick Stats */}
          <View className="flex-row justify-between items-center mb-10 py-6 border-y border-zinc-100 dark:border-zinc-900">
            <TouchableOpacity
              onPress={handleLike}
              className="items-center flex-1"
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#ef4444" : "#a1a1aa"}
              />
              <Text
                className={`text-xs font-black mt-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
              >
                {likesCount} LIKES
              </Text>
            </TouchableOpacity>

            <View className="w-[1px] h-6 bg-zinc-100 dark:bg-zinc-900" />

            <View className="items-center flex-1">
              <Ionicons name="eye-outline" size={24} color="#a1a1aa" />
              <Text
                className={`text-xs font-black mt-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
              >
                {devotion.views} VIEWS
              </Text>
            </View>

            <View className="w-[1px] h-6 bg-zinc-100 dark:bg-zinc-900" />

            <View className="items-center flex-1">
              <Ionicons
                name={isDownloading ? "cloud-download" : "cloud-done-outline"}
                size={24}
                color={isDownloading ? PRIMARY : "#10b981"}
              />
              <Text
                className={`text-xs font-black mt-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
              >
                {isDownloading ? "SAVING..." : "OFFLINE"}
              </Text>
            </View>
          </View>

          {/* Content Section */}
          <View className="mb-12">
            {devotion.content && (
              <Markdown
                style={{
                  body: {
                    color: isDark ? "#d4d4d8" : "#3f3f46",
                    fontSize: 18,
                    lineHeight: 30,
                    textAlign: "left",
                  },
                  paragraph: {
                    marginBottom: 20,
                  },
                  strong: {
                    fontWeight: "900",
                    color: isDark ? "#fff" : "#18181b",
                    fontSize: 20,
                  },
                  blockquote: {
                    backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                    borderLeftColor: PRIMARY,
                    borderLeftWidth: 4,
                    padding: 20,
                    borderRadius: 16,
                    marginVertical: 20,
                  },
                }}
              >
                {devotion.content}
              </Markdown>
            )}

            {devotion.type === "pdf" && (
              <View className="bg-zinc-50 dark:bg-zinc-900/30 p-8 rounded-[40px] items-center border border-zinc-100 dark:border-zinc-800">
                <Ionicons name="document-text" size={60} color="#ef4444" />
                <Text
                  className={`text-xl font-bold mt-4 ${isDark ? "text-white" : "text-zinc-900"}`}
                >
                  PDF Devotional
                </Text>
                <Text className="text-zinc-500 text-center mt-2 mb-6">
                  {devotion.pageCount} Pages • Document Study Guide
                </Text>
                <TouchableOpacity
                  className="bg-red-500 px-10 py-4 rounded-2xl flex-row items-center"
                  onPress={() => devotion.pdfUrl && openLink(devotion.pdfUrl)}
                >
                  <Ionicons name="eye-outline" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">
                    View Document
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {devotion.type === "book" && (
              <View className="bg-zinc-50 dark:bg-zinc-900/30 p-8 rounded-[40px] items-center border border-zinc-100 dark:border-zinc-800">
                <Ionicons name="book" size={60} color="#3b82f6" />
                <Text
                  className={`text-xl font-bold mt-4 ${isDark ? "text-white" : "text-zinc-900"}`}
                >
                  Study Book
                </Text>
                <Text className="text-zinc-500 text-center mt-2 mb-6">
                  Format: {devotion.bookFormat?.toUpperCase() || "EPUB"}
                </Text>
                <TouchableOpacity
                  className="bg-blue-600 px-10 py-4 rounded-2xl flex-row items-center"
                  onPress={() => devotion.bookUrl && openLink(devotion.bookUrl)}
                >
                  <Ionicons
                    name="cloud-download-outline"
                    size={20}
                    color="white"
                  />
                  <Text className="text-white font-bold ml-2">
                    Download Book
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Related Devotions */}
          {relatedDevotions.length > 0 && (
            <View className="mb-20">
              <View className="flex-row items-baseline mb-6">
                <Text
                  className={`text-2xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}
                >
                  Related
                </Text>
                <Text className="text-primary ml-2 font-bold">•</Text>
                <Text className="text-zinc-400 ml-2 font-bold text-xs uppercase tracking-widest">
                  More for you
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-6 px-6"
              >
                {relatedDevotions.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => router.push(`/devotion/${item._id}`)}
                    className="mr-6 w-64"
                  >
                    <View className="h-40 w-full rounded-[32px] overflow-hidden mb-3">
                      <Image
                        source={{ uri: item.image }}
                        className="w-full h-full"
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      className={`text-lg font-black leading-tight ${isDark ? "text-white" : "text-zinc-900"}`}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-zinc-500 text-xs font-bold mt-1 uppercase">
                      By {item.author}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: bottom + 40 }} />
        </View>
      </ScrollView>
    </View>
  );
};

export default DevotionDetail;
