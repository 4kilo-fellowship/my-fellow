import api from "./api";
import {
  ApiPost,
  FeedResponse,
  MutualFollowersData,
  ProfileDetail,
  SocialSearchResult,
  StoryHighlight,
  StreakMe,
  SuggestedUser,
  ThreadResponse,
  TrendingTag,
  UserMinistry,
  UserSummary,
} from "@/types/social.types";
import { Video } from "@/constants/videos";

/**
 * Helper to unwrap responses whether wrapped in ApiResponse ({ success, data })
 * or returned directly.
 */
function unwrap<T>(response: any): T {
  if (response?.data?.data !== undefined) {
    return response.data.data as T;
  }
  return response?.data as T;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds < 1) return "Video";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function normalizeContentVideo(item: any): Video {
  const thumbnail =
    typeof item.thumbnail === "string"
      ? item.thumbnail
      : item.thumbnail?.urls?.md ||
        item.thumbnail?.urls?.original ||
        "";
  const publishedAt = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString()
    : "Recently";

  return {
    id: String(item.id),
    title: item.title,
    desc: item.description || "",
    duration: item.duration || formatDuration(item.durationSeconds),
    thumbnail,
    videoUrl: item.videoUrl || item.playbackUrl,
    speaker: item.speaker,
    views: item.views,
    publishedAt,
  };
}

