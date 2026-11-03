import { AppBottomSheet } from "@/components/AppBottomSheet";
import { ImageViewerModal } from "@/components/ImageViewerModal";
import { MainTabHeader } from "@/components/MainTabHeader";
import { ProfileLink } from "@/components/profile/ProfileLink";
import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import {
  CommunityPost,
  useCommunityStore,
} from "@/stores/community.store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView, {
  PagerViewOnPageScrollEventData,
} from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TAB_WIDTH = SCREEN_WIDTH / 2;

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const posts = useCommunityStore((s) => s.posts);
  const forYouPosts = useCommunityStore((s) => s.forYouPosts);
  const followingPosts = useCommunityStore((s) => s.followingPosts);
  const isForYouLoading = useCommunityStore((s) => s.isForYouLoading);
  const isFollowingLoading = useCommunityStore((s) => s.isFollowingLoading);
  const hasMoreForYou = useCommunityStore((s) => s.hasMoreForYou);
  const hasMoreFollowing = useCommunityStore((s) => s.hasMoreFollowing);
  const feedType = useCommunityStore((s) => s.feedType);
  const setFeedType = useCommunityStore((s) => s.setFeedType);
  const fetchFeed = useCommunityStore((s) => s.fetchFeed);
  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const toggleRepost = useCommunityStore((s) => s.toggleRepost);
  const toggleBookmark = useCommunityStore((s) => s.toggleBookmark);

  const [activeTab, setActiveTab] = useState<0 | 1>(feedType === "following" ? 1 : 0);
  const activeTabRef = useRef<0 | 1>(feedType === "following" ? 1 : 0);
  const pagerRef = useRef<PagerView>(null);
  const scrollOffset = useRef(new Animated.Value(feedType === "following" ? 1 : 0)).current;

  const [refreshingForYou, setRefreshingForYou] = useState<boolean>(false);
  const [refreshingFollowing, setRefreshingFollowing] = useState<boolean>(false);
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFeed("foryou", true);
    fetchFeed("following", true);
  }, [fetchFeed]);

  // Three-dots bottom sheet state
  const [activePostForSheet, setActivePostForSheet] = useState<CommunityPost | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Fullscreen image viewer state
  const [lightboxImage, setLightboxImage] = useState<{
    uri: any;
    caption?: string;
    author?: string;
  } | null>(null);

  const onRefreshForYou = useCallback(async () => {
    setRefreshingForYou(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    await fetchFeed("foryou", true);
    setRefreshingForYou(false);
  }, [fetchFeed]);

  const onRefreshFollowing = useCallback(async () => {
    setRefreshingFollowing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    await fetchFeed("following", true);
    setRefreshingFollowing(false);
  }, [fetchFeed]);

  const handleTabPress = (index: 0 | 1) => {
    if (activeTab === index) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    activeTabRef.current = index;
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  const handlePageScroll = (e: { nativeEvent: PagerViewOnPageScrollEventData }) => {
    const { position, offset } = e.nativeEvent;
    const progress = position + offset;
    scrollOffset.setValue(progress);

    // Responsive symmetrical midpoint switch (switches text right at 50% swipe)
    const targetTab = progress >= 0.5 ? 1 : 0;
    if (activeTabRef.current !== targetTab) {
      activeTabRef.current = targetTab;
      setActiveTab(targetTab);
    }
  };

  const handlePageSelected = (e: any) => {
    const newIndex = e.nativeEvent.position as 0 | 1;
    activeTabRef.current = newIndex;
    setActiveTab(newIndex);
    scrollOffset.setValue(newIndex);
    const type = newIndex === 0 ? "foryou" : "following";
    setFeedType(type);
    fetchFeed(type, false);
  };

  const handleToggleLike = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    toggleLike(id);
  };

  const handleToggleRepost = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {}
    toggleRepost(id);
  };

  const handleToggleBookmark = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    toggleBookmark(id);
  };

  const handleShare = async (post: CommunityPost) => {
    try {
      Haptics.selectionAsync().catch(() => {});
      await Share.share({
        message: `${post.content}\n\n— ${post.authorName} (${post.authorHandle}) on 4 Kilo Fellowship`,
      });
    } catch {
      // ignore
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedPostIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const textColor = isDark ? "#e7e9ea" : "#0f1419";
  const mutedColor = isDark ? "#71767b" : "#536471";
  const borderColor = isDark ? "#27272a" : "#eff3f4";
  const bg = isDark ? "#000000" : "#ffffff";

  // Helper to render styled tweet text with highlighted hashtags, mentions, and primary "Show more"
  const renderFormattedText = (text: string, isExpanded: boolean, postId: string) => {
    const isLong = text.length > 240;
    const displayText = isLong && !isExpanded ? text.slice(0, 240) + "..." : text;
    const words = displayText.split(/(\s+)/);

    return (
      <Text style={[styles.postText, { color: textColor }]}>
        {words.map((word, idx) => {
          if (
            word.startsWith("@") ||
            word.startsWith("#") ||
            word.startsWith("http") ||
            word.startsWith("youtu.be")
          ) {
            return (
              <Text key={idx} style={{ color: PRIMARY, fontWeight: "600" }}>
                {word}
              </Text>
            );
          }
          return word;
        })}
        {isLong && (
          <Text
            onPress={() => toggleExpand(postId)}
            style={{ color: PRIMARY, fontWeight: "700" }}
          >
            {isExpanded ? " Show less" : " Show more"}
          </Text>
        )}
      </Text>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Main Tab Header */}
      <MainTabHeader borderBottom={false} />

      {/* Native Pill Search Bar */}
      <View
        style={[
          styles.searchBarContainer,
          {
            backgroundColor: bg,
          },
        ]}
      >
        <View
          style={[
            styles.searchPillWrapper,
            {
              backgroundColor: isDark ? "#202327" : "#f0f2f5",
            },
          ]}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              router.push("/community/search");
            }}
            accessibilityRole="button"
            accessibilityLabel="Search"
            android_ripple={{
              color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
              borderless: false,
            }}
            style={({ pressed }) => [
              styles.searchPressableInner,
              pressed && Platform.OS === "ios" && { opacity: 0.7 },
            ]}
          >
            <View style={styles.searchCenterContent}>
              <Ionicons
                name="search-outline"
                size={19}
                color={isDark ? "#8e9196" : "#5f6368"}
                style={styles.searchIcon}
              />
              <Text
                style={[
                  styles.searchCenteredText,
                  { color: isDark ? "#8e9196" : "#5f6368" },
                ]}
              >
                Search
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Feed Tabs: For you / Following */}
      <View style={[styles.tabsHeader, { borderBottomColor: borderColor, backgroundColor: bg }]}>
        <Pressable
          onPress={() => handleTabPress(0)}
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
            foreground: true,
          }}
          style={({ pressed }) => [
            styles.feedTabBtn,
            pressed && Platform.OS === "ios" && { opacity: 0.7 },
          ]}
        >
          <View style={styles.tabContentCenter}>
            <Text
              style={[
                styles.feedTabText,
                {
                  color: activeTab === 0 ? textColor : mutedColor,
                  fontWeight: activeTab === 0 ? "700" : "500",
                },
              ]}
            >
              For you
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => handleTabPress(1)}
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
            foreground: true,
          }}
          style={({ pressed }) => [
            styles.feedTabBtn,
            pressed && Platform.OS === "ios" && { opacity: 0.7 },
          ]}
        >
          <View style={styles.tabContentCenter}>
            <Text
              style={[
                styles.feedTabText,
                {
                  color: activeTab === 1 ? textColor : mutedColor,
                  fontWeight: activeTab === 1 ? "700" : "500",
                },
              ]}
            >
              Following
            </Text>
          </View>
        </Pressable>

        {/* Continuous 60fps sliding underline bar covering half of the bar (black in light, white in dark) */}
        <Animated.View
          style={[
            styles.animatedIndicator,
            {
              backgroundColor: isDark ? "#ffffff" : "#000000",
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

      {/* Gesture Movement Page View: swipe between For you and Following */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageScroll={handlePageScroll}
        onPageSelected={handlePageSelected}
      >
        {/* Page 0: For you */}
        <View key="foryou" style={styles.page}>
          <FlatList
            data={forYouPosts && forYouPosts.length > 0 ? forYouPosts : posts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 100,
              flexGrow: 1,
            }}
            onEndReached={() => {
              if (!isForYouLoading && hasMoreForYou) {
                fetchFeed("foryou", false);
              }
            }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isForYouLoading && (forYouPosts?.length > 0 || posts.length > 0) ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <ActivityIndicator color={PRIMARY} size="small" />
                </View>
              ) : undefined
            }
            ListEmptyComponent={
              !isForYouLoading ? (
                <View
                  style={{
                    paddingVertical: 60,
                    alignItems: "center",
                    paddingHorizontal: 32,
                  }}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={44}
                    color={mutedColor}
                  />
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 16,
                      fontWeight: "600",
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    No reflections yet
                  </Text>
                  <Text
                    style={{
                      color: mutedColor,
                      fontSize: 13,
                      textAlign: "center",
                      marginTop: 6,
                      lineHeight: 18,
                    }}
                  >
                    Be the first to share an encouragement or prayer with the fellowship!
                  </Text>
                </View>
              ) : undefined
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshingForYou}
                onRefresh={onRefreshForYou}
                tintColor={PRIMARY}
                colors={[PRIMARY]}
              />
            }
            renderItem={({ item }) => {
              const isExpanded = !!expandedPostIds[item.id];

              return (
                <View
                  style={[
                    styles.tweetRow,
                    {
                      borderBottomColor: borderColor,
                    },
                  ]}
                >
                  {/* Left Column: Author Avatar -> Navigates to Member Profile */}
                  <View style={styles.tweetAvatarWrap}>
                    <ProfileLink
                      user={{
                        id: item.authorId || "user-fellowship",
                        name: item.authorName,
                        username: item.authorHandle,
                        avatarUrl: item.authorAvatar,
                      }}
                      size={42}
                    />
                  </View>

                  {/* Right Column: Tweet Content & Actions */}
                  <View style={styles.tweetBodyCol}>
                    {/* Header: Author Name, Verified Badge, Handle, Middot, Time, More */}
                    <View style={styles.tweetHeaderRow}>
                      <ProfileLink
                        user={{
                          id: item.authorId || "user-fellowship",
                          name: item.authorName,
                          username: item.authorHandle,
                          avatarUrl: item.authorAvatar,
                        }}
                        showAvatar={false}
                        style={styles.tweetAuthorInfo}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.tweetAuthorName,
                            { color: isDark ? "#f7f9f9" : "#0f1419" },
                          ]}
                        >
                          {item.authorName}
                        </Text>

                        {item.isVerified && (
                          <Ionicons
                            name="checkmark-circle"
                            size={15}
                            color={PRIMARY}
                            style={{ marginLeft: 3 }}
                          />
                        )}

                        <Text
                          numberOfLines={1}
                          style={[styles.tweetHandle, { color: mutedColor }]}
                        >
                          {item.authorHandle}
                        </Text>

                        <Text style={[styles.tweetMiddot, { color: mutedColor }]}>
                          ·
                        </Text>

                        <Text style={[styles.tweetTime, { color: mutedColor }]}>
                          {item.timestamp}
                        </Text>
                      </ProfileLink>

                      {/* Three-dots Menu Trigger */}
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setActivePostForSheet(item);
                          setSheetVisible(true);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.tweetMoreBtn}
                      >
                        <Ionicons
                          name="ellipsis-horizontal"
                          size={16}
                          color={mutedColor}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Body Content -> Navigates to Post Details */}
                    <TouchableOpacity
                      activeOpacity={0.96}
                      onPress={() => {
                        router.push(`/community/${item.id}` as any);
                      }}
                      style={styles.tweetContentWrap}
                    >
                      {renderFormattedText(item.content, isExpanded, item.id)}
                    </TouchableOpacity>

                    {/* Attached Image -> Opens Lightbox */}
                    {item.image && (
                      <TouchableOpacity
                        activeOpacity={0.92}
                        onPress={() =>
                          setLightboxImage({
                            uri: item.image,
                            caption: item.content,
                            author: item.authorName,
                          })
                        }
                        style={[
                          styles.tweetMediaCard,
                          {
                            borderColor: isDark ? "#27272a" : "#e2e8f0",
                            backgroundColor: isDark ? "#18181b" : "#f8fafc",
                          },
                        ]}
                      >
                        <Image
                          source={
                            typeof item.image === "string"
                              ? { uri: item.image }
                              : item.image
                          }
                          style={styles.tweetMediaImg}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    )}

                    {/* Action Row: Reply, Repost, Like, Bookmark */}
                    <View style={styles.tweetActionBar}>
                      {/* Reply / Comment */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => {});
                          router.push(`/community/${item.id}` as any);
                        }}
                        style={styles.tweetActionBtn}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={17}
                          color={mutedColor}
                        />
                        <Text
                          style={[styles.tweetActionCount, { color: mutedColor }]}
                        >
                          {item.repliesCount}
                        </Text>
                      </TouchableOpacity>

                      {/* Repost */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleToggleRepost(item.id)}
                        style={styles.tweetActionBtn}
                      >
                        <Ionicons
                          name="repeat-outline"
                          size={19}
                          color={item.isReposted ? "#00ba7c" : mutedColor}
                        />
                        <Text
                          style={[
                            styles.tweetActionCount,
                            {
                              color: item.isReposted ? "#00ba7c" : mutedColor,
                              fontWeight: item.isReposted ? "700" : "500",
                            },
                          ]}
                        >
                          {item.repostsCount}
                        </Text>
                      </TouchableOpacity>

                      {/* Like */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleToggleLike(item.id)}
                        style={styles.tweetActionBtn}
                      >
                        <Ionicons
                          name={item.isLiked ? "heart" : "heart-outline"}
                          size={18}
                          color={item.isLiked ? "#f91880" : mutedColor}
                        />
                        <Text
                          style={[
                            styles.tweetActionCount,
                            {
                              color: item.isLiked ? "#f91880" : mutedColor,
                              fontWeight: item.isLiked ? "700" : "500",
                            },
                          ]}
                        >
                          {item.likesCount}
                        </Text>
                      </TouchableOpacity>

                      {/* Bookmark */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleToggleBookmark(item.id)}
                        style={styles.tweetActionBtn}
                      >
                        <Ionicons
                          name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                          size={18}
                          color={item.isBookmarked ? PRIMARY : mutedColor}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </View>

        {/* Page 1: Following */}
        <View key="following" style={styles.page}>
          <FlatList
            data={followingPosts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 100,
              flexGrow: 1,
            }}
            onEndReached={() => {
              if (!isFollowingLoading && hasMoreFollowing) {
                fetchFeed("following", false);
              }
            }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isFollowingLoading && followingPosts?.length > 0 ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <ActivityIndicator color={PRIMARY} size="small" />
                </View>
              ) : undefined
            }
            ListEmptyComponent={
              !isFollowingLoading ? (
                <View
                  style={{
                    paddingVertical: 60,
                    alignItems: "center",
                    paddingHorizontal: 32,
                  }}
                >
                  <Ionicons
                    name="people-outline"
                    size={44}
                    color={mutedColor}
                  />
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 16,
                      fontWeight: "600",
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    No reflections from connects yet
                  </Text>
                  <Text
                    style={{
                      color: mutedColor,
                      fontSize: 13,
                      textAlign: "center",
                      marginTop: 6,
                      lineHeight: 18,
                    }}
                  >
                    Follow fellow students to see their campus prayers and reflections here.
                  </Text>
                </View>
              ) : undefined
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshingFollowing}
                onRefresh={onRefreshFollowing}
                tintColor={PRIMARY}
                colors={[PRIMARY]}
              />
            }
            renderItem={({ item }) => {
              const isExpanded = !!expandedPostIds[item.id];

              return (
                <View
                  style={[
                    styles.tweetRow,
                    {
                      borderBottomColor: borderColor,
                    },
                  ]}
                >
                  {/* Left Column: Author Avatar -> Navigates to Member Profile */}
                  <View style={styles.tweetAvatarWrap}>
                    <ProfileLink
                      user={{
                        id: item.authorId || "user-fellowship",
                        name: item.authorName,
                        username: item.authorHandle,
                        avatarUrl: item.authorAvatar,
                      }}
                      size={42}
                    />
                  </View>

                  {/* Right Column: Tweet Content & Actions */}
                  <View style={styles.tweetBodyCol}>
                    {/* Header: Author Name, Verified Badge, Handle, Middot, Time, More */}
                    <View style={styles.tweetHeaderRow}>
                      <ProfileLink
                        user={{
                          id: item.authorId || "user-fellowship",
                          name: item.authorName,
                          username: item.authorHandle,
                          avatarUrl: item.authorAvatar,
                        }}
                        showAvatar={false}
                        style={styles.tweetAuthorInfo}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.tweetAuthorName,
                            { color: isDark ? "#f7f9f9" : "#0f1419" },
                          ]}
                        >
                          {item.authorName}
                        </Text>

                        {item.isVerified && (
                          <Ionicons
                            name="checkmark-circle"
                            size={15}
                            color={PRIMARY}
                            style={{ marginLeft: 3 }}
                          />
                        )}

                        <Text
                          numberOfLines={1}
                          style={[styles.tweetHandle, { color: mutedColor }]}
                        >
                          {item.authorHandle}
                        </Text>

                        <Text style={[styles.tweetMiddot, { color: mutedColor }]}>
                          ·
                        </Text>

                        <Text style={[styles.tweetTime, { color: mutedColor }]}>
                          {item.timestamp}
                        </Text>
                      </ProfileLink>

                      {/* Three-dots Menu Trigger */}
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setActivePostForSheet(item);
                          setSheetVisible(true);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.tweetMoreBtn}
                      >
                        <Ionicons
                          name="ellipsis-horizontal"
                          size={16}
                          color={mutedColor}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Body Content -> Navigates to Post Details */}
                    <TouchableOpacity
                      activeOpacity={0.96}
                      onPress={() => {
                        router.push(`/community/${item.id}` as any);
                      }}
                      style={styles.tweetContentWrap}
                    >
                      {renderFormattedText(item.content, isExpanded, item.id)}
                    </TouchableOpacity>

                    {/* Attached Image -> Opens Lightbox */}
                    {item.image && (
                      <TouchableOpacity
                        activeOpacity={0.92}
                        onPress={() =>
                          setLightboxImage({
                            uri: item.image,
                            caption: item.content,
                            author: item.authorName,
                          })
                        }
                        style={[
                          styles.tweetMediaCard,
                          {
                            borderColor: isDark ? "#27272a" : "#e2e8f0",
                            backgroundColor: isDark ? "#18181b" : "#f8fafc",
                          },
                        ]}
                      >
                        <Image
                          source={
                            typeof item.image === "string"
                              ? { uri: item.image }
                              : item.image
                          }
                          style={styles.tweetMediaImg}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    )}

                    {/* Action Row: Reply, Repost, Like, Bookmark */}
                    <View style={styles.tweetActionBar}>
                      {/* Reply / Comment */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => {});
                          router.push(`/community/${item.id}` as any);
                        }}
                        style={styles.tweetActionBtn}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={17}
                          color={mutedColor}
                        />
                        <Text
                          style={[styles.tweetActionCount, { color: mutedColor }]}
                        >
                          {item.repliesCount}
                        </Text>
                      </TouchableOpacity>

                      {/* Repost */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleToggleRepost(item.id)}
                        style={styles.tweetActionBtn}
                      >
                        <Ionicons
                          name="repeat-outline"
                          size={19}
                          color={item.isReposted ? "#00ba7c" : mutedColor}
                        />
                        <Text
                          style={[
                            styles.tweetActionCount,
                            {
                              color: item.isReposted ? "#00ba7c" : mutedColor,
                              fontWeight: item.isReposted ? "700" : "500",
                            },
                          ]}
                        >
                          {item.repostsCount}
                        </Text>
                      </TouchableOpacity>

                      {/* Like */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleToggleLike(item.id)}
                        style={styles.tweetActionBtn}
                      >
                        <Ionicons
                          name={item.isLiked ? "heart" : "heart-outline"}
                          size={18}
                          color={item.isLiked ? "#f91880" : mutedColor}
                        />
                        <Text
                          style={[
                            styles.tweetActionCount,
                            {
                              color: item.isLiked ? "#f91880" : mutedColor,
                              fontWeight: item.isLiked ? "700" : "500",
                            },
                          ]}
                        >
                          {item.likesCount}
                        </Text>
                      </TouchableOpacity>

                      {/* Bookmark */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleToggleBookmark(item.id)}
                        style={styles.tweetActionBtn}
                      >
                        <Ionicons
                          name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                          size={18}
                          color={item.isBookmarked ? PRIMARY : mutedColor}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </PagerView>

      {/* Floating Action Button (+) — Fellowship Primary Orange Circle */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          router.push("/community/compose");
        }}
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

      {/* Three-dots Actions Native Bottom Sheet */}
      <AppBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        isDark={isDark}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          {activePostForSheet && (
            <View style={styles.sheetHeader}>
              <Text numberOfLines={1} style={[styles.sheetPostAuthor, { color: textColor }]}>
                {activePostForSheet.authorName}’s Post
              </Text>
              <Text numberOfLines={1} style={[styles.sheetSnippet, { color: mutedColor }]}>
                {activePostForSheet.content}
              </Text>
            </View>
          )}

          {/* Sheet Actions List */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSheetVisible(false);
              if (activePostForSheet) handleShare(activePostForSheet);
            }}
            style={styles.sheetActionItem}
          >
            <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#f1f5f9" }]}>
              <Ionicons name="share-social-outline" size={20} color={PRIMARY} />
            </View>
            <Text style={[styles.sheetActionLabel, { color: textColor }]}>Share post via...</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSheetVisible(false);
              if (activePostForSheet) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                Alert.alert("Link Copied", "Post link copied to clipboard!");
              }
            }}
            style={styles.sheetActionItem}
          >
            <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#f1f5f9" }]}>
              <Ionicons name="link-outline" size={20} color={PRIMARY} />
            </View>
            <Text style={[styles.sheetActionLabel, { color: textColor }]}>Copy link to post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSheetVisible(false);
              if (activePostForSheet) {
                router.push({
                  pathname: "/community/user/[id]",
                  params: {
                    id: activePostForSheet.authorId || "user-fellowship",
                    name: activePostForSheet.authorName,
                    username: activePostForSheet.authorHandle,
                    avatar:
                      typeof activePostForSheet.authorAvatar === "string"
                        ? activePostForSheet.authorAvatar
                        : "",
                  },
                } as any);
              }
            }}
            style={styles.sheetActionItem}
          >
            <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#f1f5f9" }]}>
              <Ionicons name="person-circle-outline" size={20} color={PRIMARY} />
            </View>
            <Text style={[styles.sheetActionLabel, { color: textColor }]}>View author profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (activePostForSheet) {
                handleToggleBookmark(activePostForSheet.id);
                setSheetVisible(false);
              }
            }}
            style={styles.sheetActionItem}
          >
            <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#f1f5f9" }]}>
              <Ionicons
                name={activePostForSheet?.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={PRIMARY}
              />
            </View>
            <Text style={[styles.sheetActionLabel, { color: textColor }]}>
              {activePostForSheet?.isBookmarked ? "Remove from Bookmarks" : "Save to Bookmarks"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSheetVisible(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
              Alert.alert(
                "Report Submitted",
                "Thank you for notifying fellowship leaders. Our ministry team will review this shortly."
              );
            }}
            style={styles.sheetActionItem}
          >
            <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#fef2f2" }]}>
              <Ionicons name="flag-outline" size={20} color="#ef4444" />
            </View>
            <Text style={[styles.sheetActionLabel, { color: "#ef4444" }]}>Report post to leaders</Text>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>

      {/* Fullscreen Image Lightbox */}
      <ImageViewerModal
        visible={!!lightboxImage}
        imageUri={lightboxImage?.uri}
        caption={lightboxImage?.caption}
        authorName={lightboxImage?.author}
        onClose={() => setLightboxImage(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  searchPillWrapper: {
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  searchPressableInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  searchCenterContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchIcon: {
    marginRight: 8,
    marginTop: Platform.OS === "android" ? 1 : 0,
  },
  searchCenteredText: {
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.2,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  tabsHeader: {
    flexDirection: "row",
    width: SCREEN_WIDTH,
    height: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    position: "relative",
  },
  feedTabBtn: {
    width: TAB_WIDTH,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabContentCenter: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  feedTabText: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  animatedIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: TAB_WIDTH,
    height: 3,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  tweetRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tweetAvatarWrap: {
    marginRight: 12,
  },
  tweetAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e2e8f0",
  },
  tweetBodyCol: {
    flex: 1,
  },
  tweetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tweetAuthorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "nowrap",
  },
  tweetAuthorName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    maxWidth: 125,
  },
  tweetHandle: {
    fontSize: 14,
    marginLeft: 4,
    maxWidth: 90,
  },
  tweetMiddot: {
    marginHorizontal: 4,
    fontSize: 14,
  },
  tweetTime: {
    fontSize: 14,
  },
  tweetMoreBtn: {
    paddingLeft: 6,
    paddingVertical: 2,
  },
  tweetContentWrap: {
    marginTop: 3,
  },
  postText: {
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  tweetMediaCard: {
    marginTop: 10,
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  tweetMediaImg: {
    width: "100%",
    height: "100%",
  },
  tweetActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingRight: 12,
  },
  tweetActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tweetActionCount: {
    fontSize: 13,
    fontWeight: "500",
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
  sheetContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    paddingBottom: 14,
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  sheetPostAuthor: {
    fontSize: 16,
    fontWeight: "700",
  },
  sheetSnippet: {
    fontSize: 13,
    marginTop: 4,
  },
  sheetActionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 14,
  },
  sheetActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetActionLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
