import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AboutScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#f9fafb" },
      ]}
    >
      <LinearGradient
        colors={isDark ? ["#1a1a1a", "#000000"] : ["#f8fafc", "#ffffff"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View
        className={`px-5 pb-4 flex-row items-center border-b ${isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"}`}
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center mr-3"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "white" : "#0f172a"}
          />
        </TouchableOpacity>
        <Text
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          About
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.card}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#1f2937" }]}>
            4 Kilo Fellowship
          </Text>
          <Text
            style={[styles.version, { color: isDark ? "#9ca3af" : "#6b7280" }]}
          >
            Version 1.0.0
          </Text>

          <Text
            style={[
              styles.paragraph,
              { color: isDark ? "#d1d5db" : "#4b5563" },
            ]}
          >
            Welcome to the 4 Kilo Fellowship application. Our mission is to
            foster community, facilitate deep connections, and provide a
            platform for our members to engage with events, teams, and devotions
            seamlessly.
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: isDark ? "#d1d5db" : "#4b5563" },
            ]}
          >
            This modern application serves as a hub for spiritual growth, where
            you can find resources, join discussions, and stay updated with the
            latest fellowship activities.
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: isDark ? "#d1d5db" : "#4b5563" },
            ]}
          >
            Driven by passion and built with love, 4 Kilo Fellowship is here to
            support your journey. Thank you for being a part of our community.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  version: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 24,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 20,
    fontStyle: "italic",
    fontWeight: "400",
  },
});
