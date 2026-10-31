import { ImageViewerModal } from "@/components/ImageViewerModal";
import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useCommunityStore, MemberProfile } from "@/stores/community.store";
import { getPrefilledAvatar } from "@/utils/avatar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
];

const BANNER_PRESETS = [
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
];

const FELLOWSHIP_TEAMS = [
  "Worship Team",
  "Prayer Ministry",
  "Bible Study Team",
  "Freshman Outreach",
  "Media & Tech",
  "Executive Ministry",
  "Evangelism & Missions",
];

const STORY_HIGHLIGHTS = [
  { id: "h1", title: "Sunday ⛪", icon: "sparkles", quote: "Praise & Word Sunday Service highlights" },
  { id: "h2", title: "Worship 🎸", icon: "musical-notes", quote: "Acoustic nights & campus choir rehearsals" },
  { id: "h3", title: "Camp '25 ⛺", icon: "bonfire", quote: "Annual spiritual retreat & mountain prayer" },
  { id: "h4", title: "Outreach 🌱", icon: "people", quote: "Freshman welcome, dorm visits, & charity" },
  { id: "h5", title: "Testimony ✨", icon: "heart", quote: "God's goodness through finals & campus life" },
];

export default function MemberProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const member = useCommunityStore((s) => s.getMemberById(id as string));
  const posts = useCommunityStore((s) => s.posts);
  const toggleFollowMember = useCommunityStore((s) => s.toggleFollowMember);
  const updateMemberProfile = useCommunityStore((s) => s.updateMemberProfile);
  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const toggleRepost = useCommunityStore((s) => s.toggleRepost);
  const toggleBookmark = useCommunityStore((s) => s.toggleBookmark);

  const [activeTab, setActiveTab] = useState<"posts" | "media" | "ministry" | "likes">("posts");
  const [lightboxImage, setLightboxImage] = useState<any | null>(null);

  // Scroll tracking for sticky header & dynamic status bar
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      const scrolled = value > 70;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    });
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY]);

  // Interpolations for sticky header elements
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [40, 90],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [65, 105],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerTitleTranslateY = scrollY.interpolate({
    inputRange: [65, 105],
    outputRange: [8, 0],
    extrapolate: "clamp",
  });

  const bannerBtnOpacity = scrollY.interpolate({
    inputRange: [30, 80],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const scrolledBtnOpacity = scrollY.interpolate({
    inputRange: [30, 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Profile Customizer State
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editTeam, setEditTeam] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editTelegram, setEditTelegram] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editBanner, setEditBanner] = useState("");

  const textColor = isDark ? "#ffffff" : "#0f172a";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#27272a" : "#e2e8f0";
  const bg = isDark ? "#09090b" : "#ffffff";
  const cardBg = isDark ? "#18181b" : "#f8fafc";
  const inputBg = isDark ? "#27272a" : "#f1f5f9";

  // Fallback member object if user ID is not found in initial registry
  const currentMember: MemberProfile = useMemo(() => {
    if (member) return member;
    return {
      id: (id as string) || "user-unknown",
      fullName: "Fellowship Member",
      handle: "@fellowship_student",
      avatar: getPrefilledAvatar(id || "fellow"),
      banner: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
      team: "Campus Ministry",
      department: "Addis Ababa University",
      academicYear: "4 Kilo Campus",
      bio: "Rooted in Christ, walking in faith together with 4 Kilo Fellowship brothers and sisters. ✨",
      streakDays: 12,
      followersCount: 140,
      followingCount: 88,
      postsCount: 5,
      isFollowing: false,
      location: "AAU 4 Kilo Campus, Addis Ababa",
      joinedDate: "September 2023",
      mutualFollowers: {
        names: ["Abenezer", "Bethelhem", "Natnael"],
        count: 24,
        avatars: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        ],
      },
    };
  }, [member, id]);

  const authorPosts = useMemo(() => {
    return posts.filter(
      (p) =>
        p.authorId === currentMember.id ||
        p.authorHandle.toLowerCase() === currentMember.handle.toLowerCase()
    );
  }, [posts, currentMember]);

  const mediaPosts = useMemo(() => {
    return authorPosts.filter((p) => !!p.image);
  }, [authorPosts]);

  const likedPosts = useMemo(() => {
    return posts.filter((p) => p.isLiked);
  }, [posts]);

  const openCustomizeModal = () => {
    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    setEditFullName(currentMember.fullName);
    setEditHandle(currentMember.handle.replace(/^@/, ""));
    setEditTeam(currentMember.team);
    setEditDept(currentMember.department);
    setEditYear(currentMember.academicYear);
    setEditBio(currentMember.bio);
    setEditLocation(currentMember.location || "AAU 4 Kilo Campus");
    setEditTelegram(currentMember.telegramUsername || "");
    setEditAvatar(typeof currentMember.avatar === "string" ? currentMember.avatar : "");
    setEditBanner(typeof currentMember.banner === "string" ? currentMember.banner : "");
    setIsCustomizeModalOpen(true);
  };

  const handleSaveProfile = () => {
    if (!editFullName.trim()) {
      Alert.alert("Missing Name", "Please provide a valid display name.");
      return;
    }

    if (Platform.OS !== "web") {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }

    updateMemberProfile(currentMember.id, {
      fullName: editFullName.trim(),
      handle: editHandle.startsWith("@") ? editHandle.trim() : `@${editHandle.trim()}`,
      team: editTeam,
      department: editDept,
      academicYear: editYear,
      bio: editBio.trim(),
      location: editLocation.trim(),
      telegramUsername: editTelegram.replace(/^@/, "").trim(),
      avatar: editAvatar || currentMember.avatar,
      banner: editBanner || currentMember.banner,
    });

    setIsCustomizeModalOpen(false);
  };

  const handleShareProfile = async () => {
    try {
      Haptics.selectionAsync().catch(() => {});
      await Share.share({
        message: `Connect with ${currentMember.fullName} (${currentMember.handle}) from 4 Kilo Christian Students Fellowship!`,
      });
    } catch {}
  };

  const handleTelegramMessage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (currentMember.telegramUsername) {
      const url = `https://t.me/${currentMember.telegramUsername.replace(/^@/, "")}`;
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) Linking.openURL(url);
          else Alert.alert("Telegram Handle", `@${currentMember.telegramUsername}`);
        })
        .catch(() => Alert.alert("Telegram Handle", `@${currentMember.telegramUsername}`));
    } else {
      Alert.alert("Contact", `Send a direct prayer request or fellowship message to ${currentMember.fullName}`);
    }
  };

  const renderActiveTabContent = () => {
    if (activeTab === "media") {
      if (mediaPosts.length === 0) {
        return (
          <View style={styles.emptyWrap}>
            <Ionicons name="images-outline" size={44} color={mutedColor} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No fellowship media</Text>
            <Text style={[styles.emptySubtitle, { color: mutedColor }]}>
              Photos and recordings shared in reflections will show up here.
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
                  uri: post.image,
                  caption: post.content,
                  author: post.authorName,
                })
              }
              style={[
                styles.gridItem,
                { width: gridItemSize, height: gridItemSize, backgroundColor: cardBg },
              ]}
            >
              <ExpoImage
                source={typeof post.image === "string" ? { uri: post.image } : post.image}
                style={styles.gridImage}
                contentFit="cover"
              />
              <View style={styles.gridOverlayBadge}>
                <Ionicons name="heart" size={11} color="#ffffff" />
                <Text style={styles.gridOverlayText}>{post.likesCount}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (activeTab === "ministry") {
      return (
        <View style={styles.ministryContainer}>
          {/* Fellowship Team Card */}
          <View style={[styles.ministryCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.ministryHeaderRow}>
              <View style={[styles.ministryIconWrap, { backgroundColor: "rgba(255, 103, 25, 0.12)" }]}>
                <Ionicons name="flame" size={20} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ministryTitle, { color: textColor }]}>{currentMember.team}</Text>
                <Text style={[styles.ministrySub, { color: mutedColor }]}>Active Fellowship Ministry</Text>
              </View>
            </View>
            <Text style={[styles.ministryDesc, { color: textColor }]}>
              Serving Christ faithfully at Addis Ababa University, ministering to university peers, participating in prayer meetings, and uplifting the body of believers.
            </Text>
          </View>

          {/* Schedule Card */}
          <View style={[styles.ministryCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.ministryHeaderRow}>
              <View style={[styles.ministryIconWrap, { backgroundColor: isDark ? "#27272a" : "#e2e8f0" }]}>
                <Ionicons name="time-outline" size={20} color={textColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ministryTitle, { color: textColor }]}>Weekly Fellowship Schedule</Text>
                <Text style={[styles.ministrySub, { color: mutedColor }]}>Campus Gathering Points</Text>
              </View>
            </View>
            <View style={styles.scheduleRow}>
              <Ionicons name="calendar-outline" size={14} color={PRIMARY} />
              <Text style={[styles.scheduleText, { color: textColor }]}>Wednesday Midweek Prayer · 5:30 PM (Sidist Kilo Chapel)</Text>
            </View>
            <View style={styles.scheduleRow}>
              <Ionicons name="musical-notes-outline" size={14} color={PRIMARY} />
              <Text style={[styles.scheduleText, { color: textColor }]}>Friday Acoustic Worship & Bible Study · 6:00 PM (4 Kilo Hall)</Text>
            </View>
          </View>
        </View>
      );
    }

    const dataSource = activeTab === "likes" ? likedPosts : authorPosts;

    if (dataSource.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <Ionicons
            name={activeTab === "likes" ? "heart-dislike-outline" : "chatbubble-ellipses-outline"}
            size={44}
            color={mutedColor}
          />
          <Text style={[styles.emptyTitle, { color: textColor }]}>
            {activeTab === "likes" ? "No liked reflections" : "No reflections yet"}
          </Text>
          <Text style={[styles.emptySubtitle, { color: mutedColor }]}>
            {activeTab === "likes"
              ? "Reflections liked by this member will appear here."
              : `${currentMember.fullName} hasn't shared any fellowship reflections yet.`}
          </Text>
        </View>
      );
    }

    return (
      <View>
        {dataSource.map((item) => (
          <View key={item.id} style={[styles.postRow, { borderBottomColor: borderColor }]}>
            <ExpoImage
              source={
                typeof item.authorAvatar === "string"
                  ? { uri: item.authorAvatar }
                  : item.authorAvatar || { uri: getPrefilledAvatar(item.authorHandle) }
              }
              style={styles.feedAvatar}
              contentFit="cover"
            />
            <View style={styles.postBody}>
              <View style={styles.postAuthorLine}>
                <Text style={[styles.postAuthorName, { color: textColor }]}>
                  {item.authorName}
                </Text>
                {item.isVerified && (
                  <Ionicons name="checkmark-circle" size={14} color={PRIMARY} style={{ marginHorizontal: 2 }} />
                )}
                <Text style={[styles.postTime, { color: mutedColor }]}>
                  · {item.timestamp}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/community/${item.id}` as any)}
              >
                <Text style={[styles.postContentText, { color: textColor }]}>
                  {item.content}
                </Text>
              </TouchableOpacity>

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
                  style={styles.postImageCard}
                >
                  <ExpoImage
                    source={
                      typeof item.image === "string" ? { uri: item.image } : item.image
                    }
                    style={styles.postImage}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              )}

              {/* Feed Actions Row */}
              <View style={styles.feedActionsRow}>
                <TouchableOpacity
                  onPress={() => router.push(`/community/${item.id}` as any)}
                  style={styles.feedActionBtn}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={mutedColor} />
                  <Text style={[styles.feedActionCount, { color: mutedColor }]}>
                    {item.repliesCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleRepost(item.id)}
                  style={styles.feedActionBtn}
                >
                  <Ionicons
                    name="repeat-outline"
                    size={18}
                    color={item.isReposted ? "#00ba7c" : mutedColor}
                  />
                  <Text
                    style={[
                      styles.feedActionCount,
                      { color: item.isReposted ? "#00ba7c" : mutedColor },
                    ]}
                  >
                    {item.repostsCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleLike(item.id)}
                  style={styles.feedActionBtn}
                >
                  <Ionicons
                    name={item.isLiked ? "heart" : "heart-outline"}
                    size={17}
                    color={item.isLiked ? "#f91880" : mutedColor}
                  />
                  <Text
                    style={[
                      styles.feedActionCount,
                      { color: item.isLiked ? "#f91880" : mutedColor },
                    ]}
                  >
                    {item.likesCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleBookmark(item.id)}
                  style={styles.feedActionBtn}
                >
                  <Ionicons
                    name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={17}
                    color={item.isBookmarked ? PRIMARY : mutedColor}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? "light" : isScrolled ? "dark" : "light"} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Cover Hero Banner with Scrim Gradient */}
        <View style={styles.bannerWrap}>
          <ExpoImage
            source={
              typeof currentMember.banner === "string"
                ? { uri: currentMember.banner }
                : currentMember.banner
            }
            style={styles.bannerImage}
            contentFit="cover"
          />
          <View style={styles.bannerOverlay} />

          {/* Floating Navigation Controls over Banner (Back + Share) */}
          <View style={[styles.navButtonsRow, { top: Math.max(insets.top, 14) }]}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.3)",
                borderless: true,
                radius: 20,
              }}
              style={({ pressed }) => [
                styles.floatingNavBtn,
                pressed && Platform.OS === "ios" && { opacity: 0.8 },
              ]}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </Pressable>

            <View style={styles.topNavRightGroup}>
              <Pressable
                onPress={handleShareProfile}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                android_ripple={{
                  color: "rgba(255, 255, 255, 0.3)",
                  borderless: true,
                  radius: 20,
                }}
                style={({ pressed }) => [
                  styles.floatingNavBtn,
                  pressed && Platform.OS === "ios" && { opacity: 0.8 },
                ]}
                accessibilityLabel="Share Profile"
              >
                <Ionicons name="share-social-outline" size={20} color="#ffffff" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Profile Avatar & Inline Action Pill Controls */}
        <View style={styles.profileActionRow}>
          {/* Story Ring Avatar (IG Style with smooth image viewer tap) */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
              }
              setLightboxImage({
                uri: typeof currentMember.avatar === "string" ? currentMember.avatar : undefined,
                caption: `${currentMember.fullName}'s profile photo`,
                author: currentMember.fullName,
              });
            }}
            style={({ pressed }) => [
              styles.avatarStoryRing,
              { borderColor: PRIMARY },
              pressed && Platform.OS === "ios" && { opacity: 0.9 },
            ]}
            accessibilityRole="imagebutton"
            accessibilityLabel={`View ${currentMember.fullName}'s profile photo`}
          >
            <View style={[styles.avatarInnerRing, { borderColor: bg }]}>
              <ExpoImage
                source={
                  typeof currentMember.avatar === "string"
                    ? { uri: currentMember.avatar }
                    : currentMember.avatar
                }
                style={styles.profileAvatar}
                contentFit="cover"
              />
              <View style={[styles.onlineDot, { borderColor: bg }]} />
            </View>
          </Pressable>

          {/* Action Row: Message + Edit/Customize + Follow Pill with Native Ripples */}
          <View style={styles.actionButtonsCol}>
            {/* Telegram Message */}
            <View style={[styles.iconActionWrap, { borderColor, backgroundColor: cardBg }]}>
              <Pressable
                onPress={handleTelegramMessage}
                android_ripple={{
                  color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                  borderless: false,
                }}
                style={({ pressed }) => [
                  styles.iconActionPressable,
                  pressed && Platform.OS === "ios" && { opacity: 0.7 },
                ]}
                accessibilityLabel="Message on Telegram"
              >
                <Ionicons name="paper-plane-outline" size={17} color={textColor} />
              </Pressable>
            </View>

            {/* Edit / Customize Profile */}
            <View style={[styles.iconActionWrap, { borderColor, backgroundColor: cardBg }]}>
              <Pressable
                onPress={openCustomizeModal}
                android_ripple={{
                  color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
                  borderless: false,
                }}
                style={({ pressed }) => [
                  styles.iconActionPressable,
                  pressed && Platform.OS === "ios" && { opacity: 0.7 },
                ]}
                accessibilityLabel="Customize Profile"
              >
                <Ionicons name="create-outline" size={17} color={textColor} />
              </Pressable>
            </View>

            {/* Follow Pill Button */}
            <View
              style={[
                styles.followPillContainer,
                {
                  backgroundColor: currentMember.isFollowing
                    ? (isDark ? "#27272a" : "#f1f5f9")
                    : PRIMARY,
                  borderColor: currentMember.isFollowing ? borderColor : "transparent",
                  borderWidth: currentMember.isFollowing ? 1 : 0,
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    } catch {}
                  }
                  toggleFollowMember(currentMember.id);
                }}
                android_ripple={{
                  color: currentMember.isFollowing
                    ? (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)")
                    : "rgba(255,255,255,0.3)",
                  borderless: false,
                }}
                style={({ pressed }) => [
                  styles.followPillPressable,
                  pressed && Platform.OS === "ios" && { opacity: 0.8 },
                ]}
                accessibilityLabel={currentMember.isFollowing ? "Unfollow" : "Follow"}
              >
                <Ionicons
                  name={currentMember.isFollowing ? "checkmark" : "person-add"}
                  size={14}
                  color={currentMember.isFollowing ? textColor : "#ffffff"}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.followPillText,
                    { color: currentMember.isFollowing ? textColor : "#ffffff" },
                  ]}
                >
                  {currentMember.isFollowing ? "Following" : "Follow"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Member Identity, Handles & Fellowship Badges */}
        <View style={styles.memberInfoContainer}>
          <View style={styles.nameVerifiedRow}>
            <Text style={[styles.fullName, { color: textColor }]}>
              {currentMember.fullName}
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={PRIMARY}
              style={{ marginLeft: 5 }}
            />
          </View>

          <Text style={[styles.handleText, { color: mutedColor }]}>
            {currentMember.handle}
          </Text>

          {/* Fellowship Badges Row */}
          <View style={styles.badgesWrap}>
            <View style={[styles.infoBadge, { backgroundColor: isDark ? "rgba(255, 103, 25, 0.15)" : "#fff7ed", borderColor: PRIMARY }]}>
              <Ionicons name="heart" size={12} color={PRIMARY} />
              <Text style={[styles.infoBadgeText, { color: PRIMARY }]}>
                {currentMember.team}
              </Text>
            </View>

            <View style={[styles.infoBadge, { backgroundColor: cardBg, borderColor }]}>
              <Ionicons name="school-outline" size={12} color={mutedColor} />
              <Text style={[styles.infoBadgeText, { color: textColor }]}>
                {currentMember.department} · {currentMember.academicYear}
              </Text>
            </View>

            {/* Devotions Streak Badge */}
            <View style={[styles.infoBadge, { backgroundColor: isDark ? "#2a1b12" : "#fff1eb", borderColor: "#f97316" }]}>
              <Ionicons name="flame" size={13} color="#f97316" />
              <Text style={[styles.infoBadgeText, { color: "#f97316", fontWeight: "700" }]}>
                {currentMember.streakDays}d Streak
              </Text>
            </View>
          </View>

          {/* Bio / Heartfelt Campus Devotion */}
          <Text style={[styles.bioText, { color: textColor }]}>
            {currentMember.bio}
          </Text>

          {/* Metadata Info Row (X Best Practice: Location, Joined Date, Telegram Handle) */}
          <View style={styles.metadataList}>
            {currentMember.location && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={mutedColor} />
                <Text style={[styles.metaText, { color: mutedColor }]}>
                  {currentMember.location}
                </Text>
              </View>
            )}

            {currentMember.joinedDate && (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={mutedColor} />
                <Text style={[styles.metaText, { color: mutedColor }]}>
                  Joined {currentMember.joinedDate}
                </Text>
              </View>
            )}

            {currentMember.telegramUsername && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleTelegramMessage}
                style={styles.metaRow}
              >
                <Ionicons name="paper-plane" size={13} color={PRIMARY} />
                <Text style={[styles.metaText, { color: PRIMARY, fontWeight: "600" }]}>
                  @{currentMember.telegramUsername}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stats Counters: Following, Connects, Reflections */}
          <View style={styles.statsRow}>
            <TouchableOpacity activeOpacity={0.8} style={styles.statItem}>
              <Text style={[styles.statBold, { color: textColor }]}>{currentMember.followingCount}</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Following</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.statItem}>
              <Text style={[styles.statBold, { color: textColor }]}>{currentMember.followersCount}</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Connects</Text>
            </TouchableOpacity>

            <View style={styles.statItem}>
              <Text style={[styles.statBold, { color: textColor }]}>{authorPosts.length}</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Reflections</Text>
            </View>
          </View>

          {/* Social Proof: Mutual Fellowship Peers (from X Screenshot UX) */}
          {currentMember.mutualFollowers && (
            <View style={[styles.mutualFollowersRow, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }]}>
              <View style={styles.mutualAvatarsCluster}>
                {currentMember.mutualFollowers.avatars.slice(0, 3).map((av, idx) => (
                  <ExpoImage
                    key={idx}
                    source={{ uri: av }}
                    style={[
                      styles.mutualMiniAvatar,
                      { marginLeft: idx === 0 ? 0 : -8, borderColor: bg },
                    ]}
                    contentFit="cover"
                  />
                ))}
              </View>
              <Text style={[styles.mutualFollowersText, { color: mutedColor }]} numberOfLines={1}>
                Followed by{" "}
                <Text style={{ fontWeight: "700", color: textColor }}>
                  {currentMember.mutualFollowers.names.slice(0, 2).join(", ")}
                </Text>{" "}
                and{" "}
                <Text style={{ fontWeight: "700", color: textColor }}>
                  {currentMember.mutualFollowers.count} other fellowship peers
                </Text>
              </Text>
            </View>
          )}

          {/* Instagram-Inspired Highlights Carousel (Ministry Stories) */}
          <View style={styles.highlightsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightsScroll}>
              {STORY_HIGHLIGHTS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    Alert.alert(item.title, item.quote);
                  }}
                  style={styles.highlightItem}
                >
                  <View style={[styles.highlightCircle, { borderColor, backgroundColor: cardBg }]}>
                    <Ionicons name={item.icon as any} size={20} color={PRIMARY} />
                  </View>
                  <Text style={[styles.highlightLabel, { color: textColor }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Tab Selection Bar */}
        <View style={[styles.tabsRow, { borderBottomColor: borderColor }]}>
          {(["posts", "media", "ministry", "likes"] as const).map((tab) => {
            const isSelected = activeTab === tab;
            const label =
              tab === "posts"
                ? "Reflections"
                : tab === "media"
                  ? "Media"
                  : tab === "ministry"
                    ? "Ministry"
                    : "Likes";
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setActiveTab(tab);
                }}
                style={styles.tabItem}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isSelected ? textColor : mutedColor,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {label}
                </Text>
                {isSelected && <View style={[styles.tabUnderline, { backgroundColor: PRIMARY }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content Display */}
        {renderActiveTabContent()}
      </Animated.ScrollView>

      {/* Sticky Header Bar — Fades in smoothly when scrolled past banner */}
      <Animated.View
        style={[
          styles.stickyHeaderBar,
          {
            paddingTop: insets.top,
            backgroundColor: bg,
            borderBottomColor: borderColor,
            opacity: headerBgOpacity,
          },
        ]}
        pointerEvents={isScrolled ? "auto" : "none"}
      >
        <View style={styles.stickyHeaderRow}>
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            android_ripple={{
              color: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.12)",
              borderless: true,
              radius: 20,
            }}
            style={({ pressed }) => [
              styles.scrolledNavBtn,
              {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
                borderColor,
              },
              pressed && Platform.OS === "ios" && { opacity: 0.8 },
            ]}
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={22} color={textColor} />
          </Pressable>

          {/* Centered Member Title */}
          <View style={styles.stickyHeaderCenter}>
            <Text style={[styles.stickyTitle, { color: textColor }]} numberOfLines={1}>
              {currentMember.fullName}
            </Text>
            <Text style={[styles.stickySubtitle, { color: mutedColor }]} numberOfLines={1}>
              {(currentMember as any).role || currentMember.team || currentMember.handle}
            </Text>
          </View>

          {/* Share Button (Right) */}
          <Pressable
            onPress={handleShareProfile}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            android_ripple={{
              color: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.12)",
              borderless: true,
              radius: 20,
            }}
            style={({ pressed }) => [
              styles.scrolledNavBtn,
              {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
                borderColor,
              },
              pressed && Platform.OS === "ios" && { opacity: 0.8 },
            ]}
            accessibilityLabel="Share Profile"
          >
            <Ionicons name="share-social-outline" size={20} color={textColor} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Lightbox Modal */}
      <ImageViewerModal
        visible={!!lightboxImage}
        imageUri={lightboxImage?.uri}
        caption={lightboxImage?.caption}
        authorName={lightboxImage?.author}
        onClose={() => setLightboxImage(null)}
      />

      {/* Customizer Modal / Bottom Sheet */}
      <Modal
        visible={isCustomizeModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCustomizeModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[styles.modalScreen, { backgroundColor: bg }]}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <TouchableOpacity
              onPress={() => setIsCustomizeModalOpen(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={[styles.modalCancelText, { color: mutedColor }]}>Cancel</Text>
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: textColor }]}>Customize Profile</Text>

            <TouchableOpacity
              onPress={handleSaveProfile}
              style={[styles.modalSaveBtn, { backgroundColor: PRIMARY }]}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScroll}
          >
            {/* Banner Selection */}
            <Text style={[styles.fieldLabel, { color: textColor }]}>Cover Banner</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {BANNER_PRESETS.map((preset, idx) => {
                const isSelected = editBanner === preset;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setEditBanner(preset);
                    }}
                    style={[
                      styles.bannerPresetCard,
                      isSelected && { borderColor: PRIMARY, borderWidth: 2.5 },
                    ]}
                  >
                    <ExpoImage source={{ uri: preset }} style={styles.bannerPresetImg} contentFit="cover" />
                    {isSelected && (
                      <View style={styles.presetCheckmarkBadge}>
                        <Ionicons name="checkmark-circle" size={18} color={PRIMARY} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Avatar Selection */}
            <Text style={[styles.fieldLabel, { color: textColor, marginTop: 16 }]}>Avatar Photo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {AVATAR_PRESETS.map((preset, idx) => {
                const isSelected = editAvatar === preset;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setEditAvatar(preset);
                    }}
                    style={[
                      styles.avatarPresetCircle,
                      isSelected && { borderColor: PRIMARY, borderWidth: 3 },
                    ]}
                  >
                    <ExpoImage source={{ uri: preset }} style={styles.avatarPresetImg} contentFit="cover" />
                    {isSelected && (
                      <View style={styles.presetCheckmarkBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={PRIMARY} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Full Name */}
            <Text style={[styles.fieldLabel, { color: textColor, marginTop: 18 }]}>Full Name</Text>
            <TextInput
              value={editFullName}
              onChangeText={setEditFullName}
              placeholder="Your Full Name"
              placeholderTextColor={mutedColor}
              style={[styles.inputField, { backgroundColor: inputBg, color: textColor, borderColor }]}
            />

            {/* Handle */}
            <Text style={[styles.fieldLabel, { color: textColor, marginTop: 14 }]}>Handle</Text>
            <View style={[styles.inputWithPrefix, { backgroundColor: inputBg, borderColor }]}>
              <Text style={{ color: mutedColor, fontSize: 15, fontWeight: "600" }}>@</Text>
              <TextInput
                value={editHandle}
                onChangeText={setEditHandle}
                placeholder="username"
                placeholderTextColor={mutedColor}
                autoCapitalize="none"
                style={[styles.inputFieldInner, { color: textColor }]}
              />
            </View>

            {/* Fellowship Team / Ministry */}
            <Text style={[styles.fieldLabel, { color: textColor, marginTop: 14 }]}>Fellowship Ministry Team</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamPillsScroll}>
              {FELLOWSHIP_TEAMS.map((teamName) => {
                const isSelected = editTeam === teamName;
                return (
                  <TouchableOpacity
                    key={teamName}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setEditTeam(teamName);
                    }}
                    style={[
                      styles.teamPill,
                      {
                        backgroundColor: isSelected ? PRIMARY : cardBg,
                        borderColor: isSelected ? PRIMARY : borderColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.teamPillText,
                        { color: isSelected ? "#ffffff" : textColor, fontWeight: isSelected ? "700" : "500" },
                      ]}
                    >
                      {teamName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Department */}
            <Text style={[styles.fieldLabel, { color: textColor, marginTop: 14 }]}>Department / Faculty</Text>
            <TextInput
              value={editDept}
              onChangeText={setEditDept}
              placeholder="e.g. Software Engineering"
              placeholderTextColor={mutedColor}
              style={[styles.inputField, { backgroundColor: inputBg, color: textColor, borderColor }]}
            />

            {/* Academic Year */}
            <Text style={[styles.fieldLabel, { color: textColor, marginTop: 14 }]}>Academic Year</Text>
            <TextInput
              value={editYear}
              onChangeText={setEditYear}
              placeholder="e.g. 4th Year"
              placeholderTextColor={mutedColor}
              style={[styles.inputField, { backgroundColor: inputBg, color: textColor, borderColor }]}
            />

            {/* Bio */}
            <Text style={[styles.fieldLabel, { color: textColor, marginTop: 14 }]}>Bio & Favorite Scripture</Text>
            <TextInput
              value={editBio}
              onChangeText={setEditBio}
              multiline
              numberOfLines={3}
              placeholder="Rooted in Christ, walking in faith together..."
              placeholderTextColor={mutedColor}
              style={[styles.textAreaField, { backgroundColor: inputBg, color: textColor, borderColor }]}
            />

            {/* Location */}
            <Text style={[styles.fieldLabel, { color: textColor, marginTop: 14 }]}>Campus Location</Text>
            <TextInput
              value={editLocation}
              onChangeText={setEditLocation}
              placeholder="e.g. AAU 4 Kilo Campus, Addis Ababa"
              placeholderTextColor={mutedColor}
              style={[styles.inputField, { backgroundColor: inputBg, color: textColor, borderColor }]}
            />

            {/* Telegram Username */}
            <Text style={[styles.fieldLabel, { color: textColor, marginTop: 14 }]}>Telegram Handle</Text>
            <View style={[styles.inputWithPrefix, { backgroundColor: inputBg, borderColor }]}>
              <Text style={{ color: mutedColor, fontSize: 15, fontWeight: "600" }}>@</Text>
              <TextInput
                value={editTelegram}
                onChangeText={setEditTelegram}
                placeholder="telegram_username"
                placeholderTextColor={mutedColor}
                autoCapitalize="none"
                style={[styles.inputFieldInner, { color: textColor }]}
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  bannerWrap: {
    width: SCREEN_WIDTH,
    height: 155,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  navButtonsRow: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  topNavRightGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  floatingNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  stickyHeaderBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stickyHeaderRow: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  stickyHeaderCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  stickyTitle: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  stickySubtitle: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 1,
  },
  scrolledNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  profileActionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -44,
  },
  avatarStoryRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2.5,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInnerRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    overflow: "hidden",
    position: "relative",
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22c55e",
    borderWidth: 2,
  },
  actionButtonsCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  iconActionWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    overflow: "hidden",
  },
  iconActionPressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  followPillContainer: {
    height: 38,
    borderRadius: 9999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  followPillPressable: {
    height: "100%",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  followPillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  memberInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  nameVerifiedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fullName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  handleText: {
    fontSize: 14,
    marginTop: 2,
  },
  badgesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  metadataList: {
    marginTop: 12,
    gap: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 14,
    paddingVertical: 6,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statBold: {
    fontSize: 14,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 13,
  },
  mutualFollowersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
    gap: 10,
  },
  mutualAvatarsCluster: {
    flexDirection: "row",
    alignItems: "center",
  },
  mutualMiniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  mutualFollowersText: {
    fontSize: 12,
    flex: 1,
  },
  highlightsContainer: {
    marginTop: 16,
    marginBottom: 4,
  },
  highlightsScroll: {
    gap: 14,
    paddingVertical: 4,
  },
  highlightItem: {
    alignItems: "center",
    width: 64,
  },
  highlightCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 44,
    marginTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabLabel: {
    fontSize: 14,
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "48%",
    borderRadius: 2,
  },
  postRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  feedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
  postBody: {
    flex: 1,
  },
  postAuthorLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: "700",
  },
  postTime: {
    fontSize: 13,
  },
  postContentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  postImageCard: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 8,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  feedActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingRight: 10,
  },
  feedActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  feedActionCount: {
    fontSize: 12,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 6,
  },
  gridItem: {
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridOverlayBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  gridOverlayText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
  },
  ministryContainer: {
    padding: 16,
    gap: 14,
  },
  ministryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  ministryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  ministryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ministryTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  ministrySub: {
    fontSize: 12,
  },
  ministryDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  scheduleText: {
    fontSize: 13,
    flex: 1,
  },
  modalScreen: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalCancelBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalCancelText: {
    fontSize: 15,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  modalSaveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  modalSaveText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  modalScroll: {
    padding: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  presetScroll: {
    marginBottom: 6,
  },
  bannerPresetCard: {
    width: 110,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
    overflow: "hidden",
    position: "relative",
  },
  bannerPresetImg: {
    width: "100%",
    height: "100%",
  },
  avatarPresetCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
  },
  avatarPresetImg: {
    width: "100%",
    height: "100%",
  },
  presetCheckmarkBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#ffffff",
    borderRadius: 10,
  },
  inputField: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  inputWithPrefix: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputFieldInner: {
    flex: 1,
    height: "100%",
    marginLeft: 4,
    fontSize: 14,
  },
  teamPillsScroll: {
    flexDirection: "row",
    marginBottom: 4,
  },
  teamPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  teamPillText: {
    fontSize: 12,
  },
  textAreaField: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
  },
});
