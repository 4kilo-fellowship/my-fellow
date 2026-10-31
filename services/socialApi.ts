import api from "./api";
import {
  ApiPost,
  ContentVideo,
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
   * Get user highlights
   */
  async getUserHighlights(usernameOrId: string): Promise<StoryHighlight[]> {
    try {
      const res = await api.get(`/v1/profiles/${usernameOrId}/highlights`);
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.highlights || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/highlights`);
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.highlights || [];
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
      return Array.isArray(data) ? data : data?.ministries || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/ministries`);
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.ministries || [];
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
      return {
        total: data?.total ?? (data?.users?.length || 0),
        users: data?.users || [],
      };
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get(`/v1/users/${usernameOrId}/mutuals`);
        const data = unwrap<any>(fallback);
        if (Array.isArray(data)) {
          return { total: data.length, users: data };
        }
        return {
          total: data?.total ?? (data?.users?.length || 0),
          users: data?.users || [],
        };
      }
      throw err;
    }
  },

  /**
   * Curated media library / videos
   */
  async getContentVideos(): Promise<ContentVideo[]> {
    try {
      const res = await api.get("/v1/content/videos");
      const data = unwrap<any>(res);
      return Array.isArray(data) ? data : data?.videos || data?.items || [];
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.get("/content/videos");
        const data = unwrap<any>(fallback);
        return Array.isArray(data) ? data : data?.videos || data?.items || [];
      }
      throw err;
    }
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
