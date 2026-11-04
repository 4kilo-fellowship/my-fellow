import { ImageViewerModal } from "@/components/ImageViewerModal";
import { MainTabHeader } from "@/components/MainTabHeader";
import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { StreakModal } from "@/components/StreakModal";
import { LongPressAvatar, closeAvatarPreview } from "@/components/avatar-preview";
import { ProfileLink } from "@/components/profile/ProfileLink";
import { PRIMARY } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { socialApi } from "@/services/socialApi";
import {
  apiPostToCommunityPost,
  CommunityPost,
  useCommunityStore,
} from "@/stores/community.store";
import { useDevotionsStore } from "@/stores/devotions.store";
import { useStreakStore } from "@/stores/streak.store";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ProfileTabKey = "posts" | "media" | "ministry" | "likes" | "account";

interface ProfileTabItem {
  key: ProfileTabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PROFILE_TABS: ProfileTabItem[] = [
  { key: "posts", label: "Reflections", icon: "chatbubble-ellipses-outline" },
  { key: "media", label: "Media", icon: "images-outline" },
  { key: "ministry", label: "Ministry", icon: "flame-outline" },
  { key: "likes", label: "Likes", icon: "heart-outline" },
  { key: "account", label: "Account", icon: "person-circle-outline" },
];

function formatEthiopianPhone(phone?: string) {
  if (!phone) return "";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("09") && cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.startsWith("07") && cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.startsWith("+251") && cleaned.length === 13) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith("251") && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

function formatJoinedDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "Joined Fellowship";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Joined Fellowship";
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `Joined ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { authState, logout, getCurrentUser } = useAuth();
  const { user } = useUserStore();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  // Modals state
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{
    uri: string;
    caption?: string;
    author?: string;
  } | null>(null);

  // Active Tab state (Twitter style: Reflections / Media / Ministry / Likes / Account)
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("posts");
  const [refreshing, setRefreshing] = useState(false);

  // Community Store
  const posts = useCommunityStore((s) => s.posts);
  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const toggleBookmark = useCommunityStore((s) => s.toggleBookmark);
  const fetchUserProfile = useCommunityStore((s) => s.fetchUserProfile);

  // Streak Store
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const syncServerStreak = useStreakStore((s) => s.syncServerStreak);

  // Devotions Store
  const readDevotions = useDevotionsStore((s) => s.readDevotions);
  const readCount = readDevotions.length > 0 ? readDevotions.length : 24;

  // Current Member details from community cache
  const currentMember = useCommunityStore((s) =>
    user?.id ? s.members[user.id] : undefined
  );

  // Fetched author and liked posts from backend
  const [fetchedAuthorPosts, setFetchedAuthorPosts] = useState<CommunityPost[]>([]);
  const [fetchedLikedPosts, setFetchedLikedPosts] = useState<CommunityPost[]>([]);
  const [userMinistries, setUserMinistries] = useState<any[]>([]);

  // Close avatar preview if tab unfocuses or changes
  useFocusEffect(
    useCallback(() => {
      syncServerStreak().catch(() => {});
      return () => {
        closeAvatarPreview();
      };
    }, [syncServerStreak])
  );

  // Refresh user data from API
  const loadProfileData = useCallback(async () => {
    if (!user?.id && !authState.authenticated) return;
    try {
      await getCurrentUser().catch(() => {});
      const userId = user?.id;
      if (userId) {
        await fetchUserProfile(userId).catch(() => {});

        // Fetch author's posts
        socialApi
          .getUserPosts(userId)
          .then((res) => {
            if (Array.isArray(res)) {
              setFetchedAuthorPosts(res.map(apiPostToCommunityPost));
            }
          })
          .catch(() => {});

        // Fetch user's liked posts
        socialApi
          .getUserLikedPosts(userId)
          .then((res) => {
            if (Array.isArray(res)) {
              setFetchedLikedPosts(res.map(apiPostToCommunityPost));
            }
          })
          .catch(() => {});

        // Fetch ministries
        socialApi
          .getUserMinistries(userId)
          .then((res) => {
            if (Array.isArray(res) && res.length > 0) {
              setUserMinistries(res);
            }
          })
          .catch(() => {});
      }
    } catch {
      // Ignore network errors gracefully
    }
  }, [authState.authenticated, fetchUserProfile, getCurrentUser, user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await loadProfileData();
      await syncServerStreak().catch(() => {});
    } finally {
      setRefreshing(false);
    }
  };

  // Merged live author posts (combining fetched + live store state)
  const authorPosts = useMemo(() => {
    const livePostMap = new Map<string, CommunityPost>();
    for (const p of posts) {
      livePostMap.set(p.id, p);
    }

    const merged = new Map<string, CommunityPost>();
    // First include posts from community store where author is current user
    for (const p of posts) {
      if (
        (user?.id && p.authorId === user.id) ||
        (user?.fullName && p.authorName === user.fullName) ||
        (user?.telegramUserName &&
          p.authorHandle?.replace(/^@/, "").toLowerCase() ===
            user.telegramUserName.replace(/^@/, "").toLowerCase())
      ) {
        merged.set(p.id, p);
      }
    }
    // Then merge fetched posts with live state overrides
    for (const p of fetchedAuthorPosts) {
      const live = livePostMap.get(p.id);
      merged.set(p.id, live ? { ...p, ...live } : p);
    }
    return Array.from(merged.values());
  }, [posts, fetchedAuthorPosts, user]);

  // Media posts (author posts that have an image)
  const mediaPosts = useMemo(() => {
    return authorPosts.filter((p) => Boolean(p.image));
  }, [authorPosts]);

  // Liked posts (combining fetched liked posts + live liked posts from community store)
  const likedPosts = useMemo(() => {
    const livePostMap = new Map<string, CommunityPost>();
    for (const p of posts) {
      livePostMap.set(p.id, p);
    }

    const merged = new Map<string, CommunityPost>();
    for (const p of fetchedLikedPosts) {
      const live = livePostMap.get(p.id);
      merged.set(p.id, live ? { ...p, ...live } : p);
    }
    for (const p of posts) {
      if (p.isLiked) {
        merged.set(p.id, p);
      } else if (merged.has(p.id) && !p.isLiked) {
        merged.delete(p.id);
      }
    }
    return Array.from(merged.values());
  }, [fetchedLikedPosts, posts]);

  // Handlers
  const handleSignOut = async () => {
    setSignOutConfirm(false);
    try {
      await logout();
      router.replace("/(auth)/sign-in");
    } catch {
      // ignore
    }
  };

  const handleShareApp = async () => {
    try {
      await Haptics.selectionAsync();
      await Share.share({
        title: "4 Kilo Fellowship",
        message: `Connect with ${user?.fullName || "fellowship member"} on 4 Kilo Christian Students Fellowship! Download the app: https://t.me/ecsf4kilo`,
      });
    } catch {
      // ignore
    }
  };

  const handleTelegramPress = () => {
    const handle =
      user?.telegramUserName || currentMember?.telegramUsername;
    if (!handle) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const clean = handle.replace(/^@/, "");
    const url = `https://t.me/${clean}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
      })
      .catch(() => {});
  };

  const handleThemeChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleTheme();
  };

  // Profile data derivations
  const avatarInitial = user?.fullName
    ? user.fullName.trim().charAt(0).toUpperCase()
    : "M";

  const teamName =
    typeof user?.team === "string"
      ? user.team
      : (user?.team as any)?.name ||
        currentMember?.team ||
        "Fellowship Member";

  const isAssignedTeam =
    Boolean(teamName) && teamName !== "Fellowship Member";

  const department =
    user?.department || currentMember?.department || "Computer Science";
  const academicYear =
    user?.yearOfStudy || currentMember?.academicYear || "3rd Year";
  const formattedPhone =
    formatEthiopianPhone(user?.phoneNumber) || "0900 000 001";
  const telegramHandle = user?.telegramUserName
    ? `@${user.telegramUserName.replace(/^@/, "")}`
    : currentMember?.telegramUsername
    ? `@${currentMember.telegramUsername.replace(/^@/, "")}`
    : "@fellowship_member";

  const connectsCount = currentMember?.followersCount ?? 480;
  const followingCount = currentMember?.followingCount ?? 35;
  const memberBio =
    currentMember?.bio ||
    "Walking with Christ, growing in grace, and serving faithfully at AAU 4 Kilo Fellowship.";
  const joinedDate = formatJoinedDate(user?.createdAt || currentMember?.joinedDate);
  const location = currentMember?.location || "AAU 4 Kilo Campus, Addis Ababa";

  // Palette matching design system
  const bgColor = isDark ? "#09090b" : "#f8fafc";
  const cardBg = isDark ? "#18181b" : "#ffffff";
  const cardBorder = isDark ? "#27272a" : "#e2e8f0";
  const textPrimary = isDark ? "#ffffff" : "#0f172a";
  const textSecondary = isDark ? "#a1a1aa" : "#64748b";
  const textTertiary = isDark ? "#71717a" : "#94a3b8";
  const pillBg = isDark ? "#27272a" : "#f1f5f9";
  const dividerColor = isDark ? "#27272a" : "#f1f5f9";
  const iconMuted = isDark ? "#a1a1aa" : "#475569";

  // Render Twitter-style Reflection Feed Card
  const renderPostCard = (item: CommunityPost) => {
    return (
      <View
        key={item.id}
        style={[
          styles.postCard,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
          },
        ]}
      >
        <View style={styles.postCardRow}>
          {/* Author Avatar with ProfileLink */}
          <ProfileLink
            user={{
              id: item.authorId || user?.id || "me",
              name: item.authorName,
              username: item.authorHandle,
              avatarUrl: item.authorAvatar || user?.profileImage,
              team: item.authorTeam || teamName,
            }}
            size={40}
            showAvatar={true}
          />

          <View style={styles.postBody}>
            {/* Header: Name · Handle · Time */}
            <View style={styles.postAuthorLine}>
              <Text
                style={[styles.postAuthorName, { color: textPrimary }]}
                numberOfLines={1}
              >
                {item.authorName}
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={PRIMARY}
                style={{ marginLeft: 3 }}
              />
              <Text
                style={[styles.postHandleText, { color: textSecondary }]}
                numberOfLines={1}
              >
                {item.authorHandle}
              </Text>
              <Text style={[styles.postTimeText, { color: textTertiary }]}>
                · {item.timestamp}
              </Text>
            </View>

            {/* Post Content */}
            <Pressable
              onPress={() => router.push(`/community/${item.id}` as any)}
            >
              <Text style={[styles.postContentText, { color: textPrimary }]}>
                {item.content}
              </Text>
            </Pressable>

            {/* Attached Photo */}
            {item.image ? (
              <Pressable
                onPress={() =>
                  setLightboxImage({
                    uri: typeof item.image === "string" ? item.image : item.image?.uri,
                    caption: item.content,
                    author: item.authorName,
                  })
                }
                style={styles.postImageWrap}
              >
                <ExpoImage
                  source={
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : item.image
                  }
                  style={styles.postImage}
                  contentFit="cover"
                  transition={200}
                />
              </Pressable>
            ) : null}

            {/* Twitter Action Bar: Reply, Like, Bookmark, Share */}
            <View style={styles.postActionsRow}>
              {/* Reply */}
              <Pressable
                onPress={() => router.push(`/community/${item.id}` as any)}
                hitSlop={6}
                style={styles.postActionBtn}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={16}
                  color={textSecondary}
                />
                <Text style={[styles.postActionCount, { color: textSecondary }]}>
                  {item.repliesCount ?? 0}
                </Text>
              </Pressable>

              {/* Like */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {}
                  );
                  toggleLike(item.id);
                }}
                hitSlop={6}
                style={styles.postActionBtn}
              >
                <Ionicons
                  name={item.isLiked ? "heart" : "heart-outline"}
                  size={17}
                  color={item.isLiked ? "#f91880" : textSecondary}
                />
                <Text
                  style={[
                    styles.postActionCount,
                    { color: item.isLiked ? "#f91880" : textSecondary },
                  ]}
                >
                  {item.likesCount ?? 0}
                </Text>
              </Pressable>

              {/* Bookmark */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {}
                  );
                  toggleBookmark(item.id);
                }}
                hitSlop={6}
                style={styles.postActionBtn}
              >
                <Ionicons
                  name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={16}
                  color={item.isBookmarked ? PRIMARY : textSecondary}
                />
              </Pressable>

              {/* Share */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  Share.share({
                    message: `"${item.content}" — ${item.authorName} on 4 Kilo Fellowship`,
                  });
                }}
                hitSlop={6}
                style={styles.postActionBtn}
              >
                <Ionicons
                  name="share-outline"
                  size={16}
                  color={textSecondary}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render Active Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        if (authorPosts.length === 0) {
          return (
            <View
              style={[
                styles.emptyStateCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={42}
                color={PRIMARY}
              />
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>
                Share Your First Reflection
              </Text>
              <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
                Inspire your fellow campus brothers and sisters by sharing what
                the Lord is ministering to your heart today.
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  router.push("/community/compose" as any);
                }}
                style={[styles.emptyCtaBtn, { backgroundColor: PRIMARY }]}
              >
                <Ionicons name="create-outline" size={17} color="#ffffff" />
                <Text style={styles.emptyCtaText}>Write Reflection</Text>
              </Pressable>
            </View>
          );
        }
        return (
          <View style={styles.postsList}>
            {authorPosts.map(renderPostCard)}
          </View>
        );

      case "media":
        if (mediaPosts.length === 0) {
          return (
            <View
              style={[
                styles.emptyStateCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <Ionicons name="images-outline" size={42} color={PRIMARY} />
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>
                No Fellowship Media Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
                Photos from fellowship gatherings, acoustic worship sessions, and
                campus prayers you share will appear here.
              </Text>
            </View>
          );
        }
        const gridItemSize = (SCREEN_WIDTH - 36) / 3;
        return (
          <View style={styles.mediaGrid}>
            {mediaPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                activeOpacity={0.88}
                onPress={() =>
                  setLightboxImage({
                    uri:
                      typeof post.image === "string"
                        ? post.image
                        : post.image?.uri,
                    caption: post.content,
                    author: post.authorName,
                  })
                }
                style={[
                  styles.mediaGridCell,
                  {
                    width: gridItemSize,
                    height: gridItemSize,
                    backgroundColor: cardBg,
                    borderColor: cardBorder,
                  },
                ]}
              >
                <ExpoImage
                  source={
                    typeof post.image === "string"
                      ? { uri: post.image }
                      : post.image
                  }
                  style={styles.mediaGridImage}
                  contentFit="cover"
                />
                <View style={styles.mediaLikesBadge}>
                  <Ionicons name="heart" size={11} color="#ffffff" />
                  <Text style={styles.mediaLikesText}>{post.likesCount}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case "ministry":
        return (
          <View style={styles.ministryTabWrap}>
            {userMinistries.length > 0 ? (
              userMinistries.map((m: any) => (
                <View
                  key={m.id || m.name}
                  style={[
                    styles.infoCard,
                    { backgroundColor: cardBg, borderColor: cardBorder },
                  ]}
                >
                  <View style={styles.ministryHeaderRow}>
                    <View
                      style={[
                        styles.ministryIconWrap,
                        { backgroundColor: `${PRIMARY}18` },
                      ]}
                    >
                      <Ionicons name="flame" size={20} color={PRIMARY} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.ministryTitle, { color: textPrimary }]}>
                        {m.name}
                      </Text>
                      <Text style={[styles.ministrySub, { color: textSecondary }]}>
                        {m.role || "Active Fellowship Ministry"}
                      </Text>
                    </View>
                  </View>
                  {m.badge ? (
                    <Text
                      style={[
                        styles.teamActionText,
                        { color: PRIMARY, fontWeight: "600" },
                      ]}
                    >
                      {m.badge}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : (
              /* Ministry Team Involvements */
              <View
                style={[
                  styles.infoCard,
                  { backgroundColor: cardBg, borderColor: cardBorder },
                ]}
              >
                <View style={styles.ministryHeaderRow}>
                  <View
                    style={[
                      styles.ministryIconWrap,
                      { backgroundColor: `${PRIMARY}18` },
                    ]}
                  >
                    <Ionicons name="flame" size={20} color={PRIMARY} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ministryTitle, { color: textPrimary }]}>
                      {isAssignedTeam ? teamName : "General Fellowship"}
                    </Text>
                    <Text style={[styles.ministrySub, { color: textSecondary }]}>
                      Active Ministry Assignment
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      router.push("/teams" as any);
                    }}
                    style={styles.teamActionBadge}
                  >
                    <Text style={styles.teamActionText}>
                      {isAssignedTeam ? "View Team" : "Join Team"}
                    </Text>
                    <Ionicons name="chevron-forward" size={13} color={PRIMARY} />
                  </Pressable>
                </View>

                <Text style={[styles.ministryDesc, { color: textSecondary }]}>
                  Serving Christ faithfully at Addis Ababa University (AAU 4 Kilo
                  Campus), participating in fellowship discipleship, prayer, and
                  outreach.
                </Text>
              </View>
            )}

            {/* Weekly Campus Schedule */}
            <View
              style={[
                styles.infoCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <Text style={[styles.sectionHeading, { color: textTertiary }]}>
                WEEKLY CAMPUS GATHERINGS
              </Text>
              <View style={[styles.scheduleRow, { borderBottomColor: dividerColor }]}>
                <Ionicons name="calendar-outline" size={16} color={PRIMARY} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scheduleName, { color: textPrimary }]}>
                    Midweek Campus Prayer
                  </Text>
                  <Text style={[styles.scheduleMeta, { color: textSecondary }]}>
                    Wednesday · 5:30 PM (Sidist Kilo Chapel)
                  </Text>
                </View>
              </View>

              <View style={[styles.scheduleRow, { borderBottomColor: dividerColor }]}>
                <Ionicons name="musical-notes-outline" size={16} color={PRIMARY} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scheduleName, { color: textPrimary }]}>
                    Acoustic Worship & Bible Study
                  </Text>
                  <Text style={[styles.scheduleMeta, { color: textSecondary }]}>
                    Friday · 6:00 PM (4 Kilo Hall)
                  </Text>
                </View>
              </View>

              <View style={[styles.scheduleRow, { borderBottomWidth: 0 }]}>
                <Ionicons name="heart-outline" size={16} color={PRIMARY} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scheduleName, { color: textPrimary }]}>
                    Dormitory Fellowship Circles
                  </Text>
                  <Text style={[styles.scheduleMeta, { color: textSecondary }]}>
                    Sunday Evening · 7:30 PM (Campus Blocks)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      case "likes":
        if (likedPosts.length === 0) {
          return (
            <View
              style={[
                styles.emptyStateCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <Ionicons
                name="heart-dislike-outline"
                size={42}
                color={PRIMARY}
              />
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>
                No Liked Reflections
              </Text>
              <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
                Reflections you like in the fellowship community feed will appear
                here for quick access.
              </Text>
            </View>
          );
        }
        return (
          <View style={styles.postsList}>
            {likedPosts.map(renderPostCard)}
          </View>
        );

      case "account":
        return (
          <View style={styles.accountTabWrap}>
            {/* Preferences & App Settings */}
            <View
              style={[
                styles.menuCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              {/* Dark Theme Native Switch */}
              <View style={[styles.menuItem, { borderBottomColor: dividerColor }]}>
                <View
                  style={[
                    styles.menuItemIcon,
                    { backgroundColor: pillBg, borderColor: cardBorder },
                  ]}
                >
                  <Ionicons
                    name={isDark ? "moon-outline" : "sunny-outline"}
                    size={18}
                    color={iconMuted}
                  />
                </View>
                <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
                  Dark Theme
                </Text>
                <Switch
                  value={isDark}
                  onValueChange={handleThemeChange}
                  thumbColor={
                    Platform.OS === "android"
                      ? isDark
                        ? PRIMARY
                        : "#f4f3f4"
                      : undefined
                  }
                  trackColor={{ false: "#e4e4e7", true: `${PRIMARY}99` }}
                />
              </View>

              {/* Edit Profile */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  router.push("/edit-profile" as any);
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    borderBottomColor: dividerColor,
                    opacity: pressed ? 0.65 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.menuItemIcon,
                    { backgroundColor: pillBg, borderColor: cardBorder },
                  ]}
                >
                  <Ionicons name="create-outline" size={18} color={iconMuted} />
                </View>
                <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
                  Edit Profile Information
                </Text>
                <Ionicons name="chevron-forward" size={18} color={textTertiary} />
              </Pressable>

              {/* Ministry Teams */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  router.push("/teams" as any);
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    borderBottomColor: dividerColor,
                    opacity: pressed ? 0.65 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.menuItemIcon,
                    { backgroundColor: pillBg, borderColor: cardBorder },
                  ]}
                >
                  <Ionicons name="people-outline" size={18} color={iconMuted} />
                </View>
                <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
                  Fellowship Ministry Teams
                </Text>
                <Ionicons name="chevron-forward" size={18} color={textTertiary} />
              </Pressable>

              {/* Settings & Preferences */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  router.push("/settings" as any);
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    borderBottomColor: dividerColor,
                    opacity: pressed ? 0.65 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.menuItemIcon,
                    { backgroundColor: pillBg, borderColor: cardBorder },
                  ]}
                >
                  <Ionicons name="options-outline" size={18} color={iconMuted} />
                </View>
                <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
                  Settings & Preferences
                </Text>
                <Ionicons name="chevron-forward" size={18} color={textTertiary} />
              </Pressable>

              {/* Help & Support */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  router.push("/help" as any);
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    borderBottomColor: dividerColor,
                    opacity: pressed ? 0.65 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.menuItemIcon,
                    { backgroundColor: pillBg, borderColor: cardBorder },
                  ]}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={18}
                    color={iconMuted}
                  />
                </View>
                <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
                  Help & Support
                </Text>
                <Ionicons name="chevron-forward" size={18} color={textTertiary} />
              </Pressable>

              {/* About Fellowship */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  router.push("/about" as any);
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  { borderBottomWidth: 0, opacity: pressed ? 0.65 : 1 },
                ]}
              >
                <View
                  style={[
                    styles.menuItemIcon,
                    { backgroundColor: pillBg, borderColor: cardBorder },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={iconMuted}
                  />
                </View>
                <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
                  About 4 Kilo Fellowship
                </Text>
                <Ionicons name="chevron-forward" size={18} color={textTertiary} />
              </Pressable>
            </View>

            {/* Sign Out Button */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
                setSignOutConfirm(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Sign Out of Account"
              style={({ pressed }) => [
                styles.signOutBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(239, 68, 68, 0.12)"
                    : "#fef2f2",
                  borderColor: isDark
                    ? "rgba(239, 68, 68, 0.3)"
                    : "#fecaca",
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </View>
        );
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* MainTabHeader — Consistent with the application design system */}
      <MainTabHeader
        showAvatar={false}
        showStreak={true}
        showNotification={true}
        borderBottom={false}
        title="Profile"
        rightExtra={
          <View style={styles.headerRightGroup}>
            <Pressable
              hitSlop={8}
              onPress={handleShareApp}
              accessibilityRole="button"
              accessibilityLabel="Share Profile"
              style={({ pressed }) => [
                styles.headerIconBtn,
                {
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                  borderColor: cardBorder,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons
                name="share-social-outline"
                size={18}
                color={iconMuted}
              />
            </Pressable>

            <Pressable
              hitSlop={8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
                router.push("/settings" as any);
              }}
              accessibilityRole="button"
              accessibilityLabel="Settings and Preferences"
              style={({ pressed }) => [
                styles.headerIconBtn,
                {
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                  borderColor: cardBorder,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name="settings-outline" size={18} color={iconMuted} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 110 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
      >
        {/* Cover Hero Banner (Twitter/X style) */}
        <View style={styles.bannerWrap}>
          {currentMember?.banner ? (
            <ExpoImage
              source={
                typeof currentMember.banner === "string"
                  ? { uri: currentMember.banner }
                  : currentMember.banner
              }
              style={styles.bannerImage}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={
                isDark
                  ? ["#2a1409", "#18181b", "#09090b"]
                  : ["#fed7aa", "#ffedd5", "#fff7ed"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerDecorPattern}>
                <Ionicons
                  name="shield-checkmark"
                  size={90}
                  color={isDark ? "rgba(255,103,25,0.08)" : "rgba(255,103,25,0.14)"}
                  style={styles.bannerDecorIcon}
                />
              </View>
            </LinearGradient>
          )}
          <View style={styles.bannerOverlay} />
        </View>

        {/* Profile Overlapping Avatar & Action Buttons Bar */}
        <View style={styles.profileActionRow}>
          {/* Overlapping Avatar with Camera Badge */}
          <View style={styles.avatarWrap}>
            <View
              style={[
                styles.avatarRing,
                {
                  borderColor: bgColor,
                  backgroundColor: bgColor,
                },
              ]}
            >
              {user?.profileImage ? (
                <LongPressAvatar
                  size={80}
                  uri={user.profileImage}
                  name={user?.fullName || "Member"}
                  imageStyle={styles.avatarImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatarFallback,
                    {
                      backgroundColor: isDark ? "#271c19" : "#fff7ed",
                      borderColor: isDark ? "#7c2d12" : "#fed7aa",
                    },
                  ]}
                >
                  <Text style={styles.avatarInitialText}>{avatarInitial}</Text>
                </View>
              )}
            </View>

            {/* Camera Edit Badge */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
                router.push("/edit-profile" as any);
              }}
              accessibilityRole="button"
              accessibilityLabel="Change Profile Photo"
              style={({ pressed }) => [
                styles.avatarCameraBadge,
                { borderColor: bgColor, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name="camera" size={13} color="#ffffff" />
            </Pressable>
          </View>

          {/* Action Buttons: Share, Edit Profile */}
          <View style={styles.topActionBtnsGroup}>
            {/* Share Button (Twitter style) */}
            <Pressable
              onPress={handleShareApp}
              accessibilityRole="button"
              accessibilityLabel="Share Profile"
              style={({ pressed }) => [
                styles.secondaryPillBtn,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons name="share-outline" size={16} color={textPrimary} />
              <Text style={[styles.secondaryPillText, { color: textPrimary }]}>
                Share
              </Text>
            </Pressable>

            {/* Edit Profile Button (Twitter prominent high-contrast pill) */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
                router.push("/edit-profile" as any);
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit Profile"
              style={({ pressed }) => [
                styles.primaryPillBtn,
                {
                  backgroundColor: isDark ? "#27272a" : "#0f172a",
                  borderColor: isDark ? "#3f3f46" : "#0f172a",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={15}
                color={isDark ? "#ffffff" : "#ffffff"}
              />
              <Text
                style={[
                  styles.primaryPillText,
                  { color: isDark ? "#ffffff" : "#ffffff" },
                ]}
              >
                Edit profile
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Member Identity: Name, Handle & Verified Status */}
        <View style={styles.identityContainer}>
          <View style={styles.nameLine}>
            <Text
              style={[styles.displayName, { color: textPrimary }]}
              numberOfLines={1}
            >
              {user?.fullName || "Fellowship Member"}
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={19}
              color={PRIMARY}
              style={{ marginLeft: 5 }}
            />
          </View>

          <Text style={[styles.handleLine, { color: textSecondary }]}>
            {telegramHandle}
          </Text>

          {/* Status Badges Strip: Active Member, Team, Streak */}
          <View style={styles.badgesWrap}>
            {/* Active Member / Admin Status */}
            <View
              style={[
                styles.badgePill,
                isAdmin
                  ? {
                      backgroundColor: isDark ? "rgba(147, 51, 234, 0.15)" : "#faf5ff",
                      borderColor: isDark ? "#7e22ce" : "#d8b4fe",
                    }
                  : {
                      backgroundColor: isDark ? "#052e16" : "#f0fdf4",
                      borderColor: isDark ? "#14532d" : "#bbf7d0",
                    },
              ]}
            >
              <View
                style={[
                  styles.greenDot,
                  isAdmin && { backgroundColor: "#a855f7" },
                ]}
              />
              <Text
                style={[
                  styles.badgePillText,
                  isAdmin
                    ? { color: isDark ? "#c084fc" : "#7e22ce" }
                    : { color: isDark ? "#4ade80" : "#16a34a" },
                ]}
              >
                {user?.role === "super_admin"
                  ? "Super Admin"
                  : user?.role === "admin"
                  ? "Admin"
                  : user?.role === "leader"
                  ? "Leader"
                  : "Active Member"}
              </Text>
            </View>

            {/* Fellowship Team */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push("/teams" as any);
              }}
              style={[
                styles.badgePill,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 103, 25, 0.12)"
                    : "#fff7ed",
                  borderColor: `${PRIMARY}40`,
                },
              ]}
            >
              <Ionicons name="heart" size={11} color={PRIMARY} />
              <Text style={[styles.badgePillText, { color: PRIMARY }]}>
                {isAssignedTeam ? teamName : "General Fellowship"}
              </Text>
            </Pressable>

            {/* Streak Badge */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
                setStreakModalVisible(true);
              }}
              style={[
                styles.badgePill,
                {
                  backgroundColor: isDark ? "#451a03" : "#fff7ed",
                  borderColor: isDark ? "#7c2d12" : "#fed7aa",
                },
              ]}
            >
              <Ionicons name="flame" size={12} color="#f97316" />
              <Text
                style={[
                  styles.badgePillText,
                  { color: "#f97316", fontWeight: "700" },
                ]}
              >
                {currentStreak}d Streak
              </Text>
            </Pressable>
          </View>

          {/* Bio */}
          <Text style={[styles.bioText, { color: textPrimary }]}>
            {memberBio}
          </Text>

          {/* Twitter-Inspired Metadata Strip with Icons */}
          <View style={styles.metadataList}>
            {/* Ministry Team & Department */}
            <View style={styles.metaRow}>
              <Ionicons name="briefcase-outline" size={14} color={iconMuted} />
              <Text style={[styles.metaText, { color: textSecondary }]}>
                {teamName} · {department}
              </Text>
            </View>

            {/* Academic Year */}
            <View style={styles.metaRow}>
              <Ionicons name="school-outline" size={14} color={iconMuted} />
              <Text style={[styles.metaText, { color: textSecondary }]}>
                Academic Year: {academicYear}
              </Text>
            </View>

            {/* Campus Location */}
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={iconMuted} />
              <Text style={[styles.metaText, { color: textSecondary }]}>
                {location}
              </Text>
            </View>

            {/* Joined Date */}
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color={iconMuted} />
              <Text style={[styles.metaText, { color: textSecondary }]}>
                {joinedDate}
              </Text>
            </View>

            {/* Telegram Deep Link */}
            {telegramHandle && (
              <Pressable onPress={handleTelegramPress} style={styles.metaRow}>
                <Ionicons name="paper-plane" size={13} color={PRIMARY} />
                <Text
                  style={[
                    styles.metaText,
                    { color: PRIMARY, fontWeight: "600" },
                  ]}
                >
                  {telegramHandle}
                </Text>
                <Ionicons name="open-outline" size={12} color={PRIMARY} />
              </Pressable>
            )}

            {/* Ethiopian Phone */}
            <View style={styles.metaRow}>
              <Ionicons name="call-outline" size={13} color={iconMuted} />
              <Text style={[styles.metaText, { color: textSecondary }]}>
                {formattedPhone}
              </Text>
            </View>
          </View>

          {/* Twitter Social & Devotional Stats Row */}
          <View style={styles.statsStripRow}>
            {/* Following */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push({
                  pathname: "/community/user/connections",
                  params: {
                    id: user?.id,
                    initialTab: "following",
                    name: user?.fullName,
                  },
                } as any);
              }}
              style={styles.statCounterItem}
            >
              <Text style={[styles.statBold, { color: textPrimary }]}>
                {followingCount}
              </Text>
              <Text style={[styles.statMuted, { color: textSecondary }]}>
                Following
              </Text>
            </Pressable>

            {/* Followers / Connects */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push({
                  pathname: "/community/user/connections",
                  params: {
                    id: user?.id,
                    initialTab: "followers",
                    name: user?.fullName,
                  },
                } as any);
              }}
              style={styles.statCounterItem}
            >
              <Text style={[styles.statBold, { color: textPrimary }]}>
                {connectsCount}
              </Text>
              <Text style={[styles.statMuted, { color: textSecondary }]}>
                Followers
              </Text>
            </Pressable>

            {/* Reflections */}
            <Pressable
              onPress={() => setActiveTab("posts")}
              style={styles.statCounterItem}
            >
              <Text style={[styles.statBold, { color: textPrimary }]}>
                {authorPosts.length}
              </Text>
              <Text style={[styles.statMuted, { color: textSecondary }]}>
                Reflections
              </Text>
            </Pressable>

            {/* Devotions Completed */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
                router.push("/(tabs)/devotions" as any);
              }}
              style={styles.statCounterItem}
            >
              <Text style={[styles.statBold, { color: textPrimary }]}>
                {readCount}
              </Text>
              <Text style={[styles.statMuted, { color: textSecondary }]}>
                Devotions
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Twitter Sub-Navigation Tab Bar */}
        <View
          style={[
            styles.tabsBarWrap,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {PROFILE_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setActiveTab(tab.key);
                  }}
                  style={[
                    styles.tabButton,
                    isActive && styles.tabButtonActive,
                  ]}
                >
                  <View style={styles.tabContentRow}>
                    <Ionicons
                      name={tab.icon}
                      size={15}
                      color={isActive ? PRIMARY : textTertiary}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={[
                        styles.tabLabelText,
                        {
                          color: isActive ? textPrimary : textTertiary,
                          fontWeight: isActive ? "800" : "600",
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </View>
                  {isActive && (
                    <View
                      style={[
                        styles.activeTabIndicator,
                        { backgroundColor: PRIMARY },
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Active Tab View Body */}
        <View style={styles.tabBodyWrap}>{renderTabContent()}</View>
      </ScrollView>

      {/* Floating Action Button (Twitter style: Write Reflection) */}
      {activeTab === "posts" && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
              () => {}
            );
            router.push("/community/compose" as any);
          }}
          accessibilityRole="button"
          accessibilityLabel="Compose New Reflection"
          style={({ pressed }) => [
            styles.floatingComposeBtn,
            {
              backgroundColor: PRIMARY,
              bottom: insets.bottom + 75,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name="add" size={26} color="#ffffff" />
        </Pressable>
      )}

      {/* Full Resolution Image Lightbox Modal */}
      <ImageViewerModal
        visible={Boolean(lightboxImage)}
        imageUri={lightboxImage?.uri || null}
        caption={lightboxImage?.caption}
        authorName={lightboxImage?.author}
        onClose={() => setLightboxImage(null)}
      />

      {/* Day Streak Modal */}
      <StreakModal
        visible={streakModalVisible}
        onClose={() => setStreakModalVisible(false)}
      />

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        visible={signOutConfirm}
        onClose={() => setSignOutConfirm(false)}
        isDark={isDark}
        icon="log-out-outline"
        iconColor="#ef4444"
        title="Sign Out"
        description="Are you sure you want to sign out of your 4 Kilo Fellowship account on this device?"
        buttons={[
          {
            label: "Sign Out",
            onPress: handleSignOut,
            variant: "danger",
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerWrap: {
    width: SCREEN_WIDTH,
    height: 140,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerGradient: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  bannerDecorPattern: {
    ...StyleSheet.absoluteFill,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 24,
  },
  bannerDecorIcon: {
    transform: [{ rotate: "15deg" }],
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  profileActionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -40,
    marginBottom: 8,
    zIndex: 10,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialText: {
    fontSize: 32,
    fontWeight: "800",
    color: PRIMARY,
  },
  avatarCameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  topActionBtnsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 4,
  },
  secondaryPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
  },
  secondaryPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  primaryPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
  },
  primaryPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  identityContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  displayName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  handleLine: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 1,
  },
  badgesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    marginTop: 4,
    marginBottom: 10,
  },
  metadataList: {
    gap: 6,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "500",
  },
  statsStripRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  statCounterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statBold: {
    fontSize: 14,
    fontWeight: "800",
  },
  statMuted: {
    fontSize: 13,
    fontWeight: "500",
  },
  tabsBarWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 6,
  },
  tabsScroll: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    position: "relative",
    alignItems: "center",
  },
  tabButtonActive: {},
  tabContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabLabelText: {
    fontSize: 14,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 1.5,
  },
  tabBodyWrap: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  postsList: {
    gap: 12,
  },
  postCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  postCardRow: {
    flexDirection: "row",
    gap: 12,
  },
  postBody: {
    flex: 1,
  },
  postAuthorLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: "700",
  },
  postHandleText: {
    fontSize: 12,
    marginLeft: 4,
  },
  postTimeText: {
    fontSize: 12,
    marginLeft: 2,
  },
  postContentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    marginBottom: 10,
  },
  postImageWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
    aspectRatio: 16 / 9,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  postActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 16,
    paddingTop: 2,
  },
  postActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  postActionCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyStateCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    textAlign: "center",
    gap: 8,
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyCtaText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  mediaGridCell: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 0.5,
  },
  mediaGridImage: {
    width: "100%",
    height: "100%",
  },
  mediaLikesBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mediaLikesText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  ministryTabWrap: {
    gap: 12,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ministryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ministryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ministryTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  ministrySub: {
    fontSize: 12,
    fontWeight: "500",
  },
  teamActionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: `${PRIMARY}14`,
  },
  teamActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: PRIMARY,
  },
  ministryDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scheduleName: {
    fontSize: 13,
    fontWeight: "700",
  },
  scheduleMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  accountTabWrap: {
    gap: 14,
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
  },
  signOutText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "700",
  },
  floatingComposeBtn: {
    position: "absolute",
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
    zIndex: 20,
  },
});