export const socialApi = {
  /**
   * Fetch home / community feed (Following or For You)
   */
  async getFeed(
    type: "following" | "foryou" = "foryou",
    cursor?: string | null,
  ): Promise<FeedResponse> {
    const res = await api.get(`/v1/feed/${type}`, {
      params: cursor ? { cursor } : undefined,
    });
    const data = unwrap<any>(res);
    if (Array.isArray(data)) {
      return {
        items: data,
        nextCursor: null,
        hasMore: false,
      };
    }
    return data as FeedResponse;
  },

  /**
   * Upload an image file for community posts
   */
  async uploadMediaFile(
    uri: string,
    purpose: "post" | "avatar" | "cover" = "post",
  ): Promise<{ assetId: string; url: string }> {
    const formData = new FormData();
    const filename = uri.split("/").pop() || "upload.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append("image", {
      uri,
      name: filename,
      type,
    } as any);
    formData.append("purpose", purpose);

    const res = await api.post("/v1/media/upload-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    const data = unwrap<any>(res);
    return {
      assetId: data?.assetId || data?.asset?.id,
      url: data?.asset?.urls?.original || data?.asset?.urls?.lg || uri,
    };
  },

  /**
   * Create a new post, reply, or quote
   */
  async createPost(payload: {
    body: string;
    kind?: "post" | "reply" | "quote";
    parentId?: string;
    quotedId?: string;
    mediaAssetIds?: string[];
  }): Promise<ApiPost> {
    const res = await api.post("/v1/posts", payload);
    return unwrap<ApiPost>(res);
  },

  /**
   * Like a post
   */
  async likePost(
    id: string,
  ): Promise<{ success: boolean; likesCount?: number; isLiked?: boolean }> {
    try {
      const res = await api.put(`/v1/posts/${id}/like`);
      return unwrap(res) ?? { success: true };
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallback = await api.post(`/v1/posts/${id}/like`);
        return unwrap(fallback) ?? { success: true };
      }
      throw err;
    }
  },

  /**
   * Delete a post
   */
  async deletePost(id: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/v1/posts/${id}`);
    return unwrap(res) ?? { success: true };
  },

  /**
   * Unlike a post
   */
  async unlikePost(
    id: string,
  ): Promise<{ success: boolean; likesCount?: number; isLiked?: boolean }> {
    const res = await api.delete(`/v1/posts/${id}/like`);
    return unwrap(res) ?? { success: true };
  },

  /**
   * Bookmark a post
   */
  async bookmarkPost(
    id: string,
  ): Promise<{ success: boolean; isBookmarked?: boolean }> {
    try {
      const res = await api.put(`/v1/posts/${id}/bookmark`);
      return unwrap(res) ?? { success: true };
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallback = await api.post(`/v1/posts/${id}/bookmark`);
        return unwrap(fallback) ?? { success: true };
      }
      throw err;
    }
  },

  /**
   * Unbookmark a post
   */
  async unbookmarkPost(
    id: string,
  ): Promise<{ success: boolean; isBookmarked?: boolean }> {
    const res = await api.delete(`/v1/posts/${id}/bookmark`);
    return unwrap(res) ?? { success: true };
  },

  /**
   * Repost a post
   */
  async repostPost(
    id: string,
  ): Promise<{ success: boolean; repostsCount?: number; isReposted?: boolean }> {
    try {
      const res = await api.put(`/v1/posts/${id}/repost`);
      return unwrap(res) ?? { success: true };
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallback = await api.post(`/v1/posts/${id}/repost`);
        return unwrap(fallback) ?? { success: true };
      }
      throw err;
    }
  },

  /**
   * Unrepost a post
   */
  async unrepostPost(
    id: string,
  ): Promise<{ success: boolean; repostsCount?: number; isReposted?: boolean }> {
    const res = await api.delete(`/v1/posts/${id}/repost`);
    return unwrap(res) ?? { success: true };
  },

  /**
   * Fetch a full post thread (ancestors, focused post, replies)
   */
  async getPostThread(id: string): Promise<ThreadResponse> {
    try {
      const res = await api.get(`/v1/posts/${id}/thread`);
      return unwrap<ThreadResponse>(res);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Fallback to get single post
        const res = await api.get(`/v1/posts/${id}`);
        const post = unwrap<ApiPost>(res);
        return {
          post,
          ancestors: [],
          replies: [],
        };
      }
      throw err;
    }
  },

  /**
   * Who to follow suggestions
   */
  async getWhoToFollow(): Promise<SuggestedUser[]> {
    try {
      const res = await api.get("/v1/suggestions/users");
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.users || data?.items || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get("/v1/users/suggestions");
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.users || data?.items || [];
      }
      throw err;
    }
  },

  /**
   * Follow a user
   */
  async followUser(
    id: string,
  ): Promise<{ success: boolean; isFollowing?: boolean; followersCount?: number }> {
    try {
      const res = await api.put(`/v1/users/${id}/follow`);
      return unwrap(res) ?? { success: true };
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        const fallback = await api.post(`/v1/users/${id}/follow`);
        return unwrap(fallback) ?? { success: true };
      }
      throw err;
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(
    id: string,
  ): Promise<{ success: boolean; isFollowing?: boolean; followersCount?: number }> {
    const res = await api.delete(`/v1/users/${id}/follow`);
    return unwrap(res) ?? { success: true };
  },

  /**
   * Dismiss a suggestion card
   */
  async dismissSuggestion(id: string): Promise<{ success: boolean }> {
    try {
      const res = await api.delete(`/v1/suggestions/users/${id}`);
      return unwrap(res) ?? { success: true };
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.delete(`/v1/users/${id}/suggestions`);
        return unwrap(fallback) ?? { success: true };
      }
      throw err;
    }
  },

  /**
   * Get user profile details
   */
  async getUserProfile(usernameOrId: string): Promise<ProfileDetail> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}`);
      return unwrap<ProfileDetail>(res);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/profile`);
        return unwrap<ProfileDetail>(fallback);
      }
      throw err;
    }
  },

  /**
   * Get user posts
   */
  async getUserPosts(usernameOrId: string): Promise<ApiPost[]> {
    const res = await api.get(`/v1/profiles/${usernameOrId}/posts`);
    const data = unwrap<any>(res);
    return Array.isArray(data) ? data : data?.items || data?.posts || [];
  },

  /**
   * Get user liked posts
   */
  async getUserLikedPosts(usernameOrId: string): Promise<ApiPost[]> {
    const res = await api.get(`/v1/profiles/${usernameOrId}/likes`);
    const data = unwrap<any>(res);
    return Array.isArray(data) ? data : data?.items || data?.posts || [];
  },

  /**
   * Get user highlights
   */
  async getUserHighlights(usernameOrId: string): Promise<StoryHighlight[]> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/highlights`);
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.items || data?.highlights || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/highlights`);
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.items || data?.highlights || [];
      }
      throw err;
    }
  },

  /**
   * Get user ministries and service schedule
   */
  async getUserMinistries(usernameOrId: string): Promise<UserMinistry[]> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/ministries`);
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.items || data?.ministries || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/ministries`);
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.items || data?.ministries || [];
      }
      throw err;
    }
  },

  /**
   * Get user followers list
   */
  async getUserFollowers(usernameOrId: string): Promise<UserSummary[]> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/followers`);
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.items || data?.users || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/followers`);
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.items || data?.users || [];
      }
      throw err;
    }
  },

  /**
   * Get user following list
   */
  async getUserFollowing(usernameOrId: string): Promise<UserSummary[]> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/following`);
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.items || data?.users || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/following`);
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.items || data?.users || [];
      }
      throw err;
    }
  },

  /**
   * Get mutual followers between viewer and candidate
   */
  async getUserMutuals(usernameOrId: string): Promise<MutualFollowersData> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/mutuals`);
      const data = unwrap<any>(res);
      if (Array.isArray(data)) {
        return { total: data.length, users: data };
      }
      const list = data?.items || data?.users || [];
      return {
        total: data?.total ?? list.length,
        users: list,
      };
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/mutuals`);
        const data = unwrap<any>(fallback);
        if (Array.isArray(data)) {
          return { total: data.length, users: data };
        }
        const list = data?.items || data?.users || [];
        return {
          total: data?.total ?? list.length,
          users: list,
        };
      }
      throw err;
    }
  },

  /**
   * Curated media library / videos
   */
  async getContentVideos(): Promise<Video[]> {
    try {
      const res = await api.get("/v1/content/videos");
      const data = unwrap<any>(res);
      const items = Array.isArray(data) ? data : data?.videos || data?.items || [];
      return items.map(normalizeContentVideo);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get("/content/videos");
        const data = unwrap<any>(fallback);
        const items = Array.isArray(data) ? data : data?.videos || data?.items || [];
        return items.map(normalizeContentVideo);
      }
      throw err;
    }
  },

  async createContentVideo(input: {
    title: string;
    description?: string;
    video: { uri: string; name: string; type: string };
    thumbnail?: { uri: string; name: string; type: string };
  }): Promise<Video> {
    const formData = new FormData();
    formData.append("title", input.title);
    if (input.description) formData.append("description", input.description);
    formData.append("video", input.video as any);
    if (input.thumbnail) formData.append("thumbnail", input.thumbnail as any);

    const res = await api.post("/v1/content/videos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 180000,
    });
    return normalizeContentVideo(unwrap<any>(res));
  },

  /**
   * Current user's devotion & prayer streak
   */
  async getStreakMe(): Promise<StreakMe> {
    try {
      const res = await api.get("/v1/streak");
      return unwrap<StreakMe>(res);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get("/v1/streaks/me");
        return unwrap<StreakMe>(fallback);
      }
      throw err;
    }
  },

  /**
   * Check in daily streak
   */
  async checkInStreak(): Promise<StreakMe> {
    try {
      const res = await api.post("/v1/streak/check-in");
      return unwrap<StreakMe>(res);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.post("/v1/streaks/checkin");
        return unwrap<StreakMe>(fallback);
      }
      throw err;
    }
  },

  /**
   * Unread notification count
   */
  async getUnreadNotificationsCount(): Promise<{ count: number }> {
    try {
      const res = await api.get("/v1/notifications/unread-count");
      const data = unwrap<any>(res);
      return typeof data === "number"
        ? { count: data }
        : { count: data?.count ?? 0 };
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get("/notifications/unread-count");
        const data = unwrap<any>(fallback);
        return typeof data === "number"
          ? { count: data }
          : { count: data?.count ?? 0 };
      }
      throw err;
    }
  },

  /**
   * Social search for users, posts, or tags
   */
  async searchSocial(
    query: string,
    type: "all" | "people" | "posts" = "all",
  ): Promise<SocialSearchResult> {
    const res = await api.get("/v1/search", {
      params: { q: query, type },
    });
    const data = unwrap<any>(res);
    return {
      people: data?.people || data?.users || [],
      posts: data?.posts || [],
      tags: data?.tags || [],
    };
  },

  /**
   * Trending hashtags
   */
  async getTrendingTags(): Promise<TrendingTag[]> {
    try {
      const res = await api.get("/v1/trending/tags");
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.tags || data?.items || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get("/v1/search/trending");
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.tags || data?.items || [];
      }
      throw err;
    }
  },
};
