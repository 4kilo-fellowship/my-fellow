import { API_URL } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useEventsStore } from "@/stores/events.store";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EventDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { selectedEvent, fetchEventById, loading } = useEventsStore((s) => ({
    selectedEvent: s.selectedEvent,
    fetchEventById: s.fetchEventById,
    loading: s.loading,
  }));

  useEffect(() => {
    if (typeof id === "string") {
      fetchEventById(id);
    }
  }, [id, fetchEventById]);

  if (loading || !selectedEvent) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#0369A1"} />
      </View>
    );
  }

  const imageUri =
    (selectedEvent as any).image ||
    (selectedEvent as any).imageUrl ||
    (selectedEvent as any).image_url ||
    null;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0b1220" : "#fff" }}>
      {imageUri ? (
        <ExpoImage
          source={
            typeof imageUri === "string" && imageUri.startsWith("http")
              ? imageUri
              : `${API_URL.replace(/\/api$/, "")}${imageUri}`
          }
          style={{ width: "100%", height: 300 }}
          contentFit="cover"
          placeholder={require("@/assets/images/header.png")}
          transition={250}
        />
      ) : null}

      {/* Back button overlay */}
      <Pressable
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: Math.max(12, top + 6),
          left: 12,
          zIndex: 30,
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: 8,
          borderRadius: 12,
        }}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </Pressable>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ padding: 18 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: isDark ? "#fff" : "#0f172a",
              marginBottom: 8,
            }}
          >
            {selectedEvent.title}
          </Text>

          <Text
            style={{ color: isDark ? "#9ca3af" : "#475569", marginBottom: 12 }}
          >
            {selectedEvent.startDate}{" "}
            {selectedEvent.endDate ? `• ${selectedEvent.endDate}` : ""}
          </Text>

          <Text
            style={{
              color: isDark ? "#e5e7eb" : "#0f172a",
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            {selectedEvent.fullDescription ?? selectedEvent.shortDescription}
          </Text>

          {selectedEvent.metadata ? (
            <View style={{ marginTop: 18 }}>
              <Text
                style={{
                  color: isDark ? "#9ca3af" : "#64748b",
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                More info
              </Text>
              <Text style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}>
                {JSON.stringify(selectedEvent.metadata, null, 2)}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export default EventDetail;
