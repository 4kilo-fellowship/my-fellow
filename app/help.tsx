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

export default function HelpScreen() {
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
          className="w-11 h-11 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: isDark ? "#1C1C1E" : "#e2e8f0" }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "white" : "#0f172a"}
          />
        </TouchableOpacity>
        <Text
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Help & Support
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
            How can we help?
          </Text>

          <Text
            style={[
              styles.paragraph,
              { color: isDark ? "#d1d5db" : "#4b5563" },
            ]}
          >
            If you are experiencing any issues with the application or have
            questions regarding our community, you're in the right place.
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: isDark ? "#d1d5db" : "#4b5563" },
            ]}
          >
            For technical support, feature requests, or reporting bugs, please
            reach out to our administration team. We are constantly working to
            improve your experience and value your feedback.
          </Text>

          <View
            style={[
              styles.contactBox,
              {
                backgroundColor: isDark
                  ? "rgba(255,102,25,0.1)"
                  : "rgba(255,102,25,0.05)",
                borderColor: "rgba(255,102,25,0.2)",
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={24}
              color="#ff6619"
              style={{ marginBottom: 12 }}
            />
            <Text
              style={[
                styles.contactTitle,
                { color: isDark ? "#fff" : "#1f2937" },
              ]}
            >
              Contact Support
            </Text>
            <Text
              style={[
                styles.contactText,
                { color: isDark ? "#9ca3af" : "#6b7280" },
              ]}
            >
              support@4kilofellowship.org
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 24,
  },
  card: {
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 20,
    fontStyle: "italic",
    fontWeight: "400",
  },
  contactBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
