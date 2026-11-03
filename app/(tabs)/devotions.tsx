import { MainTabHeader, Placeholder } from "@/components";
import { DevotionWriterModal } from "@/components/DevotionWriterModal";
import { PRIMARY } from "@/constants";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { devotionsService } from "@/services/devotionsService";
import { devotionWriterService, WriterRequest } from "@/services/devotionWriterService";
import { useDevotionsStore } from "@/stores/devotions.store";
import { Devotion } from "@/types/devotion.types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PagerView, {
  PagerViewOnPageScrollEventData,
} from "react-native-pager-view";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TAB_WIDTH = SCREEN_WIDTH / 2;

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

const formatViews = (views?: number, formatted?: string) => {
  if (formatted) return formatted;
  const count = views ?? 0;
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return count > 0 ? `${count}` : "5.5k";
};

const formatDuration = (item: Devotion) => {
  if (item.duration) return item.duration;
  if (item.content) {
    const words = item.content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 150));
    return `0${minutes}:00`.slice(-5);
  }
  return "01:40";
};

const isNewDevotion = (dateStr?: string) => {
  if (!dateStr) return true;
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return isNaN(diffDays) || diffDays <= 30;
  } catch {
    return true;
  }
};

interface CompactArticleCardProps {
  item: Devotion;
  isSaved: boolean;
  onPress: () => void;
  onToggleSave: () => void;
}

// Compact Video / Devotional Card (Matching user reference UI, memoized)
const CompactArticleCard = React.memo<CompactArticleCardProps>(
  ({ item, isSaved, onPress, onToggleSave }) => {
    const isNew = isNewDevotion(item.date);

    return (
      <View style={styles.compactCardOuter}>
        <Pressable
          android_ripple={{ color: "rgba(0, 0, 0, 0.05)", foreground: true }}
          style={({ pressed }) => [
            styles.compactCardPressable,
            Platform.OS === "ios" && pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
          ]}
          onPress={onPress}
        >
          {/* Card Thumbnail Image with Screenshot-accurate Overlays */}
          <View style={styles.compactImageWrapper}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.compactImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.compactImagePlaceholder}>
                <Ionicons name="book-outline" size={32} color="#a1a1aa" />
              </View>
            )}

            {/* Subtle bottom shadow overlay for time readability */}
            <View style={styles.compactImageOverlay} />

            {/* Top-Right Badge: "New" (Sage Green Pill matching reference) */}
            {isNew && (
              <View style={styles.compactNewBadge}>
                <Text style={styles.compactNewText}>New</Text>
              </View>
            )}

            {/* Center: White Play Button Icon */}
            <View style={styles.compactCenterPlay}>
              <Ionicons
                name="play"
                size={26}
                color="#ffffff"
                style={{ marginLeft: 3 }}
              />
            </View>

            {/* Bottom-Left: Duration Badge ("01:40") */}
            <View style={styles.compactDurationBadge}>
              <Text style={styles.compactDurationText}>
                {formatDuration(item)}
              </Text>
            </View>
          </View>

          {/* Article Info Container */}
          <View style={styles.compactBody}>
            {/* Title (2 lines bold, exactly like screenshot) */}
            <Text style={styles.compactTitle} numberOfLines={2}>
              {item.title}
            </Text>

            {/* Author Name ("Eddie Yong") */}
            <Text style={styles.compactAuthor} numberOfLines={1}>
              {item.author || "Fellowship"}
            </Text>

            {/* Bottom Row: Eye icon + views count ("👁 5.5k") & Bookmark Button */}
            <View style={styles.compactFooterRow}>
              <View style={styles.compactViewsRow}>
                <Ionicons name="eye-outline" size={15} color="#8a8a93" />
                <Text style={styles.compactViewsText}>
                  {formatViews(item.views, item.viewsFormatted)}
                </Text>
              </View>

              <Pressable
                hitSlop={8}
                android_ripple={{
                  color: "rgba(255, 103, 25, 0.2)",
                  borderless: true,
                  radius: 14,
                }}
                style={styles.compactBookmarkBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleSave();
                }}
                accessibilityRole="button"
                accessibilityLabel={isSaved ? "Remove from saved" : "Save devotion"}
              >
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={16}
                  color={isSaved ? PRIMARY : "#a1a1aa"}
                />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </View>
    );
  },
);
CompactArticleCard.displayName = "CompactArticleCard";

