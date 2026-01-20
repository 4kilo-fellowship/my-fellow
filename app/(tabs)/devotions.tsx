import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Types ---
export type DevotionType = "text" | "voice" | "pdf" | "book";

export type Devotion = {
  id: string;
  title: string;
  author: string;
  date: string;
  views: string;
  likes: string;
  image: string;
  type: DevotionType;
  duration?: string; // For voice
};

// --- Dummy Data ---
export const DEVOTIONS: Devotion[] = [
  {
    id: "1",
    title: "Finding Peace in Chaos",
    author: "Pastor Sarah",
    date: "Jan 12",
    views: "1.2k",
    likes: "340",
    type: "text",
    image:
      "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    title: "Morning Whispers",
    author: "John Doe",
    date: "Jan 10",
    views: "900",
    likes: "210",
    type: "voice",
    duration: "5:20",
    image:
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    title: "Deep Theology Vol. 1",
    author: "Dr. Aris",
    date: "Jan 08",
    views: "1.1k",
    likes: "295",
    type: "book",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    title: "Weekly Study Guide",
    author: "Church Media",
    date: "Jan 06",
    views: "850",
    likes: "180",
    type: "pdf",
    image:
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "5",
    title: "Faith and Hope",
    author: "Grace Lee",
    date: "Jan 04",
    views: "1.5k",
    likes: "400",
    type: "text",
    image:
      "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "6",
    title: "The Sound of Silence",
    author: "Mark T.",
    date: "Jan 02",
    views: "1.0k",
    likes: "250",
    type: "voice",
    duration: "12:45",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
  },
];

const CATEGORIES: { label: string; value: DevotionType | "all"; icon: any }[] =
  [
    { label: "All", value: "all", icon: "apps-outline" },
    { label: "Text", value: "text", icon: "document-text-outline" },
    { label: "Voice", value: "voice", icon: "mic-outline" },
    { label: "PDF", value: "pdf", icon: "document-outline" },
    { label: "Books", value: "book", icon: "book-outline" },
  ];

const Devotions = () => {
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedCat, setSelectedCat] = useState("all");

  const filteredDevotions = DEVOTIONS.filter(
    (item) => selectedCat === "all" || item.type === selectedCat,
  );

  const DevotionCard = ({ item }: { item: Devotion }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      className={`mb-5 rounded-3xl overflow-hidden ${isDark ? "bg-zinc-900" : "bg-white"} shadow-sm`}
      onPress={() => console.log("Navigate to details", item.id)}
    >
      {/* Image Section */}
      <View className="relative h-48 w-full">
        <Image source={{ uri: item.image }} className="w-full h-full" />
        <View className="absolute top-3 right-3 bg-black/40 px-3 py-1 rounded-full flex-row items-center">
          <Ionicons name="eye-outline" size={14} color="white" />
          <Text className="text-white text-xs ml-1 font-medium">
            {item.views}
          </Text>
        </View>

        {/* Type Badge */}
        <View className="absolute bottom-3 left-3 bg-primary px-3 py-1 rounded-lg">
          <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
            {item.type}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text
              className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}
            >
              {item.title}
            </Text>
            <Text
              className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
            >
              By {item.author} • {item.date}
            </Text>
          </View>
          <TouchableOpacity className="p-2">
            <Ionicons
              name="share-social-outline"
              size={22}
              color={isDark ? "#a1a1aa" : "#71717a"}
            />
          </TouchableOpacity>
        </View>

        {/* Footer Stats */}
        <View className="flex-row mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="heart-outline" size={18} color="#ef4444" />
            <Text
              className={`ml-1 text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}
            >
              {item.likes} Likes
            </Text>
          </View>

          {item.type === "voice" && (
            <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
              <Ionicons name="play-circle" size={16} color="#3b82f6" />
              <Text className="ml-1 text-xs text-blue-500 font-bold">
                {item.duration}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 ${isDark ? "bg-black" : "bg-slate-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={{ paddingTop: top + 10 }} className="px-5 pb-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text
              className={`text-3xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}
            >
              Devotions
            </Text>
            <Text
              className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
            >
              Feed your soul daily
            </Text>
          </View>
          <TouchableOpacity
            className={`h-10 w-10 rounded-full items-center justify-center ${isDark ? "bg-zinc-800" : "bg-white shadow-sm"}`}
          >
            <Ionicons
              name="search"
              size={20}
              color={isDark ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View className="py-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setSelectedCat(cat.value)}
              className={`mr-3 px-4 py-2.5 rounded-2xl flex-row items-center ${
                selectedCat === cat.value
                  ? "bg-primary"
                  : isDark
                    ? "bg-zinc-900"
                    : "bg-white"
              }`}
            >
              <Ionicons
                name={cat.icon}
                size={18}
                color={
                  selectedCat === cat.value
                    ? "white"
                    : isDark
                      ? "#a1a1aa"
                      : "#71717a"
                }
              />
              <Text
                className={`ml-2 font-semibold ${
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

      {/* List */}
      <FlatList
        data={filteredDevotions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DevotionCard item={item} />}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Ionicons name="document-text-outline" size={60} color="#cbd5e1" />
            <Text className="text-zinc-400 mt-4">
              No devotions found in this category
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Devotions;
