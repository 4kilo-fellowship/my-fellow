import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { eventsService } from "@/services/eventsService";
import { useEventsStore } from "@/stores/events.store";
import { AppEvent } from "@/types/events.types";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = ["All", "Conferences", "Worship", "Prayer", "Fellowship"];

export default function EventsDirectoryScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { eventsList, setEventsList } = useEventsStore();
  const isAdmin = useIsAdmin();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await eventsService.fetchEvents();
      if (Array.isArray(res)) {
        setEventsList(res);
      }
    } catch (err) {
      console.warn("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  }, [setEventsList]);

  useEffect(() => {
    if (eventsList.length === 0) {
      loadEvents();
    }
  }, [eventsList.length, loadEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    return (eventsList || []).filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.shortDescription?.toLowerCase().includes(q) ||
        (item as any).location?.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "All" ||
        (item as any).category?.toLowerCase() === selectedCategory.toLowerCase() ||
        item.title?.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [eventsList, searchQuery, selectedCategory]);

  const handleShareEvent = async (item: AppEvent) => {
    const eventId = item._id || (item as any).id;
    const eventLink = Linking.createURL(`events/${eventId}`);
    const rawDate = item.startDate;
    const formattedDate = rawDate
      ? new Date(rawDate).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "";
    const location = (item as any).location || (item as any).venue || "AAU 4 Kilo Campus";

    const shareMessage = `🔥 ${item.title}${formattedDate ? `\n📅 ${formattedDate}` : ""}\n📍 ${location}\n\n${item.shortDescription || ""}\n\n👉 View event: ${eventLink}\n\n#MyFellow #AAUECSF`;

    try {
      await Share.share({
        message: shareMessage,
        title: item.title,
      });
    } catch {
      // Ignored
    }
  };

  const renderEventCard = ({ item }: { item: AppEvent }) => {
    const eventId = item._id || (item as any).id;
    const rawDate = item.startDate;
    const formattedDate = rawDate
      ? new Date(rawDate).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "Upcoming";

    return (
      <View
        style={[
          styles.eventCard,
          {
            backgroundColor: isDark ? "#18181b" : "#ffffff",
            borderColor: isDark ? "#27272a" : "#e5e7eb",
          },
        ]}
      >
        <Pressable
          onPress={() => router.push(`/events/${eventId}`)}
          android_ripple={{
            color: isDark ? "rgba(255, 102, 25, 0.18)" : "rgba(255, 102, 25, 0.12)",
            borderless: false,
          }}
          style={({ pressed }) => [
            styles.eventCardInner,
            pressed && Platform.OS === "ios" && { opacity: 0.85 },
          ]}
        >
          <ExpoImage
            source={
              item.imageUrl
                ? item.imageUrl
                : require("@/assets/images/header.png")
            }
            style={styles.cardCover}
            contentFit="cover"
            transition={200}
          />

          <View style={styles.cardDetails}>
            <View style={styles.cardHeaderRow}>
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: isDark ? "rgba(255, 102, 25, 0.15)" : "#fff7ed" },
                ]}
              >
                <Text style={styles.categoryPillText}>
                  {(item as any).category || "FELLOWSHIP"}
                </Text>
              </View>

              <View style={styles.cardActionsTop}>
                {isAdmin && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      router.push(`/events/manage?id=${eventId}`);
                    }}
                    android_ripple={{
                      color: "rgba(255, 103, 25, 0.25)",
                      borderless: true,
                      radius: 18,
                    }}
                    hitSlop={8}
                    style={styles.editIconButton}
                    accessibilityLabel={`Edit ${item.title}`}
                  >
                    <Ionicons
                      name="pencil"
                      size={17}
                      color={PRIMARY}
                    />
                  </Pressable>
                )}

                <Pressable
                  onPress={() => handleShareEvent(item)}
                  android_ripple={{
                    color: "rgba(0,0,0,0.15)",
                    borderless: true,
                    radius: 18,
                  }}
                  hitSlop={8}
                  style={styles.shareIconButton}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={18}
                    color={isDark ? "#9ca3af" : "#64748b"}
                  />
                </Pressable>
              </View>
            </View>

            <Text
              numberOfLines={2}
              style={[
                styles.cardTitle,
                { color: isDark ? "#ffffff" : "#0f172a" },
              ]}
            >
              {item.title}
            </Text>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color="#ff6719" />
              <Text
                style={[
                  styles.metaText,
                  { color: isDark ? "#94a3b8" : "#64748b" },
                ]}
              >
                {formattedDate}
              </Text>
              {(item as any).location && (
                <>
                  <Text style={{ color: isDark ? "#475569" : "#cbd5e1" }}>•</Text>
                  <Ionicons name="location-outline" size={14} color="#ff6719" />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.metaText,
                      { color: isDark ? "#94a3b8" : "#64748b", flexShrink: 1 },
                    ]}
                  >
                    {(item as any).location}
                  </Text>
                </>
              )}
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#09090b" : "#f8fafc" },
      ]}
      edges={["top", "bottom"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            android_ripple={{
              color: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
              borderless: true,
              radius: 20,
            }}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#ffffff" : "#0f172a"}
            />
          </Pressable>

          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? "#ffffff" : "#0f172a" },
            ]}
          >
            Events & Gatherings
          </Text>

          {isAdmin ? (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                router.push("/events/manage");
              }}
              android_ripple={{
                color: "rgba(255,255,255,0.2)",
                borderless: false,
                foreground: true,
              }}
              style={styles.addEventHeaderBtn}
              accessibilityLabel="Create New Event"
            >
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text style={styles.addEventHeaderText}>New</Text>
            </Pressable>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? "#18181b" : "#ffffff",
              borderColor: isDark ? "#27272a" : "#e2e8f0",
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={isDark ? "#71717a" : "#94a3b8"}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search upcoming fellowship events..."
            placeholderTextColor={isDark ? "#71717a" : "#94a3b8"}
            style={[
              styles.searchInput,
              { color: isDark ? "#ffffff" : "#0f172a" },
            ]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={6}>
              <Ionicons
                name="close-circle"
                size={16}
                color={isDark ? "#71717a" : "#94a3b8"}
              />
            </Pressable>
          )}
        </View>

        {/* Category Filter Chips */}
        <View style={styles.categoryList}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <View
                key={cat}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? PRIMARY
                      : isDark
                        ? "#18181b"
                        : "#ffffff",
                    borderColor: isSelected
                      ? PRIMARY
                      : isDark
                        ? "#27272a"
                        : "#e2e8f0",
                  },
                ]}
              >
                <Pressable
                  onPress={() => setSelectedCategory(cat)}
                  android_ripple={{
                    color: isSelected
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(255,102,25,0.15)",
                    borderless: false,
                  }}
                  style={styles.filterChipPress}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isSelected
                          ? "#ffffff"
                          : isDark
                            ? "#a1a1aa"
                            : "#64748b",
                        fontWeight: isSelected ? "700" : "600",
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      {/* Events List */}
      <FlatList<AppEvent>
        data={filteredEvents}
        keyExtractor={(item) => (item as any)._id || (item as any).id || Math.random().toString()}
        renderItem={renderEventCard}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(bottom, 24) + 40 },
        ]}
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
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color={PRIMARY} size="large" />
              <Text
                style={[
                  styles.emptyText,
                  { color: isDark ? "#71717a" : "#94a3b8" },
                ]}
              >
                Loading fellowship events...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="calendar-clear-outline"
                size={44}
                color={isDark ? "#3f3f46" : "#cbd5e1"}
              />
              <Text
                style={[
                  styles.emptyTitle,
                  { color: isDark ? "#ffffff" : "#0f172a" },
                ]}
              >
                No events found
              </Text>
              <Text
                style={[
                  styles.emptyText,
                  { color: isDark ? "#71717a" : "#94a3b8" },
                ]}
              >
                {searchQuery
                  ? "Try searching for another keyword or category."
                  : "Check back later for new programs and announcements."}
              </Text>
            </View>
          )
        }
      />

      {isAdmin && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            router.push("/events/manage");
          }}
          android_ripple={{
            color: "rgba(0,0,0,0.2)",
            borderless: false,
            foreground: true,
          }}
          style={[styles.floatingActionBtn, { bottom: Math.max(bottom + 16, 24) }]}
          accessibilityLabel="Create New Event"
        >
          <Ionicons name="add" size={28} color="#ffffff" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addEventHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    gap: 4,
    overflow: "hidden",
  },
  addEventHeaderText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  editIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingActionBtn: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    overflow: "hidden",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  filterChipPress: {
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  eventCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  eventCardInner: {
    width: "100%",
  },
  cardCover: {
    width: "100%",
    height: 180,
  },
  cardDetails: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ff6719",
    letterSpacing: 0.5,
  },
  cardActionsTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  shareIconButton: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
