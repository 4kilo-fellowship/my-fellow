import { MainTabHeader, Placeholder } from "@/components";
import { PRIMARY } from "@/constants";
import { devotionsService } from "@/services/devotionsService";
import { useDevotionsStore } from "@/stores/devotions.store";
import { Devotion } from "@/types/devotion.types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

export default function Devotions() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const pagerRef = useRef<PagerView>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [devotions, setDevotions] = useState<Devotion[]>([]);

  const {
    saveDevotion,
    unsaveDevotion,
    isDevotionSaved,
    savedDevotions,
    isDevotionRead,
  } = useDevotionsStore();

  const fetchDevotions = useCallback(async (isRefresh = false) => {
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
  }, []);

  useEffect(() => {
    fetchDevotions();
  }, [fetchDevotions]);

  const onRefresh = () => {
    fetchDevotions(true);
  };

  const handleTabChange = (index: 0 | 1) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  const handleToggleSave = (item: Devotion) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Ultra-minimalist Twitter/X-style feed card with native ripple
  const MinimalDevotionCard = ({ item }: { item: Devotion }) => {
    const isSaved = isDevotionSaved(item._id);
    const isRead = isDevotionRead(item._id);

    return (
      <View style={styles.tweetCardOuter}>
        <Pressable
          android_ripple={{ color: "rgba(0, 0, 0, 0.05)", foreground: true }}
          style={({ pressed }) => [
            styles.tweetCardPressable,
            Platform.OS === "ios" && pressed && { opacity: 0.95, backgroundColor: "#fafafa" },
          ]}
          onPress={() => router.push(`/devotion/${item._id}`)}
        >
          {/* Top Row: Author avatar / icon, author name, handle/role, date, bookmark button */}
          <View style={styles.tweetHeader}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>
                {item.author?.charAt(0)?.toUpperCase() || "F"}
              </Text>
            </View>

            <View style={styles.authorMeta}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName} numberOfLines={1}>
                  {item.author}
                </Text>
                <Text style={styles.authorDot}>·</Text>
                <Text style={styles.authorDate}>{formatDate(item.date)}</Text>
              </View>
              {isRead && (
                <View style={styles.readBadge}>
                  <Ionicons name="checkmark-done" size={12} color="#10b981" />
                  <Text style={styles.readText}>Read</Text>
                </View>
              )}
            </View>

            {/* Quick Bookmark action */}
            <Pressable
              hitSlop={12}
              android_ripple={{
                color: "rgba(0,0,0,0.1)",
                borderless: true,
                radius: 18,
              }}
              style={styles.actionIconButton}
              onPress={(e) => {
                e.stopPropagation();
                handleToggleSave(item);
              }}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={19}
                color={isSaved ? PRIMARY : "#71717a"}
              />
            </Pressable>
          </View>

          {/* Main Title & Teaser */}
          <Text style={styles.tweetTitle}>{item.title}</Text>
          {item.caption ? (
            <Text style={styles.tweetCaption} numberOfLines={2}>
              {item.caption}
            </Text>
          ) : null}

          {/* Minimalist 16:9 Image Preview */}
          {item.image ? (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: item.image }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              {item.type === "voice" && (
                <View style={styles.typeBadge}>
                  <Ionicons name="mic" size={11} color="#ffffff" />
                  <Text style={styles.typeBadgeText}>
                    {item.duration || "Audio"}
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Twitter-style Bottom Stats / Action Bar */}
          <View style={styles.tweetFooter}>
            <View style={styles.footerItem}>
              <Ionicons name="eye-outline" size={15} color="#71717a" />
              <Text style={styles.footerItemText}>
                {item.views > 999
                  ? `${(item.views / 1000).toFixed(1)}k`
                  : item.views || 0}
              </Text>
            </View>

            <View style={styles.footerItem}>
              <Ionicons name="heart-outline" size={15} color="#71717a" />
              <Text style={styles.footerItemText}>{item.likes || 0}</Text>
            </View>

            <Pressable
              hitSlop={10}
              android_ripple={{
                color: "rgba(0,0,0,0.1)",
                borderless: true,
                radius: 16,
              }}
              style={styles.footerShareButton}
              onPress={(e) => {
                e.stopPropagation();
                handleShare(item);
              }}
            >
              <Ionicons name="share-outline" size={15} color="#71717a" />
            </Pressable>
          </View>
        </Pressable>
      </View>
    );
  };

  const renderEmptyState = (isBookmarkTab: boolean) => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons
          name={isBookmarkTab ? "bookmark-outline" : "document-text-outline"}
          size={36}
          color="#a1a1aa"
        />
      </View>
      <Text style={styles.emptyTitle}>
        {isBookmarkTab ? "No saved devotions" : "No devotions found"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isBookmarkTab
          ? "Tap the bookmark icon on any devotion to save it here for later."
          : "Check back later for newly published devotions."}
      </Text>
    </View>
  );

  return (
    <View style={styles.screenContainer}>
      <StatusBar style="dark" />

      {/* Main Tab Header with "Devotions" in the center and live Streak badge */}
      <MainTabHeader borderBottom={true} title="Devotions" showStreak={true} />

      {/* Minimalist Twitter/X Tab Filter: All & Bookmarks */}
      <View style={styles.tabBarContainer}>
        {/* Tab 0: All */}
        <Pressable
          android_ripple={{ color: "rgba(0, 0, 0, 0.06)", foreground: true }}
          style={styles.tabItem}
          onPress={() => handleTabChange(0)}
        >
          <View style={styles.tabTitleWrapper}>
            <Text
              style={[
                styles.tabTitleText,
                activeTab === 0 ? styles.tabTitleActive : styles.tabTitleInactive,
              ]}
            >
              All
            </Text>
            {activeTab === 0 && <View style={styles.activeIndicator} />}
          </View>
        </Pressable>

        {/* Tab 1: Bookmarks / Saved */}
        <Pressable
          android_ripple={{ color: "rgba(0, 0, 0, 0.06)", foreground: true }}
          style={styles.tabItem}
          onPress={() => handleTabChange(1)}
        >
          <View style={styles.tabTitleWrapper}>
            <View style={styles.savedTabContent}>
              <Text
                style={[
                  styles.tabTitleText,
                  activeTab === 1 ? styles.tabTitleActive : styles.tabTitleInactive,
                ]}
              >
                Saved
              </Text>
              {savedDevotions.length > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    activeTab === 1 && styles.tabBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      activeTab === 1 && styles.tabBadgeTextActive,
                    ]}
                  >
                    {savedDevotions.length}
                  </Text>
                </View>
              )}
            </View>
            {activeTab === 1 && <View style={styles.activeIndicator} />}
          </View>
        </Pressable>
      </View>

      {/* Gesture Movement Page View: swipe between All and Saved */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position as 0 | 1)}
      >
        {/* Page 0: All Devotions */}
        <View key="all" style={styles.page}>
          {loading && devotions.length === 0 ? (
            <View style={styles.skeletonContainer}>
              {[1, 2, 3].map((_, i) => (
                <Placeholder
                  key={i}
                  width="100%"
                  height={190}
                  borderRadius={14}
                  style={{ marginBottom: 16 }}
                />
              ))}
            </View>
          ) : (
            <FlatList
              data={devotions}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <MinimalDevotionCard item={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={PRIMARY}
                  colors={[PRIMARY]}
                />
              }
              ListEmptyComponent={() => renderEmptyState(false)}
            />
          )}
        </View>

        {/* Page 1: Saved Bookmarks */}
        <View key="saved" style={styles.page}>
          <FlatList
            data={savedDevotions}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <MinimalDevotionCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={PRIMARY}
                colors={[PRIMARY]}
              />
            }
            ListEmptyComponent={() => renderEmptyState(true)}
          />
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  // Tab Bar (Twitter/X style with centered labels and active underline indicator)
  tabBarContainer: {
    flexDirection: "row",
    height: 48,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eff3f4",
  },
  tabItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabTitleWrapper: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    position: "relative",
  },
  savedTabContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabTitleText: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  tabTitleActive: {
    fontWeight: "700",
    color: "#0f1419",
  },
  tabTitleInactive: {
    fontWeight: "500",
    color: "#536471",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  tabBadge: {
    marginLeft: 6,
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 9999,
  },
  tabBadgeActive: {
    backgroundColor: PRIMARY,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#71717a",
  },
  tabBadgeTextActive: {
    color: "#ffffff",
  },
  // Pager & List
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 96,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Minimalist Twitter/X Feed Card
  tweetCardOuter: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden",
  },
  tweetCardPressable: {
    padding: 14,
  },
  tweetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  authorAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3f3f46",
  },
  authorMeta: {
    flex: 1,
    justifyContent: "center",
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#09090b",
    maxWidth: 160,
  },
  authorDot: {
    fontSize: 13,
    color: "#a1a1aa",
    marginHorizontal: 4,
  },
  authorDate: {
    fontSize: 12,
    color: "#71717a",
  },
  readBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  readText: {
    fontSize: 11,
    color: "#10b981",
    fontWeight: "600",
    marginLeft: 2,
  },
  actionIconButton: {
    padding: 6,
    borderRadius: 16,
  },
  tweetTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#09090b",
    lineHeight: 21,
    marginBottom: 4,
  },
  tweetCaption: {
    fontSize: 13,
    color: "#52525b",
    lineHeight: 18,
    marginBottom: 10,
  },
  imageWrapper: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f4f4f5",
    marginTop: 6,
    marginBottom: 10,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  typeBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 3,
  },
  tweetFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f4f4f5",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  footerItemText: {
    fontSize: 12,
    color: "#71717a",
    marginLeft: 5,
    fontWeight: "500",
  },
  footerShareButton: {
    marginLeft: "auto",
    padding: 4,
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#09090b",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 18,
  },
});
