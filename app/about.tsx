import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
        { backgroundColor: isDark ? "#000000" : "#f8fafc" },
      ]}
    >
      <LinearGradient
        colors={isDark ? ["#0a0a0a", "#000000"] : ["#ffffff", "#f1f5f9"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        className={`px-5 pb-4 flex-row items-center border-b ${isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"}`}
        style={{ paddingTop: insets.top + 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            borderless: true,
          }}
          className="w-11 h-11 rounded-full items-center justify-center mr-4"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "white" : "#0f172a"}
          />
        </Pressable>
        <Text
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          About
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
      >
        <View style={styles.heroSection}>
          <Text
            style={[styles.appName, { color: isDark ? "#fff" : "#1e293b" }]}
          >
            4 Kilo Fellowship
          </Text>
          <View
            style={[
              styles.versionBadge,
              { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" },
            ]}
          >
            <Text
              style={[
                styles.versionText,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              VERSION 1.0.0 (STABLE)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#fff" : "#1e293b" },
            ]}
          >
            Our Mission
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: isDark ? "#94a3b8" : "#475569" },
            ]}
          >
            Welcome to the 4 Kilo Fellowship application. Our mission is to
            foster community, facilitate deep connections, and provide a
            platform for our members to engage with events, teams, and devotions
            seamlessly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#fff" : "#1e293b" },
            ]}
          >
            Our Community
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: isDark ? "#94a3b8" : "#475569" },
            ]}
          >
            This modern application serves as a hub for spiritual growth, where
            you can find resources, join discussions, and stay updated with the
            latest fellowship activities.
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: isDark ? "#94a3b8" : "#475569" },
            ]}
          >
            Driven by passion and built with love, 4 Kilo Fellowship is here to
            support your journey. Thank you for being a part of our community.
          </Text>
        </View>

        <View style={styles.footerInfo}>
          <Text
            style={[
              styles.copyright,
              { color: isDark ? "#475569" : "#94a3b8" },
            ]}
          >
            © 2026 4 Kilo Fellowship. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: "400",
  },
  footerInfo: {
    marginTop: 16,
    alignItems: "center",
  },
  copyright: {
    fontSize: 12,
    fontWeight: "500",
  },
});
