import { useTheme } from "@/context/ThemeContext";
import { useEventsStore } from "@/stores/events.store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

const EventDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
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
  }, [id]);

  if (loading || !selectedEvent) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#0369A1"} />
      </View>
    );
  }

  return (
    <ScrollView className={`${isDark ? "bg-gray-900" : "bg-white"} flex-1`}>
      {selectedEvent.image ? (
        <Image
          source={{ uri: selectedEvent.image }}
          style={{ width: "100%", height: 280 }}
          resizeMode="cover"
        />
      ) : null}

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
  );
};

export default EventDetail;
