import { PRIMARY } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar?: string | null;
  authorTeam: string;
  category: "Testimony" | "Prayer Request" | "Announcement" | "Encouragement";
  timestamp: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  amensCount: number;
  isLiked?: boolean;
  isAmened?: boolean;
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    authorName: "Samuel Kebede",
    authorTeam: "Worship Team",
    category: "Testimony",
    timestamp: "2h ago",
    title: "God answered our semester prayers!",
    content:
      "Just wanted to testify about God's faithfulness throughout this exam season. Our study fellowship group prayed together last week, and all 12 of us passed our difficult engineering fundamentals! All glory to Him! 🙏✨",
    likes: 42,
    commentsCount: 9,
    amensCount: 31,
  },
  {
    id: "post-2",
    authorName: "Bethlehem Haile",
    authorTeam: "Prayer Ministry",
    category: "Prayer Request",
    timestamp: "4h ago",
    title: "Prayers for Freshman Welcome Week",
    content:
      "Fellowship family, please join us in praying for the incoming freshman students this week. We are hosting orientation talks and outreach across 4 Kilo and 5 Kilo campuses. Pray for open hearts and lasting connections!",
    likes: 28,
    commentsCount: 14,
    amensCount: 56,
  },
  {
    id: "post-3",
    authorName: "Ministry Leadership",
    authorTeam: "Executive Committee",
    category: "Announcement",
    timestamp: "Yesterday",
    title: "Grand Worship Night this Friday at 6:00 PM",
    content:
      "Join the entire fellowship collective this Friday evening for an unforgettable night of deep worship, communion, and spirit-filled teaching. Come with expectant hearts and bring a friend! Location: Main Fellowship Auditorium.",
    likes: 89,
    commentsCount: 23,
    amensCount: 78,
  },
  {
    id: "post-4",
    authorName: "Yared Tadesse",
    authorTeam: "Bible Study",
    category: "Encouragement",
    timestamp: "2d ago",
    title: "A verse that anchored my week",
    content:
      "\"Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.\" — Proverbs 3:5-6. Whatever mountain you face today, hand it over to Him.",
    likes: 64,
    commentsCount: 7,
    amensCount: 45,
  },
];

const CATEGORIES = [
  "All",
  "Testimonies",
  "Prayer Requests",
  "Announcements",
  "Encouragement",
] as const;

