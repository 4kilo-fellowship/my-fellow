import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { devotionsService } from "@/services/devotionsService";
import { Devotion } from "@/types/devotion.types";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
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

  const [devotion, setDevotion] = useState<Devotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

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

          // Track view
          devotionsService.trackView(id);
        }
      } catch (error) {
        console.error("Error loading devotion:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDevotion();
  }, [id]);

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

      {/* Header Image */}
      <View style={{ height: 350 }} className="relative w-full">
        <Image
          source={{ uri: devotion.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/30" />

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ top: top + 10, left: 20 }}
          className="absolute w-10 h-10 rounded-full bg-black/40 items-center justify-center backdrop-blur-md"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          onPress={handleShare}
          style={{ top: top + 10, right: 20 }}
          className="absolute w-10 h-10 rounded-full bg-black/40 items-center justify-center backdrop-blur-md"
        >
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>

        {/* Bottom Metadata */}
        <View className="absolute bottom-6 left-6 right-6">
          <View className="flex-row items-center mb-2">
            <View className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-white text-[10px] font-bold uppercase">
                {devotion.type}
              </Text>
            </View>
            <Text className="text-white/80 text-xs ml-3 font-medium">
              {new Date(devotion.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
          <Text className="text-white text-3xl font-black leading-tight shadow-sm">
            {devotion.title}
          </Text>
          <Text className="text-white/90 text-sm mt-1 font-medium italic">
            By {devotion.author}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 -mt-5 rounded-t-[32px] bg-white dark:bg-zinc-950 p-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View className="flex-row justify-between items-center mb-8 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-3xl">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleLike}
              className={`w-12 h-12 rounded-2xl items-center justify-center ${isLiked ? "bg-red-50 dark:bg-red-900/10" : "bg-zinc-100 dark:bg-zinc-800"}`}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? "#ef4444" : "#a1a1aa"}
              />
            </TouchableOpacity>
            <View className="ml-3">
              <Text className="text-zinc-400 text-[10px] uppercase font-bold">
                Likes
              </Text>
              <Text
                className={`font-black text-base ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                {likesCount}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
              <Ionicons name="eye-outline" size={22} color="#a1a1aa" />
            </View>
            <View className="ml-3">
              <Text className="text-zinc-400 text-[10px] uppercase font-bold">
                Views
              </Text>
              <Text
                className={`font-black text-base ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                {devotion.views}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
              <Ionicons name="bookmark-outline" size={22} color="#a1a1aa" />
            </View>
            <View className="ml-3">
              <Text className="text-zinc-400 text-[10px] uppercase font-bold">
                Type
              </Text>
              <Text
                className={`font-black text-base ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                {devotion.type}
              </Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="mb-10">
          {devotion.type === "text" && devotion.content ? (
            <Markdown
              style={{
                body: {
                  color: isDark ? "#e4e4e7" : "#3f3f46",
                  fontSize: 16,
                  lineHeight: 26,
                },
                heading1: {
                  color: isDark ? "#fff" : "#18181b",
                  marginBottom: 10,
                },
                heading2: {
                  color: isDark ? "#fff" : "#18181b",
                  marginBottom: 10,
                },
                strong: {
                  fontWeight: "bold",
                  color: isDark ? "#fff" : "#18181b",
                },
              }}
            >
              {devotion.content}
            </Markdown>
          ) : devotion.type === "voice" ? (
            <View className="bg-zinc-50 dark:bg-zinc-900/30 p-8 rounded-[40px] items-center border border-zinc-100 dark:border-zinc-800">
              <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
                <Ionicons name="mic" size={40} color={PRIMARY} />
              </View>

              <Text
                className={`text-xl font-bold text-center ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                Listen to Audio Devotion
              </Text>
              <Text className="text-zinc-500 text-center mt-2 mb-8 px-4">
                {devotion.caption ||
                  "Take a moment to listen and reflect on today's word."}
              </Text>

              {/* Player UI */}
              <View className="w-full">
                <View className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
                  <View
                    style={{
                      width:
                        status.duration > 0
                          ? `${(status.currentTime / status.duration) * 100}%`
                          : "0%",
                    }}
                    className="h-full bg-primary"
                  />
                </View>
                <View className="flex-row justify-between mb-8">
                  <Text className="text-zinc-400 text-xs font-bold">
                    {formatTime(status.currentTime)}
                  </Text>
                  <Text className="text-zinc-400 text-xs font-bold">
                    {devotion.duration || formatTime(status.duration)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-center">
                  <TouchableOpacity
                    className="mx-8"
                    onPress={() =>
                      player.seekTo(Math.max(0, status.currentTime - 10000))
                    }
                  >
                    <Ionicons
                      name="play-back"
                      size={28}
                      color={isDark ? "#71717a" : "#18181b"}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      player.playing ? player.pause() : player.play()
                    }
                    className="w-20 h-20 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/30"
                  >
                    <Ionicons
                      name={status.playing ? "pause" : "play"}
                      size={32}
                      color="white"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mx-8"
                    onPress={() =>
                      player.seekTo(
                        Math.min(status.duration, status.currentTime + 10000),
                      )
                    }
                  >
                    <Ionicons
                      name="play-forward"
                      size={28}
                      color={isDark ? "#71717a" : "#18181b"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : devotion.type === "pdf" ? (
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
                  View PDF Document
                </Text>
              </TouchableOpacity>
            </View>
          ) : devotion.type === "book" ? (
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
                <Text className="text-white font-bold ml-2">Download Book</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Tags */}
        {devotion.tags && devotion.tags.length > 0 && (
          <View className="flex-row flex-wrap mb-10">
            {devotion.tags.map((tag, index) => (
              <View
                key={index}
                className="mr-2 mb-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl"
              >
                <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: bottom + 40 }} />
      </ScrollView>
    </View>
  );
};

export default DevotionDetail;
