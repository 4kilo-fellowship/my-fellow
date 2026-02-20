import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
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
          Notifications
        </Text>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.02)",
            },
          ]}
        >
          <Ionicons
            name="notifications-off-outline"
            size={48}
            color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
          />
        </View>
        <Text style={[styles.title, { color: isDark ? "#fff" : "#1f2937" }]}>
          No notifications
        </Text>
        <Text
          style={[styles.subtitle, { color: isDark ? "#9ca3af" : "#6b7280" }]}
        >
          You're all caught up! Check back later for updates.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
