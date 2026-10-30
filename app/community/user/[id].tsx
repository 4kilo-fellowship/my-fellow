import { ImageViewerModal } from "@/components/ImageViewerModal";
import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useCommunityStore } from "@/stores/community.store";
import { getPrefilledAvatar } from "@/utils/avatar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MemberProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const member = useCommunityStore((s) => s.getMemberById(id as string));
  const posts = useCommunityStore((s) => s.posts);
  const toggleFollowMember = useCommunityStore((s) => s.toggleFollowMember);
  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const toggleRepost = useCommunityStore((s) => s.toggleRepost);
  const toggleBookmark = useCommunityStore((s) => s.toggleBookmark);

  const [activeTab, setActiveTab] = useState<"posts" | "replies" | "media" | "likes">("posts");
  const [lightboxImage, setLightboxImage] = useState<any | null>(null);

  const textColor = isDark ? "#ffffff" : "#0f172a";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#27272a" : "#e2e8f0";
  const bg = isDark ? "#09090b" : "#ffffff";
  const cardBg = isDark ? "#18181b" : "#f8fafc";

  // Fallback member object if user ID is not in initial registry
  const currentMember = useMemo(() => {
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
    };
  }, [member, id]);

  const authorPosts = useMemo(() => {
    return posts.filter(
      (p) =>
        p.authorId === currentMember.id ||
        p.authorHandle.toLowerCase() === currentMember.handle.toLowerCase()
    );
  }, [posts, currentMember]);

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
      Alert.alert("Contact", `Send a direct prayer request to ${currentMember.fullName}`);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <StatusBar style="light" />

      <FlatList
        data={activeTab === "media" ? authorPosts.filter((p) => !!p.image) : authorPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Hero Cover Banner */}
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

              {/* Floating Top Nav Buttons */}
              <View style={[styles.navButtonsRow, { top: Math.max(insets.top, 14) }]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.back()}
                  style={styles.floatingNavBtn}
                >
                  <Ionicons name="arrow-back" size={20} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleShareProfile}
                  style={styles.floatingNavBtn}
                >
                  <Ionicons name="share-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Avatar & Action Button Row */}
            <View style={styles.profileActionRow}>
              <View style={[styles.avatarRing, { borderColor: bg }]}>
                <ExpoImage
                  source={
                    typeof currentMember.avatar === "string"
                      ? { uri: currentMember.avatar }
                      : currentMember.avatar
                  }
                  style={styles.profileAvatar}
                  contentFit="cover"
                />
              </View>

              <View style={styles.actionButtonsCol}>
                {/* Connect / Following Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    toggleFollowMember(currentMember.id);
                  }}
                  style={[
                    styles.connectBtn,
                    {
                      backgroundColor: currentMember.isFollowing ? "transparent" : PRIMARY,
                      borderColor: currentMember.isFollowing ? borderColor : PRIMARY,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.connectBtnText,
                      { color: currentMember.isFollowing ? textColor : "#ffffff" },
                    ]}
                  >
                    {currentMember.isFollowing ? "Following" : "Connect"}
                  </Text>
                </TouchableOpacity>

                {/* Telegram / Message Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleTelegramMessage}
                  style={[styles.messageBtn, { borderColor, backgroundColor: cardBg }]}
                >
                  <Ionicons name="paper-plane-outline" size={17} color={PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile Info Details */}
            <View style={styles.memberInfoContainer}>
              <View style={styles.nameVerifiedRow}>
                <Text style={[styles.fullName, { color: textColor }]}>
                  {currentMember.fullName}
                </Text>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={PRIMARY}
                  style={{ marginLeft: 4 }}
                />
              </View>

              <Text style={[styles.handleText, { color: mutedColor }]}>
                {currentMember.handle}
              </Text>

              {/* Fellowship Ministry & Department Badges */}
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

              {/* Bio */}
              <Text style={[styles.bioText, { color: textColor }]}>
                {currentMember.bio}
              </Text>

              {/* Stats: Followers, Following, Posts */}
              <View style={styles.statsRow}>
                <Text style={[styles.statItem, { color: textColor }]}>
                  <Text style={styles.statBold}>{currentMember.followingCount}</Text>{" "}
                  <Text style={{ color: mutedColor }}>Following</Text>
                </Text>

                <Text style={[styles.statItem, { color: textColor }]}>
                  <Text style={styles.statBold}>{currentMember.followersCount}</Text>{" "}
                  <Text style={{ color: mutedColor }}>Connects</Text>
                </Text>

                <Text style={[styles.statItem, { color: textColor }]}>
                  <Text style={styles.statBold}>{authorPosts.length}</Text>{" "}
                  <Text style={{ color: mutedColor }}>Posts</Text>
                </Text>
              </View>
            </View>

            {/* Profile Tab Navigation */}
            <View style={[styles.tabsRow, { borderBottomColor: borderColor }]}>
              {(["posts", "replies", "media", "likes"] as const).map((tab) => {
                const isSelected = activeTab === tab;
                const label =
                  tab === "posts"
                    ? "Posts"
                    : tab === "replies"
                      ? "Replies"
                      : tab === "media"
                        ? "Media"
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
                          color: isSelected ? (isDark ? "#ffffff" : "#0f172a") : mutedColor,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {label}
                    </Text>
                    {isSelected && (
                      <View style={[styles.tabUnderline, { backgroundColor: PRIMARY }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="newspaper-outline" size={40} color={mutedColor} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No {activeTab} yet</Text>
            <Text style={[styles.emptySubtitle, { color: mutedColor }]}>
              {`${currentMember.fullName} hasn't shared any ${activeTab} in fellowship yet.`}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.postRow, { borderBottomColor: borderColor }]}>
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
        )}
      />

      {/* Lightbox for post photos */}
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
  headerBlock: {},
  bannerWrap: {
    width: SCREEN_WIDTH,
    height: 140,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  navButtonsRow: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  floatingNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileActionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -38,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3.5,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
  },
  actionButtonsCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  connectBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
  },
  connectBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  messageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 20,
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
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 14,
    marginBottom: 6,
  },
  statItem: {
    fontSize: 13,
  },
  statBold: {
    fontWeight: "700",
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
});
