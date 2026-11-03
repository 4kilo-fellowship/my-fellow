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
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PagerView, {
  PagerViewOnPageScrollEventData,
} from "react-native-pager-view";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TAB_WIDTH = SCREEN_WIDTH / 2;

export default function Devotions() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const pagerRef = useRef<PagerView>(null);
  const scrollOffset = useRef(new Animated.Value(0)).current;

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
    if (activeTab === index) return;
    try {
      Haptics.selectionAsync();
    } catch {}
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  const handlePageScroll = (e: { nativeEvent: PagerViewOnPageScrollEventData }) => {
    const { position, offset } = e.nativeEvent;
    scrollOffset.setValue(position + offset);
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

  const latestDevotion = devotions.length > 0 ? devotions[0] : null;
  const recentDevotions = devotions.slice(1, 7);
  const popularDevotions = [...devotions]
    .sort((a, b) => (b.views || 0) + (b.likes || 0) * 2 - ((a.views || 0) + (a.likes || 0) * 2))
    .slice(0, 6);

  // Compact Article Card for horizontal scrolls (Recent & Popular)
  const CompactArticleCard = ({ item }: { item: Devotion }) => {
    const isSaved = isDevotionSaved(item._id);

    return (
      <View style={styles.compactCardOuter}>
        <Pressable
          android_ripple={{ color: "rgba(0, 0, 0, 0.05)", foreground: true }}
          style={({ pressed }) => [
            styles.compactCardPressable,
            Platform.OS === "ios" && pressed && { opacity: 0.94 },
          ]}
          onPress={() => router.push(`/devotion/${item._id}`)}
        >
          {/* Card Thumbnail Image */}
          <View style={styles.compactImageWrapper}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.compactImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.compactImagePlaceholder}>
                <Ionicons name="book-outline" size={24} color="#a1a1aa" />
              </View>
            )}

            {/* Bookmark button on top right of thumbnail */}
            <Pressable
              hitSlop={10}
              android_ripple={{
                color: "rgba(0,0,0,0.2)",
                borderless: true,
                radius: 16,
              }}
              style={styles.compactBookmarkBtn}
              onPress={(e) => {
                e.stopPropagation();
                handleToggleSave(item);
              }}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={14}
                color={isSaved ? PRIMARY : "#ffffff"}
              />
            </Pressable>
          </View>

          {/* Article Title */}
          <Text style={styles.compactTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Bottom Row: Author + Date */}
          <View style={styles.compactFooter}>
            <View style={styles.compactAuthorRow}>
              <View style={styles.compactAvatar}>
                <Text style={styles.compactAvatarText}>
                  {item.author?.charAt(0)?.toUpperCase() || "F"}
                </Text>
              </View>
              <Text style={styles.compactAuthorName} numberOfLines={1}>
                {item.author}
              </Text>
            </View>
            <Text style={styles.compactDate} numberOfLines={1}>
              {formatDate(item.date)}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  // Elegant editorial article-style card for fellowship devotions
  const MinimalDevotionCard = ({ item }: { item: Devotion }) => {
    const isSaved = isDevotionSaved(item._id);
    const isRead = isDevotionRead(item._id);

    return (
      <View style={styles.articleCardOuter}>
        <Pressable
          android_ripple={{ color: "rgba(0, 0, 0, 0.04)", foreground: true }}
          style={({ pressed }) => [
            styles.articleCardPressable,
            Platform.OS === "ios" && pressed && { opacity: 0.96, backgroundColor: "#fafafa" },
          ]}
          onPress={() => router.push(`/devotion/${item._id}`)}
        >
          {/* Top Byline: Author monogram + name, fellowship role / badge, date, bookmark */}
          <View style={styles.articleHeader}>
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
                <View style={styles.fellowBadge}>
                  <Text style={styles.fellowBadgeText}>Fellowship</Text>
                </View>
              </View>
              <View style={styles.metaSubRow}>
                <Text style={styles.authorDate}>{formatDate(item.date)}</Text>
                <Text style={styles.authorDot}>·</Text>
                <Text style={styles.readTimeText}>
                  {item.duration || "4 min read"}
                </Text>
                {isRead && (
                  <>
                    <Text style={styles.authorDot}>·</Text>
                    <View style={styles.readBadge}>
                      <Ionicons name="checkmark-done" size={12} color="#10b981" />
                      <Text style={styles.readText}>Read</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Bookmark button */}
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
                size={20}
                color={isSaved ? "#000000" : "#a1a1aa"}
              />
            </Pressable>
          </View>

          {/* Headline & Abstract snippet */}
          <Text style={styles.articleTitle}>{item.title}</Text>
          {item.caption ? (
            <Text style={styles.articleCaption} numberOfLines={2}>
              {item.caption}
            </Text>
          ) : null}

          {/* Clean 16:9 Editorial Cover Image */}
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

          {/* Article Footer: "Read Article" action button + metrics & share */}
          <View style={styles.articleFooter}>
            {/* Direct "Read Article" Call to Action */}
            <View style={styles.readButton}>
              <Text style={styles.readButtonText}>Read Article</Text>
              <Ionicons name="arrow-forward" size={14} color="#000000" />
            </View>

            {/* Right side stats: views, likes, and share */}
            <View style={styles.footerRightActions}>
              <View style={styles.footerStat}>
                <Ionicons name="eye-outline" size={14} color="#a1a1aa" />
                <Text style={styles.footerStatText}>
                  {item.views > 999
                    ? `${(item.views / 1000).toFixed(1)}k`
                    : item.views || 0}
                </Text>
              </View>

              <View style={styles.footerStat}>
                <Ionicons name="heart-outline" size={14} color="#a1a1aa" />
                <Text style={styles.footerStatText}>{item.likes || 0}</Text>
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
                <Ionicons name="share-outline" size={16} color="#71717a" />
              </Pressable>
            </View>
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
          <View style={styles.tabContentCenter}>
            <Text
              style={[
                styles.tabTitleText,
                activeTab === 0 ? styles.tabTitleActive : styles.tabTitleInactive,
              ]}
            >
              All
            </Text>
          </View>
        </Pressable>

        {/* Tab 1: Bookmarks / Saved */}
        <Pressable
          android_ripple={{ color: "rgba(0, 0, 0, 0.06)", foreground: true }}
          style={styles.tabItem}
          onPress={() => handleTabChange(1)}
        >
          <View style={styles.tabContentCenter}>
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
          </View>
        </Pressable>

        {/* Continuous 60fps sliding underline bar tracking gesture & clicks */}
        <Animated.View
          style={[
            styles.animatedIndicator,
            {
              transform: [
                {
                  translateX: scrollOffset.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, TAB_WIDTH],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* Gesture Movement Page View: swipe between All and Saved */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageScroll={handlePageScroll}
        onPageSelected={(e) => {
          const newIndex = e.nativeEvent.position as 0 | 1;
          setActiveTab(newIndex);
          scrollOffset.setValue(newIndex);
        }}
      >
        {/* Page 0: All Devotions (Editorial Magazine / Native Hub) */}
        <View key="all" style={styles.page}>
          {loading && devotions.length === 0 ? (
            <View style={styles.skeletonContainer}>
              <Placeholder
                width="100%"
                height={170}
                borderRadius={20}
                style={{ marginBottom: 20 }}
              />
              <Placeholder
                width="60%"
                height={22}
                borderRadius={6}
                style={{ marginBottom: 14 }}
              />
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
                <Placeholder width={160} height={210} borderRadius={16} />
                <Placeholder width={160} height={210} borderRadius={16} />
              </View>
            </View>
          ) : devotions.length === 0 ? (
            renderEmptyState(false)
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollPageContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={PRIMARY}
                  colors={[PRIMARY]}
                />
              }
            >
              {/* 1. LATEST POST HERO BANNER (Top) */}
              {latestDevotion && (
                <View style={styles.heroOuter}>
                  <Pressable
                    android_ripple={{ color: "rgba(255, 255, 255, 0.15)", foreground: true }}
                    style={({ pressed }) => [
                      styles.heroPressable,
                      Platform.OS === "ios" && pressed && { opacity: 0.94 },
                    ]}
                    onPress={() => router.push(`/devotion/${latestDevotion._id}`)}
                  >
                    {/* Background Artwork */}
                    {latestDevotion.image ? (
                      <Image
                        source={{ uri: latestDevotion.image }}
                        style={styles.heroImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.heroFallbackBg} />
                    )}
                    <View style={styles.heroOverlay} />

                    {/* Content inside Hero */}
                    <View style={styles.heroContent}>
                      <View style={styles.heroTagRow}>
                        <View style={styles.heroBadge}>
                          <Text style={styles.heroBadgeText}>LATEST</Text>
                        </View>
                        <Text style={styles.heroDate}>
                          {formatDate(latestDevotion.date)}
                        </Text>
                      </View>

                      <Text style={styles.heroTitle} numberOfLines={2}>
                        {latestDevotion.title}
                      </Text>

                      <View style={styles.heroFooter}>
                        <View style={styles.heroButton}>
                          <Text style={styles.heroButtonText}>Read more</Text>
                          <Ionicons name="arrow-forward" size={13} color="#000000" />
                        </View>
                        <Text style={styles.heroAuthor} numberOfLines={1}>
                          by {latestDevotion.author}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              )}

              {/* 2. RECENT ARTICLES (Horizontal Scroll) */}
              {recentDevotions.length > 0 && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Articles</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                  >
                    {recentDevotions.map((item) => (
                      <CompactArticleCard key={`recent-${item._id}`} item={item} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* 3. POPULAR DEVOTIONS (Horizontal Scroll / Grid) */}
              {popularDevotions.length > 0 && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Popular Devotions</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                  >
                    {popularDevotions.map((item) => (
                      <CompactArticleCard key={`popular-${item._id}`} item={item} />
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>
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
  // Tab Bar (Twitter/X style with centered labels and full-half active underline indicator)
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
    position: "relative",
  },
  tabContentCenter: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#000000",
  },
  tabTitleInactive: {
    fontWeight: "500",
    color: "#71717a",
  },
  animatedIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: TAB_WIDTH,
    height: 3,
    backgroundColor: "#000000",
  },
  tabBadge: {
    marginLeft: 6,
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 9999,
  },
  tabBadgeActive: {
    backgroundColor: "#000000",
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
    paddingTop: 14,
    paddingBottom: 96,
  },
  scrollPageContent: {
    paddingBottom: 96,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // 1. Hero Banner (Latest Post)
  heroOuter: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 24,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  heroPressable: {
    height: 220,
    position: "relative",
    justifyContent: "flex-end",
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  heroFallbackBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#18181b",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  heroContent: {
    padding: 18,
  },
  heroTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  heroBadge: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  heroBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroDate: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "500",
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 25,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  heroButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 4,
  },
  heroAuthor: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "500",
    maxWidth: 150,
  },
  // Section Headers
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#09090b",
    letterSpacing: -0.3,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  // Compact Vertical Card (Inspiration from screenshot)
  compactCardOuter: {
    width: 175,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eff3f4",
    overflow: "hidden",
  },
  compactCardPressable: {
    padding: 10,
  },
  compactImageWrapper: {
    width: "100%",
    height: 125,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f4f4f5",
    marginBottom: 8,
  },
  compactImage: {
    width: "100%",
    height: "100%",
  },
  compactImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  compactBookmarkBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#09090b",
    lineHeight: 18,
    marginBottom: 8,
    height: 36,
  },
  compactFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 6,
  },
  compactAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  compactAvatarText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#3f3f46",
  },
  compactAuthorName: {
    fontSize: 11,
    color: "#52525b",
    fontWeight: "600",
    flex: 1,
  },
  compactDate: {
    fontSize: 10,
    color: "#a1a1aa",
    fontWeight: "500",
  },
  // Editorial Article-Style Card
  articleCardOuter: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eff3f4",
    overflow: "hidden",
  },
  articleCardPressable: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  authorAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#18181b",
  },
  authorMeta: {
    flex: 1,
    justifyContent: "center",
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#09090b",
    maxWidth: 160,
  },
  fellowBadge: {
    marginLeft: 6,
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  fellowBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#52525b",
    letterSpacing: -0.1,
  },
  metaSubRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorDot: {
    fontSize: 12,
    color: "#a1a1aa",
    marginHorizontal: 4,
  },
  authorDate: {
    fontSize: 12,
    color: "#71717a",
  },
  readTimeText: {
    fontSize: 12,
    color: "#71717a",
    fontWeight: "500",
  },
  readBadge: {
    flexDirection: "row",
    alignItems: "center",
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
  articleTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#09090b",
    lineHeight: 23,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  articleCaption: {
    fontSize: 13.5,
    color: "#52525b",
    lineHeight: 19,
    marginBottom: 12,
  },
  imageWrapper: {
    width: "100%",
    height: 165,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f4f4f5",
    marginBottom: 14,
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
  articleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f4f4f5",
  },
  readButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
    marginRight: 4,
  },
  footerRightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerStat: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  footerStatText: {
    fontSize: 12,
    color: "#71717a",
    marginLeft: 4,
    fontWeight: "500",
  },
  footerShareButton: {
    marginLeft: 14,
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
