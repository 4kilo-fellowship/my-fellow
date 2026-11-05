import { ImageViewerModal } from "@/components/ImageViewerModal";
import { MainTabHeader } from "@/components/MainTabHeader";
import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { StreakModal } from "@/components/StreakModal";
import { LongPressAvatar, closeAvatarPreview } from "@/components/avatar-preview";
import { ProfileLink } from "@/components/profile/ProfileLink";
import { PRIMARY } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { authService } from "@/services/authService";
import { socialApi } from "@/services/socialApi";
import {
  apiPostToCommunityPost,
  CommunityPost,
  useCommunityStore,
} from "@/stores/community.store";
import { useDevotionsStore } from "@/stores/devotions.store";
import { useProgramsStore } from "@/stores/programs.store";
import { useStreakStore } from "@/stores/streak.store";
import { useTeamsStore } from "@/stores/teams.store";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBar, TabView } from "react-native-tab-view";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const TAB_ROUTES = [
  { key: "posts", title: "Reflections" },
  { key: "media", title: "Media" },
  { key: "ministry", title: "Ministry" },
  { key: "likes", title: "Likes" },
  { key: "account", title: "Account" },
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
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
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
  const { user, setUser } = useUserStore();
  const router = useRouter();

  // Tab View state (react-native-tab-view)
  const [tabIndex, setTabIndex] = useState(0);

  // Modals state
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{
    uri: string;
    caption?: string;
    author?: string;
  } | null>(null);

  // Image Sheet state for native bottom sheet image selection
  const [imageSheetTarget, setImageSheetTarget] = useState<"avatar" | "banner" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localBanner, setLocalBanner] = useState<string | null>(null);

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
  const readCount = readDevotions.length;

  // Programs Store (Weekly Campus Gatherings)
  const programs = useProgramsStore((s) => s.programs);
  const loadPrograms = useProgramsStore((s) => s.loadPrograms);

  // Teams Store (Ministry Teams)
  const teams = useTeamsStore((s) => s.teams);
  const loadTeams = useTeamsStore((s) => s.loadTeams);

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
      // Dynamically load active campus programs and teams
      loadPrograms().catch(() => {});
      loadTeams().catch(() => {});
    } catch {
      // Ignore network errors gracefully
    }
  }, [authState.authenticated, fetchUserProfile, getCurrentUser, loadPrograms, loadTeams, user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await Promise.allSettled([
        loadProfileData(),
        syncServerStreak(),
        loadPrograms(true),
        loadTeams(true),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Image Selection Handler (Camera or Gallery with strict Aspect Ratio handling)
  const handlePickImage = async (
    target: "avatar" | "banner",
    source: "camera" | "library"
  ) => {
    try {
      setImageSheetTarget(null);

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Permission Required",
            text2: "Camera access is needed to capture photos.",
          });
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Permission Required",
            text2: "Media library access is needed to select photos.",
          });
          return;
        }
      }

      // Senior engineer aspect ratio standard: 1:1 for Avatar, 3:1 for Banner
      const aspect: [number, number] = target === "avatar" ? [1, 1] : [3, 1];
      const launchFn =
        source === "camera"
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;

      const result = await launchFn({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect,
        quality: 0.85,
      });

      if (result.canceled || !result.assets || !result.assets[0]?.uri) {
        return;
      }

      const pickedUri = result.assets[0].uri;
      setIsUploading(true);

      if (target === "avatar") {
        // Optimistic preview
        if (user) {
          setUser({ ...user, profileImage: pickedUri });
        }
        try {
          const updated = await authService.updateProfile({
            profileImage: pickedUri,
          });
          setUser(updated);
          Toast.show({
            type: "success",
            text1: "Profile Photo Updated",
            text2: "Your new avatar has been saved successfully.",
          });
        } catch (err: any) {
          Toast.show({
            type: "error",
            text1: "Upload Failed",
            text2: err.message || "Failed to save profile photo.",
          });
        }
      } else {
        // Banner update
        setLocalBanner(pickedUri);
        try {
          const uploaded = await socialApi.uploadMediaFile(pickedUri, "cover");
          if (uploaded.assetId) {
            await api.patch("/v1/me/profile", {
              coverAssetId: uploaded.assetId,
            });
          }
          if (user) {
            setUser({ ...user, coverImage: uploaded.url || pickedUri });
          }
          if (user?.id) {
            useCommunityStore.setState((state) => {
              const member = state.members[user.id];
              if (member) {
                return {
                  members: {
                    ...state.members,
                    [user.id]: {
                      ...member,
                      banner: uploaded.url || pickedUri,
                    },
                  },
                };
              }
              return state;
            });
          }
          Toast.show({
            type: "success",
            text1: "Banner Updated",
            text2: "Your fellowship profile banner has been saved.",
          });
        } catch (err: any) {
          Toast.show({
            type: "error",
            text1: "Upload Failed",
            text2: err.message || "Could not update cover banner.",
          });
        }
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Image Selection Error",
        text2: err.message || "Something went wrong.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Merged live author posts (combining fetched + live store state)
  const authorPosts = useMemo(() => {
    const livePostMap = new Map<string, CommunityPost>();
    for (const p of posts) {
      livePostMap.set(p.id, p);
    }

    const merged = new Map<string, CommunityPost>();
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

  // Profile data derivations (completely dynamic - zero hardcoded data)
  const avatarInitial = (
    user?.fullName?.trim() ||
    currentMember?.fullName?.trim() ||
    user?.username?.trim() ||
    "?"
  )
    .replace(/^@/, "")
    .charAt(0)
    .toUpperCase() || "?";

  const teamName =
    typeof user?.team === "string"
      ? user.team
      : (user?.team as any)?.name ||
        currentMember?.team ||
        "";

  const isAssignedTeam = Boolean(teamName);

  const department =
    user?.department?.trim() || currentMember?.department?.trim() || "";

  const academicYear =
    user?.yearOfStudy?.trim() || currentMember?.academicYear?.trim() || "";

  const formattedPhone = formatEthiopianPhone(user?.phoneNumber) || "";

  const systemHandle = user?.username
    ? `@${user.username.replace(/^@/, "")}`
    : currentMember?.handle
    ? (currentMember.handle.startsWith("@")
        ? currentMember.handle
        : `@${currentMember.handle}`)
    : user?.telegramUserName
    ? `@${user.telegramUserName.replace(/^@/, "")}`
    : user?.fullName
    ? `@${user.fullName.toLowerCase().replace(/[^a-z0-9_]/g, "")}`
    : "";

  const telegramHandle = user?.telegramUserName
    ? `@${user.telegramUserName.replace(/^@/, "")}`
    : currentMember?.telegramUsername
    ? `@${currentMember.telegramUsername.replace(/^@/, "")}`
    : undefined;

  const connectsCount = currentMember?.followersCount ?? 0;
  const followingCount = currentMember?.followingCount ?? 0;
  const memberBio =
    currentMember?.bio?.trim() || (user as any)?.bio?.trim() || "";
  const joinedDate = formatJoinedDate(user?.createdAt || currentMember?.joinedDate);
  const location =
    currentMember?.location?.trim() || (user as any)?.location?.trim() || "";

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

  const bannerUri =
    localBanner || user?.coverImage || currentMember?.banner || null;

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

            <Pressable
              onPress={() => router.push(`/community/${item.id}` as any)}
            >
              <Text style={[styles.postContentText, { color: textPrimary }]}>
                {item.content}
              </Text>
            </Pressable>

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

            <View style={styles.postActionsRow}>
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

  // Pager Tab Views
  const renderPostsTab = () => {
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
    return <View style={styles.postsList}>{authorPosts.map(renderPostCard)}</View>;
  };

  const renderMediaTab = () => {
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
            Photos and images you share with your reflections will appear here.
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
  };

  const renderMinistryTab = () => {
    const matchingTeam = teams.find(
      (t) =>
        (teamName && t.name.toLowerCase() === teamName.toLowerCase()) ||
        t.id === teamName ||
        (t as any)._id === teamName
    );

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
              {m.description ? (
                <Text style={[styles.ministryDesc, { color: textSecondary }]}>
                  {m.description}
                </Text>
              ) : null}
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
        ) : isAssignedTeam ? (
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
                  {teamName}
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
                <Text style={styles.teamActionText}>View Team</Text>
                <Ionicons name="chevron-forward" size={13} color={PRIMARY} />
              </Pressable>
            </View>

            {matchingTeam?.description || matchingTeam?.about ? (
              <Text style={[styles.ministryDesc, { color: textSecondary }]}>
                {matchingTeam.description || matchingTeam.about}
              </Text>
            ) : null}

            {matchingTeam?.meetingDay ? (
              <View style={[styles.scheduleRow, { borderBottomWidth: 0, paddingTop: 4 }]}>
                <Ionicons name="time-outline" size={14} color={PRIMARY} />
                <Text style={[styles.scheduleMeta, { color: textSecondary }]}>
                  Team Meeting: {matchingTeam.meetingDay}
                  {matchingTeam.time ? ` · ${matchingTeam.time}` : ""}
                  {matchingTeam.location ? ` (${matchingTeam.location})` : ""}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
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
                <Ionicons name="people-outline" size={20} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ministryTitle, { color: textPrimary }]}>
                  Ministry Teams
                </Text>
                <Text style={[styles.ministrySub, { color: textSecondary }]}>
                  Not yet assigned to a team
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  router.push("/teams" as any);
                }}
                style={styles.teamActionBadge}
              >
                <Text style={styles.teamActionText}>Join Team</Text>
                <Ionicons name="chevron-forward" size={13} color={PRIMARY} />
              </Pressable>
            </View>

            <Text style={[styles.ministryDesc, { color: textSecondary }]}>
              Join a ministry team to serve alongside fellowship brothers and sisters in prayer, worship, discipleship, and campus outreach.
            </Text>
          </View>
        )}

        {/* Dynamic Campus Gatherings & Programs */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text style={[styles.sectionHeading, { color: textTertiary, marginBottom: 0 }]}>
              CAMPUS GATHERINGS & PROGRAMS
            </Text>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push("/programs" as any);
              }}
              hitSlop={8}
            >
              <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: "600" }}>
                See All
              </Text>
            </Pressable>
          </View>

          {programs.length > 0 ? (
            programs.map((prog, index) => {
              const isLast = index === programs.length - 1;
              const isPrayer = prog.category?.toLowerCase().includes("prayer") || prog.title?.toLowerCase().includes("prayer");
              const isWorship = prog.category?.toLowerCase().includes("worship") || prog.title?.toLowerCase().includes("worship");
              const iconName = isPrayer ? "calendar-outline" : isWorship ? "musical-notes-outline" : "flame-outline";

              return (
                <Pressable
                  key={prog.id || index}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    router.push(`/programs/${prog.id}` as any);
                  }}
                  style={[
                    styles.scheduleRow,
                    {
                      borderBottomColor: dividerColor,
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <Ionicons name={iconName} size={16} color={PRIMARY} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scheduleName, { color: textPrimary }]}>
                      {prog.title}
                    </Text>
                    <Text style={[styles.scheduleMeta, { color: textSecondary }]}>
                      {prog.day ? `${prog.day}` : ""}
                      {prog.time ? ` · ${prog.time}` : ""}
                      {prog.location ? ` (${prog.location})` : ""}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={textTertiary} />
                </Pressable>
              );
            })
          ) : (
            <Text style={[styles.scheduleMeta, { color: textSecondary, paddingVertical: 6 }]}>
              No campus gatherings scheduled at this time.
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderLikesTab = () => {
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
    return <View style={styles.postsList}>{likedPosts.map(renderPostCard)}</View>;
  };

  const renderAccountTab = () => {
    return (
      <View style={styles.accountTabWrap}>
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
  };

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "posts":
        return renderPostsTab();
      case "media":
        return renderMediaTab();
      case "ministry":
        return renderMinistryTab();
      case "likes":
        return renderLikesTab();
      case "account":
        return renderAccountTab();
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      scrollEnabled
      tabStyle={styles.tabBarItem}
      indicatorStyle={{
        backgroundColor: PRIMARY,
        height: 3,
        borderRadius: 1.5,
      }}
      style={[
        styles.tabBarStyle,
        {
          backgroundColor: cardBg,
          borderBottomColor: cardBorder,
          borderTopColor: cardBorder,
        },
      ]}
      activeColor={textPrimary}
      inactiveColor={textTertiary}
      labelStyle={styles.tabBarLabel}
      pressColor={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}
    />
  );

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* MainTabHeader — Notification on left, centered title, settings on right */}
      <MainTabHeader
        showAvatar={false}
        showStreak={false}
        showNotification={true}
        notificationPosition="left"
        showSettings={true}
        borderBottom={false}
        title="Profile"
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
        {/* Cover Hero Banner with Doom Color Fallback & Edit Cover Button */}
        <View style={styles.bannerWrap}>
          {bannerUri ? (
            <ExpoImage
              source={typeof bannerUri === "string" ? { uri: bannerUri } : bannerUri}
              style={styles.bannerImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            /* Solid Doom Color showing nothing has been selected */
            <View
              style={[
                styles.bannerEmptyDoom,
                { backgroundColor: isDark ? "#18181b" : "#cbd5e1" },
              ]}
            />
          )}

          <View style={styles.bannerOverlay} />

          {/* Floating 'Edit Cover' Button on Banner */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {}
              );
              setImageSheetTarget("banner");
            }}
            accessibilityRole="button"
            accessibilityLabel="Change profile header banner"
            style={({ pressed }) => [
              styles.bannerEditBtn,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Ionicons name="camera-outline" size={14} color="#ffffff" />
            <Text style={styles.bannerEditText}>Edit cover</Text>
          </Pressable>

          {/* Uploading Status Overlay */}
          {isUploading && (
            <View style={styles.bannerLoadingOverlay}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.bannerLoadingText}>Saving photo...</Text>
            </View>
          )}
        </View>

        {/* Profile Overlapping Avatar & Action Buttons Bar */}
        <View style={styles.profileActionRow}>
          {/* Overlapping Avatar with Click-to-Edit Photo Action */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {}
              );
              setImageSheetTarget("avatar");
            }}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            style={styles.avatarWrap}
          >
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
            <View style={[styles.avatarCameraBadge, { borderColor: bgColor }]}>
              <Ionicons name="camera" size={13} color="#ffffff" />
            </View>
          </Pressable>

          {/* Action Buttons: Share, Edit Profile (High-contrast Native Buttons) */}
          <View style={styles.topActionBtnsGroup}>
            <Pressable
              onPress={handleShareApp}
              accessibilityRole="button"
              accessibilityLabel="Share Profile"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
                borderless: false,
              }}
              style={({ pressed }) => [
                styles.secondaryPillBtn,
                {
                  backgroundColor: isDark ? "#27272a" : "#ffffff",
                  borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                  opacity: Platform.OS === "ios" && pressed ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons
                name="share-outline"
                size={16}
                color={isDark ? "#ffffff" : "#0f172a"}
              />
              <Text
                style={[
                  styles.secondaryPillText,
                  { color: isDark ? "#ffffff" : "#0f172a" },
                ]}
              >
                Share
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
                router.push("/edit-profile" as any);
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit Profile"
              android_ripple={{
                color: "rgba(255, 255, 255, 0.2)",
                borderless: false,
              }}
              style={({ pressed }) => [
                styles.primaryPillBtn,
                {
                  backgroundColor: PRIMARY,
                  borderColor: PRIMARY,
                  opacity: Platform.OS === "ios" && pressed ? 0.8 : 1,
                },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={15}
                color="#ffffff"
              />
              <Text
                style={[
                  styles.primaryPillText,
                  { color: "#ffffff" },
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
            {systemHandle}
          </Text>

          {/* Status Badges Strip: Active Member, Team, Streak (Dynamic) */}
          <View style={styles.badgesWrap}>
            <View
              style={[
                styles.badgePill,
                {
                  backgroundColor: isDark ? "#052e16" : "#f0fdf4",
                  borderColor: isDark ? "#14532d" : "#bbf7d0",
                },
              ]}
            >
              <View style={styles.greenDot} />
              <Text
                style={[
                  styles.badgePillText,
                  { color: isDark ? "#4ade80" : "#16a34a" },
                ]}
              >
                {user?.role ? user.role.toUpperCase() : "Active Member"}
              </Text>
            </View>

            {isAssignedTeam ? (
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
                  {teamName}
                </Text>
              </Pressable>
            ) : null}

            {currentStreak > 0 ? (
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
            ) : null}
          </View>

          {/* Bio (Dynamic - never hardcoded) */}
          {memberBio ? (
            <Text style={[styles.bioText, { color: textPrimary }]}>
              {memberBio}
            </Text>
          ) : (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push("/edit-profile" as any);
              }}
              style={styles.bioPlaceholderBtn}
            >
              <Ionicons name="create-outline" size={13} color={textTertiary} />
              <Text style={[styles.bioPlaceholderText, { color: textTertiary }]}>
                Add a bio to your profile...
              </Text>
            </Pressable>
          )}

          {/* Dynamic Metadata Strip with Icons (render only existing attributes) */}
          <View style={styles.metadataList}>
            {Boolean(teamName || department) && (
              <View style={styles.metaRow}>
                <Ionicons name="briefcase-outline" size={14} color={iconMuted} />
                <Text style={[styles.metaText, { color: textSecondary }]}>
                  {teamName && department
                    ? `${teamName} · ${department}`
                    : teamName || department}
                </Text>
              </View>
            )}

            {Boolean(academicYear) && (
              <View style={styles.metaRow}>
                <Ionicons name="school-outline" size={14} color={iconMuted} />
                <Text style={[styles.metaText, { color: textSecondary }]}>
                  Academic Year: {academicYear}
                </Text>
              </View>
            )}

            {Boolean(location) && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={iconMuted} />
                <Text style={[styles.metaText, { color: textSecondary }]}>
                  {location}
                </Text>
              </View>
            )}

            {Boolean(joinedDate) && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={iconMuted} />
                <Text style={[styles.metaText, { color: textSecondary }]}>
                  {joinedDate}
                </Text>
              </View>
            )}

            {Boolean(telegramHandle) && (
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

            {Boolean(formattedPhone) && (
              <View style={styles.metaRow}>
                <Ionicons name="call-outline" size={13} color={iconMuted} />
                <Text style={[styles.metaText, { color: textSecondary }]}>
                  {formattedPhone}
                </Text>
              </View>
            )}
          </View>

          {/* Twitter Social & Devotional Stats Row */}
          <View style={styles.statsStripRow}>
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

            <Pressable
              onPress={() => setTabIndex(0)}
              style={styles.statCounterItem}
            >
              <Text style={[styles.statBold, { color: textPrimary }]}>
                {authorPosts.length}
              </Text>
              <Text style={[styles.statMuted, { color: textSecondary }]}>
                Reflections
              </Text>
            </Pressable>

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

        {/* Swipeable Native Pager TabView Powered by react-native-tab-view and react-native-pager-view */}
        <TabView
          navigationState={{ index: tabIndex, routes: TAB_ROUTES }}
          renderScene={renderScene}
          onIndexChange={(index) => {
            Haptics.selectionAsync().catch(() => {});
            setTabIndex(index);
          }}
          initialLayout={{ width: SCREEN_WIDTH }}
          renderTabBar={renderTabBar}
          style={{ minHeight: Math.max(SCREEN_HEIGHT - insets.top - 120, 650) }}
        />
      </ScrollView>

      {/* Floating Action Button (Twitter style: Write Reflection) */}
      {tabIndex === 0 && (
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

      {/* Senior-Engineered Native Bottom Action Sheet for Avatar & Banner */}
      <Modal
        visible={imageSheetTarget !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImageSheetTarget(null)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setImageSheetTarget(null)}>
          <View style={styles.sheetBackdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.sheetContainer,
                  {
                    backgroundColor: isDark ? "#18181b" : "#ffffff",
                    borderColor: isDark ? "#27272a" : "#e4e4e7",
                    paddingBottom: Math.max(insets.bottom, 20),
                  },
                ]}
              >
                {/* Drag Indicator */}
                <View style={styles.sheetHandleWrap}>
                  <View
                    style={[
                      styles.sheetHandle,
                      { backgroundColor: isDark ? "#3f3f46" : "#d4d4d8" },
                    ]}
                  />
                </View>

                {/* Title & Description */}
                <Text style={[styles.sheetTitle, { color: textPrimary }]}>
                  {imageSheetTarget === "avatar"
                    ? "Profile Photo"
                    : "Header Banner"}
                </Text>
                <Text style={[styles.sheetSubtitle, { color: textSecondary }]}>
                  {imageSheetTarget === "avatar"
                    ? "Capture a new 1:1 picture or select from your gallery"
                    : "Select a 3:1 panoramic photo for your profile header"}
                </Text>

                {/* Options List */}
                <View style={styles.sheetOptionsList}>
                  {/* Take Photo */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      if (imageSheetTarget) {
                        handlePickImage(imageSheetTarget, "camera");
                      }
                    }}
                    style={[
                      styles.sheetOptionBtn,
                      {
                        backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                        borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.sheetOptionIconWrap,
                        { backgroundColor: `${PRIMARY}18` },
                      ]}
                    >
                      <Ionicons name="camera-outline" size={20} color={PRIMARY} />
                    </View>
                    <View style={styles.sheetOptionTextCol}>
                      <Text
                        style={[styles.sheetOptionLabel, { color: textPrimary }]}
                      >
                        Take Photo
                      </Text>
                      <Text
                        style={[styles.sheetOptionHint, { color: textSecondary }]}
                      >
                        {imageSheetTarget === "avatar"
                          ? "Take a photo with 1:1 square crop"
                          : "Take a photo with 3:1 panoramic crop"}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={textTertiary}
                    />
                  </TouchableOpacity>

                  {/* Choose from Library */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      if (imageSheetTarget) {
                        handlePickImage(imageSheetTarget, "library");
                      }
                    }}
                    style={[
                      styles.sheetOptionBtn,
                      {
                        backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                        borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.sheetOptionIconWrap,
                        { backgroundColor: `${PRIMARY}18` },
                      ]}
                    >
                      <Ionicons name="images-outline" size={20} color={PRIMARY} />
                    </View>
                    <View style={styles.sheetOptionTextCol}>
                      <Text
                        style={[styles.sheetOptionLabel, { color: textPrimary }]}
                      >
                        Choose from Library
                      </Text>
                      <Text
                        style={[styles.sheetOptionHint, { color: textSecondary }]}
                      >
                        Select from your device and crop
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={textTertiary}
                    />
                  </TouchableOpacity>

                  {/* View Full Photo (Avatar only) */}
                  {imageSheetTarget === "avatar" && user?.profileImage && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        const img = user.profileImage;
                        setImageSheetTarget(null);
                        setLightboxImage({
                          uri: img!,
                          caption: user.fullName,
                          author: user.fullName,
                        });
                      }}
                      style={[
                        styles.sheetOptionBtn,
                        {
                          backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                          borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.sheetOptionIconWrap,
                          {
                            backgroundColor: isDark ? "#3f3f46" : "#e2e8f0",
                          },
                        ]}
                      >
                        <Ionicons
                          name="eye-outline"
                          size={20}
                          color={textPrimary}
                        />
                      </View>
                      <View style={styles.sheetOptionTextCol}>
                        <Text
                          style={[
                            styles.sheetOptionLabel,
                            { color: textPrimary },
                          ]}
                        >
                          View Profile Photo
                        </Text>
                        <Text
                          style={[
                            styles.sheetOptionHint,
                            { color: textSecondary },
                          ]}
                        >
                          Preview full-resolution avatar
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={textTertiary}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setImageSheetTarget(null)}
                  style={[
                    styles.sheetCancelBtn,
                    {
                      backgroundColor: isDark ? "#27272a" : "#f1f5f9",
                      borderColor: isDark ? "#3f3f46" : "#e2e8f0",
                    },
                  ]}
                >
                  <Text style={[styles.sheetCancelText, { color: textPrimary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
  bannerEmptyDoom: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  bannerEditBtn: {
    position: "absolute",
    top: 12,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 20,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bannerEditText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  bannerLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 20,
  },
  bannerLoadingText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
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
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1.5 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  secondaryPillText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  primaryPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryPillText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  identityContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
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
  bioPlaceholderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    marginBottom: 8,
  },
  bioPlaceholderText: {
    fontSize: 13,
    fontStyle: "italic",
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
  tabBarStyle: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarItem: {
    width: "auto",
    minWidth: 78,
    paddingHorizontal: 12,
  },
  tabBarLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  postsList: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
    marginHorizontal: 16,
    marginVertical: 16,
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
    paddingHorizontal: 16,
    paddingTop: 12,
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
    paddingHorizontal: 16,
    paddingTop: 12,
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
    paddingHorizontal: 16,
    paddingTop: 12,
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
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: 6,
    marginBottom: 8,
  },
  sheetHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  sheetOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  sheetOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sheetOptionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetOptionTextCol: {
    flex: 1,
  },
  sheetOptionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  sheetOptionHint: {
    fontSize: 12,
  },
  sheetCancelBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