interface MinimalDevotionCardProps {
  item: Devotion;
  isSaved: boolean;
  isRead: boolean;
  onPress: () => void;
  onToggleSave: () => void;
  onShare: () => void;
}

// Elegant editorial article-style card for fellowship devotions (memoized)
const MinimalDevotionCard = React.memo<MinimalDevotionCardProps>(
  ({ item, isSaved, isRead, onPress, onToggleSave, onShare }) => {
    return (
      <View style={styles.articleCardOuter}>
        <Pressable
          android_ripple={{ color: "rgba(0, 0, 0, 0.04)", foreground: true }}
          style={({ pressed }) => [
            styles.articleCardPressable,
            Platform.OS === "ios" && pressed && { opacity: 0.96, backgroundColor: "#fafafa" },
          ]}
          onPress={onPress}
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
                onToggleSave();
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
                  onShare();
                }}
              >
                <Ionicons name="share-outline" size={16} color="#71717a" />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </View>
    );
  },
);
MinimalDevotionCard.displayName = "MinimalDevotionCard";

export default function Devotions() {
  const insets = useSafeAreaInsets();
  const isAdmin = useIsAdmin();
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const pagerRef = useRef<PagerView>(null);
  const scrollOffset = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [devotions, setDevotions] = useState<Devotion[]>([]);
  const [writerModalVisible, setWriterModalVisible] = useState(false);
  const [myWriterRequest, setMyWriterRequest] = useState<WriterRequest | null>(null);

  useEffect(() => {
    devotionWriterService.getMyApplication().then((res) => {
      if (res) setMyWriterRequest(res);
    }).catch(() => {});
  }, []);

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

  const onRefresh = useCallback(() => {
    fetchDevotions(true);
  }, [fetchDevotions]);

  const handleTabChange = useCallback(
    (index: 0 | 1) => {
      if (activeTab === index) return;
      try {
        Haptics.selectionAsync();
      } catch {}
      setActiveTab(index);
      Animated.spring(scrollOffset, {
        toValue: index,
        useNativeDriver: false,
        friction: 8,
        tension: 70,
      }).start();
      pagerRef.current?.setPage(index);
    },
    [activeTab, scrollOffset],
  );

  const handlePageScroll = useCallback(
    (e: { nativeEvent: PagerViewOnPageScrollEventData }) => {
      const { position, offset } = e.nativeEvent;
      const progress = position + offset;
      scrollOffset.setValue(progress);

      // Fast threshold: update tab highlights smoothly as soon as swipe crosses 50%
      const targetTab = progress >= 0.5 ? 1 : 0;
      setActiveTab((prev) => (prev !== targetTab ? targetTab : prev));
    },
    [scrollOffset],
  );

  const handlePageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const newIndex = (e.nativeEvent.position === 1 ? 1 : 0) as 0 | 1;
      setActiveTab(newIndex);
      scrollOffset.setValue(newIndex);
    },
    [scrollOffset],
  );

  const handleToggleSave = useCallback(
    (item: Devotion) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      if (isDevotionSaved(item._id)) {
        unsaveDevotion(item._id);
      } else {
        saveDevotion(item);
      }
    },
    [isDevotionSaved, saveDevotion, unsaveDevotion],
  );

  const handleShare = useCallback(async (item: Devotion) => {
    try {
      await Share.share({
        message: `Check out this devotion: ${item.title} by ${item.author}\n\nRead more on My Fellow app!`,
        url: item.image,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  }, []);

  const latestDevotion = useMemo(() => (devotions.length > 0 ? devotions[0] : null), [devotions]);
  const recentDevotions = useMemo(() => devotions.slice(1, 7), [devotions]);
  const popularDevotions = useMemo(
    () =>
      [...devotions]
        .sort((a, b) => (b.views || 0) + (b.likes || 0) * 2 - ((a.views || 0) + (a.likes || 0) * 2))
        .slice(0, 6),
    [devotions],
  );

  const renderSavedItem = useCallback(
    ({ item }: { item: Devotion }) => (
      <MinimalDevotionCard
        item={item}
        isSaved={isDevotionSaved(item._id)}
        isRead={isDevotionRead(item._id)}
        onPress={() => router.push(`/devotion/${item._id}`)}
        onToggleSave={() => handleToggleSave(item)}
        onShare={() => handleShare(item)}
      />
    ),
    [isDevotionSaved, isDevotionRead, handleToggleSave, handleShare],
  );

  const savedEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="bookmark-outline" size={36} color="#a1a1aa" />
        </View>
        <Text style={styles.emptyTitle}>No saved devotions</Text>
        <Text style={styles.emptySubtitle}>
          Tap the bookmark icon on any devotion to save it here for later.
        </Text>
      </View>
    ),
    [],
  );

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
      <MainTabHeader
        borderBottom={true}
        title="Devotions"
        showStreak={true}
      />

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
                    extrapolate: "clamp",
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
        onPageSelected={handlePageSelected}
        overScrollMode="never"
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
              {/* 1. LATEST DEVOTION HERO (Top) */}
              {latestDevotion && (
                <View style={styles.heroOuter}>
                  <Pressable
                    android_ripple={{ color: "rgba(0, 0, 0, 0.04)", foreground: true }}
                    style={({ pressed }) => [
                      styles.heroPressable,
                      Platform.OS === "ios" && pressed && { opacity: 0.94 },
                    ]}
                    onPress={() => router.push(`/devotion/${latestDevotion._id}`)}
                  >
                    {/* Clean Image with only LATEST badge on it */}
                    <View style={styles.heroImageContainer}>
                      {latestDevotion.image ? (
                        <Image
                          source={{ uri: latestDevotion.image }}
                          style={styles.heroImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.heroFallbackBg} />
                      )}
                      <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>LATEST</Text>
                      </View>
                    </View>

                    {/* Content below image */}
                    <View style={styles.heroContent}>
                      <Text style={styles.heroTitle} numberOfLines={2}>
                        {latestDevotion.title}
                      </Text>

                      <View style={styles.heroFooter}>
                        <View style={styles.heroAuthorRow}>
                          <View style={styles.heroAuthorAvatar}>
                            <Text style={styles.heroAuthorAvatarText}>
                              {latestDevotion.author?.charAt(0)?.toUpperCase() || "F"}
                            </Text>
                          </View>
                          <Text style={styles.heroAuthor} numberOfLines={1}>
                            {latestDevotion.author}
                          </Text>
                          <Text style={styles.heroDot}>·</Text>
                          <Text style={styles.heroDate}>
                            {formatDate(latestDevotion.date)}
                          </Text>
                        </View>

                        <View style={styles.heroButton}>
                          <Text style={styles.heroButtonText}>Read</Text>
                          <Ionicons name="arrow-forward" size={12} color="#000000" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </View>
              )}

              {/* 2. RECENT DEVOTIONS (Horizontal Scroll) */}
              {recentDevotions.length > 0 && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Devotions</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                    nestedScrollEnabled={true}
                    overScrollMode="never"
                  >
                    {recentDevotions.map((item: Devotion) => (
                      <CompactArticleCard
                        key={`recent-${item._id}`}
                        item={item}
                        isSaved={isDevotionSaved(item._id)}
                        onPress={() => router.push(`/devotion/${item._id}`)}
                        onToggleSave={() => handleToggleSave(item)}
                      />
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
                    nestedScrollEnabled={true}
                    overScrollMode="never"
                  >
                    {popularDevotions.map((item: Devotion) => (
                      <CompactArticleCard
                        key={`popular-${item._id}`}
                        item={item}
                        isSaved={isDevotionSaved(item._id)}
                        onPress={() => router.push(`/devotion/${item._id}`)}
                        onToggleSave={() => handleToggleSave(item)}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* 4. CTA: Apply to Write */}
              <View style={styles.ctaContainer}>
                <View style={styles.ctaIconCircle}>
                  <Ionicons name="create-outline" size={24} color="#52525b" />
                </View>
                <Text style={styles.ctaTitle}>Want to Share Your Faith?</Text>
                <Text style={styles.ctaSubtitle}>
                  Share your devotional insights and encourage the fellowship
                  community through writing.
                </Text>
                <Pressable
                  android_ripple={{
                    color: "rgba(255, 255, 255, 0.25)",
                    foreground: true,
                  }}
                  style={({ pressed }) => [
                    styles.ctaButton,
                    Platform.OS === "ios" &&
                      pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setWriterModalVisible(true);
                  }}
                >
                  <Ionicons
                    name={
                      myWriterRequest?.status === "pending"
                        ? "time-outline"
                        : myWriterRequest?.status === "approved"
                        ? "checkmark-circle-outline"
                        : "create-outline"
                    }
                    size={18}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.ctaButtonText}>
                    {myWriterRequest?.status === "pending"
                      ? "Application Pending"
                      : myWriterRequest?.status === "approved"
                      ? "Writer Status Active"
                      : "Apply to Write"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Page 1: Saved Bookmarks */}
        <View key="saved" style={styles.page}>
          <FlatList
            data={savedDevotions}
            keyExtractor={(item) => item._id}
            renderItem={renderSavedItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={PRIMARY}
                colors={[PRIMARY]}
              />
            }
            ListEmptyComponent={savedEmptyComponent}
          />
        </View>
      </PagerView>

      {/* Floating Action Button (+) — Admin Only for Devotion Creation (Like in Community Tab) */}
      {isAdmin && (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            router.push("/devotion/manage");
          }}
          accessibilityRole="button"
          accessibilityLabel="Create Devotion"
          style={[
            styles.fabBtn,
            {
              backgroundColor: PRIMARY,
              bottom: Math.max(insets.bottom, 12) + 28,
            },
          ]}
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Devotion Writer Application Modal */}
      <DevotionWriterModal
        visible={writerModalVisible}
        onClose={() => setWriterModalVisible(false)}
        existingRequest={myWriterRequest}
        onSuccess={(newReq) => setMyWriterRequest(newReq)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  fabBtn: {
    position: "absolute",
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
    zIndex: 50,
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
    paddingBottom: 240,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // 1. Hero Banner (Latest Devotion)
  heroOuter: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eff3f4",
    overflow: "hidden",
  },
  heroPressable: {
    width: "100%",
  },
  heroImageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
    backgroundColor: "#f4f4f5",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroFallbackBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#18181b",
  },
  heroBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: PRIMARY,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroContent: {
    padding: 14,
  },
  heroTitle: {
    color: "#09090b",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  heroAuthorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  heroAuthorAvatarText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3f3f46",
  },
  heroAuthor: {
    color: "#3f3f46",
    fontSize: 12,
    fontWeight: "600",
    maxWidth: 130,
  },
  heroDot: {
    fontSize: 12,
    color: "#a1a1aa",
    marginHorizontal: 5,
  },
  heroDate: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "500",
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  heroButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 4,
  },
  // Section Headers
  sectionContainer: {
    marginBottom: 28,
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
    paddingBottom: 8,
  },
  // Compact Video / Devotional Card (Matching user reference UI)
  compactCardOuter: {
    width: 216,
    overflow: "visible",
  },
  compactCardPressable: {
    width: "100%",
  },
  compactImageWrapper: {
    width: "100%",
    height: 190,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#e4e4e7",
  },
  compactImage: {
    width: "100%",
    height: "100%",
  },
  compactImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f5",
  },
  compactImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
  },
  compactNewBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#8da672",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  compactNewText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  compactCenterPlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -18,
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  compactDurationBadge: {
    position: "absolute",
    bottom: 9,
    left: 9,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  compactDurationText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  compactBody: {
    width: "100%",
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  compactTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#18181b",
    lineHeight: 19,
    marginBottom: 4,
    minHeight: 38,
  },
  compactAuthor: {
    fontSize: 13,
    color: "#71717a",
    fontWeight: "500",
    marginBottom: 6,
  },
  compactFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  compactViewsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  compactViewsText: {
    fontSize: 12,
    color: "#71717a",
    fontWeight: "500",
  },
  compactBookmarkBtn: {
    padding: 3,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
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
  // CTA Section
  ctaContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  ctaIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#09090b",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
    maxWidth: 260,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  ctaButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
