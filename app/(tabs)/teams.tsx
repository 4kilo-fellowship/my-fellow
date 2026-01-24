import { QuickActions } from "@/components";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- Types ---
type Team = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  members: string;
};

// --- Dummy Data ---
const TEAMS: Team[] = [
  {
    id: "1",
    name: "Worship",
    icon: "musical-notes",
    color: "#0ea5e9",
    members: "45",
  }, // Sky Blue
  {
    id: "2",
    name: "Media & IT",
    icon: "videocam",
    color: "#db2777",
    members: "12",
  }, // Pink
  { id: "3", name: "Ushers", icon: "people", color: "#d97706", members: "30" }, // Amber
  { id: "4", name: "Prayer", icon: "flame", color: "#dc2626", members: "20" }, // Red
  {
    id: "5",
    name: "Logistics",
    icon: "construct",
    color: "#4b5563",
    members: "15",
  }, // Gray
  { id: "6", name: "Kids", icon: "happy", color: "#84cc16", members: "25" }, // Lime
  {
    id: "7",
    name: "Outreach",
    icon: "megaphone",
    color: "#059669",
    members: "50",
  }, // Emerald
  {
    id: "8",
    name: "Arts",
    icon: "color-palette",
    color: "#7c3aed",
    members: "18",
  }, // Violet
];

const { width } = Dimensions.get("window");
const GAP = 12;
const PADDING = 20;
const ITEM_WIDTH = (width - PADDING * 2 - GAP) / 2;

const Teams = () => {
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [searchText, setSearchText] = useState("");

  // Filter logic
  const filteredTeams = TEAMS.filter((t) =>
    t.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  // --- Components ---

  const SearchBar = () => (
    <View
      className={`mx-5 mb-6 px-4 h-12 rounded-2xl flex-row items-center ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}
    >
      <Ionicons
        name="search"
        size={20}
        color={isDark ? "#a1a1aa" : "#71717a"}
      />
      <TextInput
        placeholder="Search ministries..."
        placeholderTextColor={isDark ? "#a1a1aa" : "#71717a"}
        className={`flex-1 ml-3 text-base ${isDark ? "text-white" : "text-black"}`}
        value={searchText}
        onChangeText={setSearchText}
      />
    </View>
  );

  const GridCard = ({ item }: { item: Team }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 0.85, // Aspect ratio similar to screenshot
        backgroundColor: item.color,
      }}
      className="rounded-2xl p-4 relative overflow-hidden justify-between mb-3 shadow-sm"
      onPress={() => console.log("Open", item.name)}
    >
      {/* Huge Background Icon (Watermark style) */}
      <View className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12">
        <Ionicons name={item.icon} size={110} color="white" />
      </View>

      {/* Content */}
      <View>
        <Text className="text-white text-lg font-extrabold tracking-wide">
          {item.name}
        </Text>
        <View className="bg-black/10 self-start px-2 py-0.5 rounded-md mt-1">
          <Text className="text-white/90 text-[10px] font-bold">
            {item.members} Mbrs
          </Text>
        </View>
      </View>

      {/* Small directional arrow */}
      <View className="self-end bg-white/20 p-1.5 rounded-full">
        <Ionicons name="arrow-forward" size={14} color="white" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 ${isDark ? "bg-[#1A1A1B]" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={{ paddingTop: top + 10, paddingBottom: 100 }}>
        {/* HEADER */}
        <View className="px-5 mb-4">
          <Text
            className={`text-4xl font-extrabold ${isDark ? "text-white" : "text-black"}`}
          >
            Teams
          </Text>
        </View>

        {/* Search & Actions */}
        <SearchBar />
        <QuickActions />

        {/* Grid Content */}
        <FlatList
          data={filteredTeams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GridCard item={item} />}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: PADDING,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View className="mt-4 px-5 mb-10">
              <View
                className={`p-6 rounded-2xl items-center ${isDark ? "bg-zinc-900" : "bg-zinc-50 border border-zinc-100"}`}
              >
                <Text
                  className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-black"}`}
                >
                  Still unsure?
                </Text>
                <Text className="text-zinc-500 text-center text-sm mb-4">
                  Take our spiritual gifts test to find your place.
                </Text>
                <TouchableOpacity className="bg-black dark:bg-white px-6 py-3 rounded-full">
                  <Text
                    className={`font-bold ${isDark ? "text-black" : "text-white"}`}
                  >
                    Take Test
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default Teams;
