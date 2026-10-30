import { ImageViewerModal } from "@/components/ImageViewerModal";
import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import {
  CommunityComment,
  useCommunityStore,
} from "@/stores/community.store";
import { useUserStore } from "@/stores/user.store";
import { getPrefilledAvatar } from "@/utils/avatar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useUserStore();

  const post = useCommunityStore((s) => s.getPostById(id as string));
  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const toggleRepost = useCommunityStore((s) => s.toggleRepost);
  const toggleBookmark = useCommunityStore((s) => s.toggleBookmark);
  const addComment = useCommunityStore((s) => s.addComment);
  const toggleLikeComment = useCommunityStore((s) => s.toggleLikeComment);

  const [commentText, setCommentText] = useState("");
  const [lightboxVisible, setLightboxVisible] = useState(false);

  const textColor = isDark ? "#ffffff" : "#0f172a";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#27272a" : "#e2e8f0";
  const bg = isDark ? "#09090b" : "#ffffff";
  const inputBg = isDark ? "#18181b" : "#f1f5f9";

  const userAvatar =
    user?.profileImage ||
    getPrefilledAvatar(user?.phoneNumber || user?.id);

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={mutedColor} />
          <Text style={[styles.notFoundTitle, { color: textColor }]}>Post Not Found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backHomeBtn, { backgroundColor: PRIMARY }]}
          >
            <Text style={styles.backHomeText}>Back to Community</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      Haptics.selectionAsync().catch(() => {});
      await Share.share({
        message: `${post.content}\n\n— ${post.authorName} (${post.authorHandle}) on 4 Kilo Fellowship`,
      });
    } catch {}
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const newComment: CommunityComment = {
      id: `c-${Date.now()}`,
      postId: post.id,
      authorId: user?.id || "user-current",
      authorName: user?.fullName || "Fellowship Member",
      authorHandle: user?.telegramUserName
        ? `@${user.telegramUserName.replace(/^@/, "")}`
        : `@${(user?.fullName || "member").toLowerCase().replace(/\s+/g, "")}`,
      authorAvatar: userAvatar,
      timestamp: "Just now",
      content: commentText.trim(),
      likesCount: 0,
      isLiked: false,
    };

    addComment(post.id, newComment);
    setCommentText("");
  };

  const commentsList = post.comments || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.topHeader, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: textColor }]}>Post</Text>

        <TouchableOpacity
          onPress={handleShare}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.headerBtn}
        >
          <Ionicons name="share-outline" size={22} color={textColor} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        style={{ flex: 1 }}
      >
        <FlatList
          data={commentsList}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          ListHeaderComponent={
            <View style={[styles.postDetailCard, { borderBottomColor: borderColor }]}>
              {/* Author Row */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push(`/community/user/${post.authorId || "user-fellowship"}` as any)
                }
                style={styles.authorRow}
              >
                <ExpoImage
                  source={
                    typeof post.authorAvatar === "string"
                      ? { uri: post.authorAvatar }
                      : post.authorAvatar || { uri: getPrefilledAvatar(post.authorHandle) }
                  }
                  style={styles.authorAvatar}
                  contentFit="cover"
                />
                <View style={styles.authorCol}>
                  <View style={styles.authorNameRow}>
                    <Text style={[styles.authorName, { color: textColor }]}>
                      {post.authorName}
                    </Text>
                    {post.isVerified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={PRIMARY}
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </View>
                  <Text style={[styles.authorHandle, { color: mutedColor }]}>
                    {post.authorHandle} · {post.authorTeam || "Fellowship Member"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Main Content Body */}
              <Text style={[styles.postBodyText, { color: textColor }]}>
                {post.content}
              </Text>

              {/* Attached Image */}
              {post.image && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setLightboxVisible(true)}
                  style={styles.postImageWrap}
                >
                  <ExpoImage
                    source={
                      typeof post.image === "string" ? { uri: post.image } : post.image
                    }
                    style={styles.postDetailImg}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              )}

              {/* Full Timestamp & Location */}
              <View style={styles.timestampRow}>
                <Text style={[styles.timestampText, { color: mutedColor }]}>
                  {post.timestamp} · Addis Ababa, AAU 4 Kilo
                </Text>
              </View>

              {/* Engagement Stats Bar */}
              <View style={[styles.metricsBar, { borderTopColor: borderColor, borderBottomColor: borderColor }]}>
                <Text style={[styles.metricStat, { color: textColor }]}>
                  <Text style={styles.metricBold}>{post.repostsCount}</Text>{" "}
                  <Text style={{ color: mutedColor }}>Reposts</Text>
                </Text>
                <Text style={[styles.metricStat, { color: textColor }]}>
                  <Text style={styles.metricBold}>{post.likesCount}</Text>{" "}
                  <Text style={{ color: mutedColor }}>Likes</Text>
                </Text>
                <Text style={[styles.metricStat, { color: textColor }]}>
                  <Text style={styles.metricBold}>{post.repliesCount}</Text>{" "}
                  <Text style={{ color: mutedColor }}>Comments</Text>
                </Text>
              </View>

              {/* Post Action Buttons Row */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                  }}
                  style={styles.actionBtn}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={mutedColor} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    toggleRepost(post.id);
                  }}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name="repeat-outline"
                    size={22}
                    color={post.isReposted ? "#00ba7c" : mutedColor}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    toggleLike(post.id);
                  }}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name={post.isLiked ? "heart" : "heart-outline"}
                    size={21}
                    color={post.isLiked ? "#f91880" : mutedColor}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    toggleBookmark(post.id);
                  }}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name={post.isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={post.isBookmarked ? PRIMARY : mutedColor}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleShare}
                  style={styles.actionBtn}
                >
                  <Ionicons name="share-outline" size={20} color={mutedColor} />
                </TouchableOpacity>
              </View>

              {/* Discussion Header */}
              <View style={styles.discussionHeader}>
                <Text style={[styles.discussionTitle, { color: textColor }]}>
                  Discussion ({commentsList.length})
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyCommentsWrap}>
              <Ionicons name="chatbubbles-outline" size={36} color={mutedColor} />
              <Text style={[styles.emptyCommentsText, { color: mutedColor }]}>
                No replies yet. Be the first to share an encouraging thought or prayer!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.commentRow, { borderBottomColor: borderColor }]}>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/community/user/${item.authorId}` as any)
                }
              >
                <ExpoImage
                  source={
                    typeof item.authorAvatar === "string"
                      ? { uri: item.authorAvatar }
                      : item.authorAvatar || { uri: getPrefilledAvatar(item.authorHandle) }
                  }
                  style={styles.commentAvatar}
                  contentFit="cover"
                />
              </TouchableOpacity>
              <View style={styles.commentContentCol}>
                <View style={styles.commentAuthorRow}>
                  <Text style={[styles.commentAuthorName, { color: textColor }]}>
                    {item.authorName}
                  </Text>
                  <Text style={[styles.commentHandle, { color: mutedColor }]}>
                    {item.authorHandle} · {item.timestamp}
                  </Text>
                </View>
                <Text style={[styles.commentText, { color: textColor }]}>
                  {item.content}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleLikeComment(post.id, item.id)}
                  style={styles.commentLikeBtn}
                >
                  <Ionicons
                    name={item.isLiked ? "heart" : "heart-outline"}
                    size={15}
                    color={item.isLiked ? "#f91880" : mutedColor}
                  />
                  {item.likesCount > 0 && (
                    <Text
                      style={[
                        styles.commentLikesCount,
                        { color: item.isLiked ? "#f91880" : mutedColor },
                      ]}
                    >
                      {item.likesCount}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Pinned Bottom Comment Composer */}
        <View
          style={[
            styles.bottomComposer,
            {
              backgroundColor: bg,
              borderTopColor: borderColor,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <ExpoImage
            source={{ uri: userAvatar }}
            style={styles.composerAvatar}
            contentFit="cover"
          />
          <View style={[styles.composerInputWrap, { backgroundColor: inputBg }]}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder={`Reply to ${post.authorName}...`}
              placeholderTextColor={mutedColor}
              multiline
              style={[styles.composerInput, { color: textColor }]}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
            style={[
              styles.sendCommentBtn,
              {
                backgroundColor: commentText.trim()
                  ? PRIMARY
                  : isDark
                    ? "rgba(255, 103, 25, 0.3)"
                    : "rgba(255, 103, 25, 0.45)",
              },
            ]}
          >
            <Ionicons name="paper-plane" size={17} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Lightbox for post media */}
      <ImageViewerModal
        visible={lightboxVisible}
        imageUri={post.image}
        caption={post.content}
        authorName={post.authorName}
        onClose={() => setLightboxVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  postDetailCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2e8f0",
  },
  authorCol: {
    marginLeft: 12,
    flex: 1,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 16,
    fontWeight: "700",
  },
  authorHandle: {
    fontSize: 13,
    marginTop: 2,
  },
  postBodyText: {
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 14,
  },
  postImageWrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
  },
  postDetailImg: {
    width: "100%",
    height: 220,
    borderRadius: 16,
  },
  timestampRow: {
    marginBottom: 14,
  },
  timestampText: {
    fontSize: 13,
  },
  metricsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  metricStat: {
    fontSize: 14,
  },
  metricBold: {
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  actionBtn: {
    padding: 8,
  },
  discussionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  commentRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
  },
  commentContentCol: {
    flex: 1,
  },
  commentAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: "700",
  },
  commentHandle: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentLikeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  commentLikesCount: {
    fontSize: 12,
  },
  emptyCommentsWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 10,
  },
  emptyCommentsText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  bottomComposer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  composerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
  },
  composerInputWrap: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxHeight: 90,
  },
  composerInput: {
    fontSize: 14,
    lineHeight: 20,
  },
  sendCommentBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  backHomeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backHomeText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
