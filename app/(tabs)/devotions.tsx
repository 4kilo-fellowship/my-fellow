import { Placeholder } from "@/components";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { devotionsService } from "@/services/devotionsService";
import { useDevotionsStore } from "@/stores/devotions.store";
import { Devotion, DevotionType } from "@/types/devotion.types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES: {
  label: string;
  value: DevotionType | "all" | "new";
  icon: any;
}[] = [
  { label: "All", value: "all", icon: "apps-outline" },
  { label: "New", value: "new", icon: "sparkles-outline" },
  { label: "Saved", value: "saved" as any, icon: "bookmark-outline" },
  { label: "Text", value: "text", icon: "document-text-outline" },
  { label: "Voice", value: "voice", icon: "mic-outline" },
  { label: "PDF", value: "pdf", icon: "document-outline" },
  { label: "Books", value: "book", icon: "book-outline" },
];

const Devotions = () => {
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedCat, setSelectedCat] = useState<DevotionType | "all" | "new">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [devotions, setDevotions] = useState<Devotion[]>([]);

  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => blink());
    };
    blink();
  }, [blinkAnim]);

  const fetchDevotions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await devotionsService.getDevotions();
      if (response.success) {
        setDevotions(response.data);
      }
    } catch (error) {
      console.error("Error fetching devotions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevotions();
  }, []);

  const onRefresh = () => {
    fetchDevotions(true);
  };

  const isNew = (dateStr: string) => {
    const postDate = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const hasNew = devotions.some((item) => isNew(item.date));

  const visibleCategories = CATEGORIES.filter((cat) => {
    if (cat.value === "new") return hasNew;
    return true;
  });

  const { saveDevotion, unsaveDevotion, isDevotionSaved, savedDevotions } =
    useDevotionsStore();

  const filteredDevotions = devotions.filter((item) => {
    if (selectedCat === "all") return true;
    if (selectedCat === "new") return isNew(item.date);
    if (selectedCat === ("saved" as any)) return isDevotionSaved(item._id);
    return item.type === selectedCat;
  });

  // If "Saved" is selected and we have no server devotions matching (or just to show all saved),
  // we might want to prioritize the ones in the store.
  const displayDevotions =
    selectedCat === ("saved" as any)
      ? savedDevotions.length > 0
        ? savedDevotions
        : []
      : filteredDevotions;

  const handleToggleSave = (item: Devotion) => {
    if (isDevotionSaved(item._id)) {
      unsaveDevotion(item._id);
    } else {
      saveDevotion(item);
    }
  };

  const handleShare = async (item: Devotion) => {
    try {
      await Share.share({
        message: `Check out this devotion: ${item.title} by ${item.author}\n\nRead more on My Fellow app!`,
        url: item.image,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const DevotionCard = ({ item }: { item: Devotion }) => {
    const recentlyPosted = isNew(item.date);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        className={`mb-6 rounded-[32px] overflow-hidden ${
          isDark ? "bg-zinc-900" : "bg-white"
        } border ${isDark ? "border-zinc-800" : "border-zinc-100"} shadow-sm`}
        onPress={() => router.push(`/devotion/${item._id}`)}
      >
        {/* Image Section */}
        <View className="relative h-60 w-full">
          <Image
            source={{ uri: item.image }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Glass Overlay for Views */}
          <View className="absolute top-4 right-4 bg-black/40 px-3 py-1.5 rounded-2xl flex-row items-center backdrop-blur-md border border-white/20">
            <Ionicons name="eye" size={12} color="white" />
            <Text className="text-white text-[11px] ml-1.5 font-bold">
              {item.views > 999
                ? `${(item.views / 1000).toFixed(1)}k`
                : item.views}
            </Text>
          </View>

          {recentlyPosted && (
            <View className="absolute top-4 left-4 bg-primary px-3 py-1.5 rounded-2xl shadow-lg">
              <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                New
              </Text>
            </View>
          )}

          {/* Category Badge */}
          <View className="absolute bottom-4 left-4 bg-white/90 dark:bg-zinc-900/90 px-4 py-2 rounded-2xl backdrop-blur-md">
            <Text
              className={`text-[10px] font-black uppercase tracking-[2px] ${isDark ? "text-zinc-100" : "text-zinc-900"}`}
            >
              {item.type}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="p-6">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text
                numberOfLines={2}
                className={`text-2xl font-black leading-tight ${
                  isDark ? "text-zinc-100" : "text-zinc-900"
                }`}
              >
                {item.title}
              </Text>
              <View className="flex-row items-center mt-3">
                <Text
                  className={`text-sm font-bold ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  {item.author}
                </Text>
                <View
                  className={`mx-2 w-1 h-1 rounded-full ${isDark ? "bg-zinc-700" : "bg-zinc-300"}`}
                />
                <Text
                  className={`text-xs font-medium ${
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              className={`p-3.5 rounded-2xl ${
                isDark ? "bg-zinc-800" : "bg-zinc-100"
              } border ${isDark ? "border-zinc-700" : "border-zinc-200"}`}
              onPress={() => handleToggleSave(item)}
            >
              <Ionicons
                name={
                  isDevotionSaved(item._id) ? "bookmark" : "bookmark-outline"
                }
                size={24}
                color={
                  isDevotionSaved(item._id)
                    ? PRIMARY
                    : isDark
                      ? "#71717a"
                      : "#3f3f46"
                }
              />
            </TouchableOpacity>
          </View>

          {/* Footer Stats */}
          <View className="flex-row mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 items-center justify-between">
            <View className="flex-row items-center gap-x-4">
              <View className="flex-row items-center">
                <Ionicons
                  name="heart"
                  size={16}
                  color={item.isLiked ? "#ef4444" : "#d1d5db"}
                />
                <Text
                  className={`ml-1.5 text-xs font-black ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                >
                  {item.likes}
                </Text>
              </View>

              {item.type === "voice" && (
                <View className="flex-row items-center">
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={isDark ? "#52525b" : "#a1a1aa"}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-bold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    {item.duration}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={() => router.push(`/devotion/${item._id}`)}
              className="flex-row items-center bg-zinc-900 dark:bg-white px-4 py-2 rounded-xl"
            >
              <Text
                className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-zinc-900" : "text-white"}`}
              >
                Read Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-zinc-950" : "bg-gray-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ paddingTop: top + 10 }} className="flex-1">
        {/* Header Title */}
        <View className="px-6 mb-6">
          <Text
            className={`text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}
          >
            Devotions
          </Text>
        </View>

        {/* Filter Chips */}
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {visibleCategories.map((cat) => (
              <TouchableOpacity
                activeOpacity={0.8}
                key={cat.value}
                onPress={() => setSelectedCat(cat.value)}
                className={`mr-3 px-4 py-2 rounded-xl flex-row items-center border ${
                  selectedCat === cat.value
                    ? "bg-primary border-primary"
                    : isDark
                      ? "bg-zinc-900 border-zinc-800"
                      : "bg-white border-zinc-200"
                }`}
              >
                {cat.value === "new" ? (
                  <Animated.View style={{ opacity: blinkAnim }}>
                    <Ionicons
                      name={cat.icon}
                      size={16}
                      color={selectedCat === cat.value ? "white" : "#ef4444"}
                    />
                  </Animated.View>
                ) : (
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={
                      selectedCat === cat.value
                        ? "white"
                        : isDark
                          ? "#a1a1aa"
                          : "#71717a"
                    }
                  />
                )}
                <Text
                  className={`ml-2 font-bold text-sm ${
                    selectedCat === cat.value
                      ? "text-white"
                      : isDark
                        ? "text-zinc-400"
                        : "text-zinc-600"
                  }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading && devotions.length === 0 ? (
          <View className="px-5">
            {[1, 2, 3].map((_, i) => (
              <Placeholder
                key={i}
                width="100%"
                height={320}
                borderRadius={32}
                style={{ marginBottom: 20 }}
              />
            ))}
          </View>
        ) : (
          <FlatList
            data={displayDevotions}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <DevotionCard item={item} />}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={PRIMARY}
                colors={[PRIMARY]}
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center mt-32 px-10">
                <View
                  className={`w-24 h-24 rounded-full ${isDark ? "bg-zinc-900" : "bg-zinc-100"} items-center justify-center mb-6`}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={40}
                    color={isDark ? "#3f3f46" : "#d1d5db"}
                  />
                </View>
                <Text
                  className={`text-xl font-bold text-center ${isDark ? "text-zinc-200" : "text-zinc-900"}`}
                >
                  No devotions found
                </Text>
                <Text className="text-zinc-500 mt-2 text-center">
                  Try adjusting your filters or check back later for new
                  content.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default Devotions;
