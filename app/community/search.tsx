import { ProfileLink } from "@/components/profile/ProfileLink";
import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { socialApi } from "@/services/socialApi";
import {
  apiPostToCommunityPost,
  CommunityPost,
  MemberProfile,
  useCommunityStore,
} from "@/stores/community.store";
import { getPrefilledAvatar } from "@/utils/avatar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TRENDING_TAGS = [
  { tag: "#4KiloECSF", category: "Campus Ministry", count: "384 posts" },
  { tag: "#WorshipNight", category: "Music & Praise", count: "148 posts" },
  { tag: "#PrayerChain", category: "Intercession", count: "92 posts" },
  { tag: "#FreshmanOutreach", category: "Campus Discipleship", count: "112 posts" },
  { tag: "#TestimonyTime", category: "Fellowship Encouragement", count: "57 posts" },
];

export default function CommunitySearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const posts = useCommunityStore((s) => s.posts);
  const members = useCommunityStore((s) => s.members);
  const toggleFollowMember = useCommunityStore((s) => s.toggleFollowMember);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "people" | "media">("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "#WorshipNight",
    "Bethlehem Haile",
    "Prayer",
  ]);
  const [trendingTags, setTrendingTags] = useState(TRENDING_TAGS);
  const [apiPosts, setApiPosts] = useState<CommunityPost[]>([]);
  const [apiMembers, setApiMembers] = useState<MemberProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    socialApi
      .getTrendingTags()
      .then((tags) => {
        if (Array.isArray(tags) && tags.length > 0) {
          setTrendingTags(
            tags.map((t) => ({
              tag: t.tag.startsWith("#") ? t.tag : `#${t.tag}`,
              category: t.category || "Fellowship",
              count:
                typeof t.count === "number"
                  ? `${t.count} posts`
                  : String(t.count || "Trending"),
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setApiPosts([]);
      setApiMembers([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      const searchType =
        activeTab === "people"
          ? "people"
          : activeTab === "posts"
            ? "posts"
            : "all";
      socialApi
        .searchSocial(q, searchType)
        .then((result) => {
          if (result.posts && result.posts.length > 0) {
            setApiPosts(result.posts.map(apiPostToCommunityPost));
          }
          if (result.people && result.people.length > 0) {
            setApiMembers(
              result.people.map((u) => ({
                id: u.id,
                fullName: u.displayName || u.username,
                handle: u.username?.startsWith("@")
                  ? u.username
                  : `@${u.username}`,
                avatar:
                  typeof u.avatar === "string"
                    ? u.avatar
                    : u.avatar?.urls?.md || getPrefilledAvatar(u.id),
                banner:
                  "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
                team: u.fellowshipRole || "Campus Ministry",
                department: u.department || "Addis Ababa University",
                academicYear: u.academicYear || "AAU 4 Kilo",
                bio: "Rooted in Christ.",
                streakDays: 1,
                followersCount: 1,
                followingCount: 1,
                postsCount: 0,
                isFollowing: !!u.isFollowing,
              })),
            );
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsSearching(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const textColor = isDark ? "#ffffff" : "#0f172a";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#27272a" : "#e2e8f0";
  const bg = isDark ? "#09090b" : "#ffffff";
  const searchInputBg = isDark ? "#202327" : "#eff3f4";
  const cardBg = isDark ? "#18181b" : "#f8fafc";

  // Filtered members list
  const memberList = useMemo(() => Object.values(members), [members]);

  const matchingPosts = useMemo(() => {
    if (!query.trim()) return [];
    if (apiPosts.length > 0) return apiPosts;
    const q = query.toLowerCase().trim();
    return posts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        p.authorHandle.toLowerCase().includes(q)
    );
  }, [apiPosts, posts, query]);

  const matchingMembers = useMemo(() => {
    if (!query.trim()) return [];
    if (apiMembers.length > 0) return apiMembers;
    const q = query.toLowerCase().trim();
    return memberList.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.handle.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.team.toLowerCase().includes(q)
    );
  }, [apiMembers, memberList, query]);

  const handleSelectTag = (tag: string) => {
    Haptics.selectionAsync().catch(() => {});
    setQuery(tag);
    if (!recentSearches.includes(tag)) {
      setRecentSearches((prev) => [tag, ...prev.slice(0, 4)]);
    }
  };

  const handleClearRecent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRecentSearches([]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Search Header */}
      <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>

        <View style={[styles.searchInputWrapper, { backgroundColor: searchInputBg }]}>
          <Ionicons name="search" size={18} color={mutedColor} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search posts, people, tags..."
            placeholderTextColor={mutedColor}
            autoFocus
            returnKeyType="search"
            style={[styles.searchInput, { color: textColor }]}
          />
          {isSearching ? (
            <ActivityIndicator
              size="small"
              color={PRIMARY}
              style={{ marginRight: 4 }}
            />
          ) : query.length > 0 ? (
            <TouchableOpacity
              onPress={() => setQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={mutedColor} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Scope Filter Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: borderColor }]}>
        {(["all", "posts", "people", "media"] as const).map((tab) => {
          const isSelected = activeTab === tab;
          const label =
            tab === "all"
              ? "Top"
              : tab === "posts"
                ? "Discussions"
                : tab === "people"
                  ? "Members"
                  : "Photos";
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
              {isSelected && <View style={[styles.tabActiveBar, { backgroundColor: PRIMARY }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* If Query is Empty: Show Trending, Recents, and Recommended Members */}
        {!query.trim() ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.exploreContent}
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Searches</Text>
                  <TouchableOpacity onPress={handleClearRecent}>
                    <Text style={[styles.clearBtnText, { color: PRIMARY }]}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.recentTagsWrap}>
                  {recentSearches.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.7}
                      onPress={() => handleSelectTag(item)}
                      style={[styles.recentPill, { backgroundColor: cardBg, borderColor }]}
                    >
                      <Ionicons name="time-outline" size={14} color={mutedColor} />
                      <Text style={[styles.recentPillText, { color: textColor }]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Trending in 4 Kilo Fellowship */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Trending in 4 Kilo Fellowship
              </Text>
              <View style={styles.trendingList}>
                {trendingTags.map((t, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.75}
                    onPress={() => handleSelectTag(t.tag)}
                    style={[styles.trendingRow, { borderBottomColor: borderColor }]}
                  >
                    <View style={styles.trendingInfo}>
                      <Text style={[styles.trendingCategory, { color: mutedColor }]}>
                        {t.category} · Trending
                      </Text>
                      <Text style={[styles.trendingTag, { color: textColor }]}>{t.tag}</Text>
                      <Text style={[styles.trendingCount, { color: mutedColor }]}>{t.count}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={mutedColor} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recommended Fellowship Members */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Fellowship Ministry Leads & Students
              </Text>
              <View style={styles.membersList}>
                {memberList.slice(0, 4).map((member) => (
                  <View
                    key={member.id}
                    style={[styles.memberCard, { backgroundColor: cardBg, borderColor }]}
                  >
                    <ProfileLink
                      user={{
                        id: member.id,
                        name: member.fullName,
                        username: member.handle,
                        avatarUrl: member.avatar,
                        team: member.team,
                        department: member.department,
                      }}
                      size={52}
                      style={{ flex: 1 }}
                    >
                      <View style={[styles.memberInfo, { flex: 1, marginLeft: 12 }]}>
                        <Text numberOfLines={1} style={[styles.memberName, { color: textColor }]}>
                          {member.fullName}
                        </Text>
                        <Text numberOfLines={1} style={[styles.memberHandle, { color: mutedColor }]}>
                          {member.handle} · {member.department}
                        </Text>
                        <View style={styles.streakBadge}>
                          <Ionicons name="flame" size={13} color="#f97316" />
                          <Text style={styles.streakText}>{member.streakDays}d Streak</Text>
                        </View>
                      </View>
                    </ProfileLink>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={(e) => {
                        e.stopPropagation();
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        toggleFollowMember(member.id);
                      }}
                      style={[
                        styles.followBtn,
                        {
                          backgroundColor: member.isFollowing ? "transparent" : PRIMARY,
                          borderColor: member.isFollowing ? borderColor : PRIMARY,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.followBtnText,
                          { color: member.isFollowing ? textColor : "#ffffff" },
                        ]}
                      >
                        {member.isFollowing ? "Following" : "Connect"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          /* Search Results Active */
          <FlatList
            data={
              activeTab === "people"
                ? (matchingMembers as any[])
                : (matchingPosts as any[])
            }
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={mutedColor} />
                <Text style={[styles.emptyTitle, { color: textColor }]}>No results found</Text>
                <Text style={[styles.emptySubtitle, { color: mutedColor }]}>
                  {`We couldn't find any fellowship posts or members matching "${query}". Try checking spelling or searching for a different keyword or hashtag.`}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              if (activeTab === "people" || "department" in item) {
                const member = item as MemberProfile;
                return (
                  <View
                    style={[
                      styles.memberCard,
                      {
                        backgroundColor: cardBg,
                        borderColor,
                        marginHorizontal: 16,
                        marginBottom: 10,
                      },
                    ]}
                  >
                    <ProfileLink
                      user={{
                        id: member.id,
                        name: member.fullName,
                        username: member.handle,
                        avatarUrl: member.avatar,
                        team: member.team,
                        department: member.department,
                      }}
                      size={52}
                      style={{ flex: 1 }}
                    >
                      <View style={[styles.memberInfo, { flex: 1, marginLeft: 12 }]}>
                        <Text numberOfLines={1} style={[styles.memberName, { color: textColor }]}>
                          {member.fullName}
                        </Text>
                        <Text numberOfLines={1} style={[styles.memberHandle, { color: mutedColor }]}>
                          {member.handle} · {member.team}
                        </Text>
                        <Text numberOfLines={1} style={[styles.memberBio, { color: mutedColor }]}>
                          {member.bio}
                        </Text>
                      </View>
                    </ProfileLink>
                  </View>
                );
              }

              const post = item as CommunityPost;
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push(`/community/${post.id}` as any)}
                  style={[styles.resultPostCard, { borderBottomColor: borderColor }]}
                >
                  <View style={styles.resultAuthorRow}>
                    <ProfileLink
                      user={{
                        id: post.authorId || "user-fellowship",
                        name: post.authorName,
                        username: post.authorHandle,
                        avatarUrl: post.authorAvatar,
                      }}
                      size={40}
                    />
                    <ProfileLink
                      user={{
                        id: post.authorId || "user-fellowship",
                        name: post.authorName,
                        username: post.authorHandle,
                        avatarUrl: post.authorAvatar,
                      }}
                      showAvatar={false}
                      style={[styles.resultAuthorTextCol, { marginLeft: 10 }]}
                    >
                      <Text style={[styles.resultAuthorName, { color: textColor }]}>
                        {post.authorName}
                      </Text>
                      <Text style={[styles.resultAuthorHandle, { color: mutedColor }]}>
                        {post.authorHandle} · {post.timestamp}
                      </Text>
                    </ProfileLink>
                  </View>

                  <Text numberOfLines={3} style={[styles.resultPostText, { color: textColor }]}>
                    {post.content}
                  </Text>

                  {post.image && (
                    <ExpoImage
                      source={
                        typeof post.image === "string" ? { uri: post.image } : post.image
                      }
                      style={styles.resultPostImage}
                      contentFit="cover"
                    />
                  )}

                  <View style={styles.resultMetricsRow}>
                    <View style={styles.resultMetricItem}>
                      <Ionicons name="chatbubble-outline" size={15} color={mutedColor} />
                      <Text style={[styles.resultMetricText, { color: mutedColor }]}>
                        {post.repliesCount}
                      </Text>
                    </View>
                    <View style={styles.resultMetricItem}>
                      <Ionicons name="repeat-outline" size={16} color={mutedColor} />
                      <Text style={[styles.resultMetricText, { color: mutedColor }]}>
                        {post.repostsCount}
                      </Text>
                    </View>
                    <View style={styles.resultMetricItem}>
                      <Ionicons name="heart-outline" size={15} color={mutedColor} />
                      <Text style={[styles.resultMetricText, { color: mutedColor }]}>
                        {post.likesCount}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    padding: 4,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    includeFontPadding: false,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 44,
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
  tabActiveBar: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "48%",
    borderRadius: 2,
  },
  exploreContent: {
    paddingBottom: 40,
  },
  sectionBlock: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  recentTagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  recentPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  recentPillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  trendingList: {
    borderRadius: 16,
    overflow: "hidden",
  },
  trendingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingCategory: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  trendingTag: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  trendingCount: {
    fontSize: 12,
  },
  membersList: {
    gap: 10,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e2e8f0",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
  },
  memberHandle: {
    fontSize: 13,
    marginTop: 2,
  },
  memberBio: {
    fontSize: 12,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },
  streakText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#f97316",
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  resultsListContent: {
    paddingVertical: 12,
    paddingBottom: 40,
  },
  resultPostCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  resultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
  },
  resultAuthorTextCol: {
    flex: 1,
  },
  resultAuthorName: {
    fontSize: 14,
    fontWeight: "700",
  },
  resultAuthorHandle: {
    fontSize: 12,
  },
  resultPostText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  resultPostImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  resultMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 4,
  },
  resultMetricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resultMetricText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