export default function CommunityScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useUserStore();
  const { authState } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // New post modal state
  const [composeModalVisible, setComposeModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<
    "Testimony" | "Prayer Request" | "Announcement" | "Encouragement"
  >("Testimony");

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const handleToggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === id) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
          };
        }
        return post;
      }),
    );
  };

  const handleToggleAmen = (id: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === id) {
          const isAmened = !post.isAmened;
          return {
            ...post,
            isAmened,
            amensCount: isAmened
              ? post.amensCount + 1
              : Math.max(0, post.amensCount - 1),
          };
        }
        return post;
      }),
    );
  };

  const handleSharePost = async (post: CommunityPost) => {
    try {
      await Share.share({
        message: `${post.title}\n\n${post.content}\n\n— Shared via My Fellowship Community`,
      });
    } catch {
      // ignore
    }
  };

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: user?.fullName || "Fellowship Member",
      authorAvatar: user?.profileImage || null,
      authorTeam:
        typeof user?.team === "string"
          ? user.team
          : (user?.team as any)?.name || "Fellowship Collective",
      category: newCategory,
      timestamp: "Just now",
      title: newTitle.trim(),
      content: newContent.trim(),
      likes: 1,
      commentsCount: 0,
      amensCount: 1,
      isLiked: true,
      isAmened: true,
    };

    setPosts([newPost, ...posts]);
    setNewTitle("");
    setNewContent("");
    setComposeModalVisible(false);
  };

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") return posts;
    if (selectedCategory === "Testimonies")
      return posts.filter((p) => p.category === "Testimony");
    if (selectedCategory === "Prayer Requests")
      return posts.filter((p) => p.category === "Prayer Request");
    if (selectedCategory === "Announcements")
      return posts.filter((p) => p.category === "Announcement");
    if (selectedCategory === "Encouragement")
      return posts.filter((p) => p.category === "Encouragement");
    return posts;
  }, [posts, selectedCategory]);

  const getCategoryColor = (cat: CommunityPost["category"]) => {
    switch (cat) {
      case "Testimony":
        return "#10b981";
      case "Prayer Request":
        return "#8b5cf6";
      case "Announcement":
        return PRIMARY;
      case "Encouragement":
        return "#0284c7";
      default:
        return PRIMARY;
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isDark ? "#121212" : "#f8fafc" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: top + 12,
            backgroundColor: isDark ? "#121212" : "#ffffff",
            borderBottomColor: isDark ? "#262626" : "#f1f5f9",
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.headerTitle,
                { color: isDark ? "#ffffff" : "#0f172a" },
              ]}
            >
              Community
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              Fellowship stories, testimonies & prayers
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setComposeModalVisible(true)}
            style={styles.composeHeaderBtn}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.composeHeaderBtnText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected
                      ? PRIMARY
                      : isDark
                        ? "#1e293b"
                        : "#f1f5f9",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected
                        ? "#ffffff"
                        : isDark
                          ? "#94a3b8"
                          : "#64748b",
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Posts Feed */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.feedContainer,
          { paddingBottom: bottom + 90 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
        renderItem={({ item }) => {
          const badgeColor = getCategoryColor(item.category);
          return (
            <View
              style={[
                styles.postCard,
                {
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                },
              ]}
            >
              {/* Author Row */}
              <View style={styles.authorRow}>
                <View style={[styles.avatarCircle, { backgroundColor: badgeColor }]}>
                  {item.authorAvatar ? (
                    <Image
                      source={{ uri: item.authorAvatar }}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <Text style={styles.avatarInitial}>
                      {item.authorName.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.authorName,
                      { color: isDark ? "#f8fafc" : "#0f172a" },
                    ]}
                  >
                    {item.authorName}
                  </Text>
                  <View style={styles.authorMetaRow}>
                    <Text
                      style={[
                        styles.authorTeam,
                        { color: isDark ? "#94a3b8" : "#64748b" },
                      ]}
                    >
                      {item.authorTeam}
                    </Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text
                      style={[
                        styles.timestamp,
                        { color: isDark ? "#64748b" : "#94a3b8" },
                      ]}
                    >
                      {item.timestamp}
                    </Text>
                  </View>
                </View>

                {/* Category Chip */}
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: `${badgeColor}18` },
                  ]}
                >
                  <Text
                    style={[styles.categoryBadgeText, { color: badgeColor }]}
                  >
                    {item.category}
                  </Text>
                </View>
              </View>

              {/* Title & Content */}
              <Text
                style={[
                  styles.postTitle,
                  { color: isDark ? "#ffffff" : "#0f172a" },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.postContent,
                  { color: isDark ? "#cbd5e1" : "#334155" },
                ]}
              >
                {item.content}
              </Text>

              {/* Engagement Bar */}
              <View
                style={[
                  styles.engagementBar,
                  { borderTopColor: isDark ? "#334155" : "#f1f5f9" },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggleLike(item.id)}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name={item.isLiked ? "heart" : "heart-outline"}
                    size={20}
                    color={item.isLiked ? "#ef4444" : isDark ? "#94a3b8" : "#64748b"}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      {
                        color: item.isLiked
                          ? "#ef4444"
                          : isDark
                            ? "#94a3b8"
                            : "#64748b",
                      },
                    ]}
                  >
                    {item.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggleAmen(item.id)}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name={item.isAmened ? "flame" : "flame-outline"}
                    size={20}
                    color={
                      item.isAmened
                        ? PRIMARY
                        : isDark
                          ? "#94a3b8"
                          : "#64748b"
                    }
                  />
                  <Text
                    style={[
                      styles.actionText,
                      {
                        color: item.isAmened
                          ? PRIMARY
                          : isDark
                            ? "#94a3b8"
                            : "#64748b",
                      },
                    ]}
                  >
                    {item.amensCount} Amen
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSharePost(item)}
                  style={[styles.actionBtn, { marginLeft: "auto" }]}
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={19}
                    color={isDark ? "#94a3b8" : "#64748b"}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      { color: isDark ? "#94a3b8" : "#64748b" },
                    ]}
                  >
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={56}
              color={isDark ? "#475569" : "#cbd5e1"}
            />
            <Text
              style={[
                styles.emptyTitle,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              No posts found
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              Be the first to share an encouragement or prayer request!
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => setComposeModalVisible(true)}
        style={[styles.fab, { bottom: bottom + 76 }]}
      >
        <Ionicons name="pencil" size={22} color="#ffffff" />
      </TouchableOpacity>

      {/* Compose Post Modal */}
      <Modal
        visible={composeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setComposeModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={[
                styles.composeCard,
                {
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  paddingBottom: Math.max(bottom + 16, 24),
                },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.composeHeader}>
                <Text
                  style={[
                    styles.composeTitle,
                    { color: isDark ? "#ffffff" : "#0f172a" },
                  ]}
                >
                  Share with Fellowship
                </Text>
                <TouchableOpacity
                  onPress={() => setComposeModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={isDark ? "#cbd5e1" : "#64748b"}
                  />
                </TouchableOpacity>
              </View>

              {/* Category Selector */}
              <Text
                style={[
                  styles.composeFieldLabel,
                  { color: isDark ? "#94a3b8" : "#64748b" },
                ]}
              >
                SELECT TYPE
              </Text>
              <View style={styles.composeCategoryRow}>
                {(
                  [
                    "Testimony",
                    "Prayer Request",
                    "Announcement",
                    "Encouragement",
                  ] as const
                ).map((cat) => {
                  const isCatSelected = newCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.8}
                      onPress={() => setNewCategory(cat)}
                      style={[
                        styles.composeCategoryBtn,
                        {
                          backgroundColor: isCatSelected
                            ? PRIMARY
                            : isDark
                              ? "#334155"
                              : "#f1f5f9",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.composeCategoryText,
                          {
                            color: isCatSelected
                              ? "#ffffff"
                              : isDark
                                ? "#cbd5e1"
                                : "#475569",
                            fontWeight: isCatSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Inputs */}
              <TextInput
                placeholder="Title or headline..."
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                value={newTitle}
                onChangeText={setNewTitle}
                style={[
                  styles.titleInput,
                  {
                    color: isDark ? "#ffffff" : "#0f172a",
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    borderColor: isDark ? "#334155" : "#e2e8f0",
                  },
                ]}
              />

              <TextInput
                placeholder="Share your story, prayer request, or encouragement..."
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                value={newContent}
                onChangeText={setNewContent}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={[
                  styles.contentInput,
                  {
                    color: isDark ? "#ffffff" : "#0f172a",
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    borderColor: isDark ? "#334155" : "#e2e8f0",
                  },
                ]}
              />

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCreatePost}
                disabled={!newTitle.trim() || !newContent.trim()}
                style={[
                  styles.publishBtn,
                  {
                    opacity:
                      !newTitle.trim() || !newContent.trim() ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={styles.publishBtnText}>Publish to Community</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
  },
  composeHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  composeHeaderBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  categoriesList: {
    gap: 8,
    paddingRight: 20,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  categoryPillText: {
    fontSize: 13,
  },
  feedContainer: {
    padding: 16,
    gap: 14,
  },
  postCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarInitial: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
  },
  authorMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  authorTeam: {
    fontSize: 12,
    fontWeight: "600",
  },
  metaDot: {
    marginHorizontal: 6,
    color: "#94a3b8",
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  postTitle: {
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
    marginBottom: 14,
  },
  engagementBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 18,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 260,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  composeCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },
  composeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  composeTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  composeFieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  composeCategoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  composeCategoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  composeCategoryText: {
    fontSize: 12,
  },
  titleInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  contentInput: {
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    marginBottom: 18,
  },
  publishBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  publishBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
