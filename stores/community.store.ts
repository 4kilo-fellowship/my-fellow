import { socialApi } from "@/services/socialApi";
import {
  ApiPost,
  ProfileDetail,
  SuggestedUser,
} from "@/types/social.types";
import { getPrefilledAvatar } from "@/utils/avatar";
import { formatRelativeTime } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string | any | null;
  timestamp: string;
  content: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface MemberProfile {
  id: string;
  fullName: string;
  handle: string;
  avatar: string | any;
  banner: string | any;
  team: string;
  department: string;
  academicYear: string;
  bio: string;
  streakDays: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  telegramUsername?: string;
  location?: string;
  joinedDate?: string;
  mutualFollowers?: {
    names: string[];
    count: number;
    avatars: string[];
  };
}

export interface SuggestedMember {
  id: string;
  name: string;
  role: string;
  department: string;
  mutualCount: number;
  badge?: string;
  avatar: string;
}

export type CommunityCategory =
  | "all"
  | "prayer"
  | "worship"
  | "outreach"
  | "testimonies"
  | "academic";

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string | any | null;
  authorTeam?: string;
  isVerified?: boolean;
  timestamp: string;
  content: string;
  image?: any | string | null;
  category: CommunityCategory;
  repliesCount: number;
  repostsCount: number;
  likesCount: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  comments?: CommunityComment[];
}

export const DEFAULT_SUGGESTED_MEMBERS: SuggestedMember[] = [
  {
    id: "m1",
    name: "Abenezer Bekele",
    role: "Worship Leader",
    department: "Software Eng. • 4th Yr",
    mutualCount: 28,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m2",
    name: "Hiwot Tadesse",
    role: "Prayer Coordinator",
    department: "Biomedical Eng. • 3rd Yr",
    mutualCount: 34,
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m3",
    name: "Yohannes Hailu",
    role: "Bible Study Lead",
    department: "Electrical Eng. • 5th Yr",
    mutualCount: 19,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m4",
    name: "Bethelhem Assefa",
    role: "Freshman Mentor",
    department: "Computer Eng. • 4th Yr",
    mutualCount: 22,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m5",
    name: "Natnael Tamiru",
    role: "Media & Tech Lead",
    department: "Information Systems • 5th Yr",
    mutualCount: 42,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  },
];

export const INITIAL_MEMBERS: Record<string, MemberProfile> = {
  "user-fellowship": {
    id: "user-fellowship",
    fullName: "4 Kilo Fellowship",
    handle: "@4kilo_fellowship",
    avatar: require("@/assets/images/app-icon.png"),
    banner:
      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    team: "Executive Ministry",
    department: "Campus Ministry Leadership",
    academicYear: "AAU ECSF",
    bio: "Official digital home of Addis Ababa University 4 Kilo Christian Students Fellowship. 'Rooted & Built Up in Him.' Col 2:7 ✝️",
    streakDays: 142,
    followersCount: 1240,
    followingCount: 38,
    postsCount: 56,
    isFollowing: true,
    telegramUsername: "ECSF4KILO",
  },
  "user-worship": {
    id: "user-worship",
    fullName: "Worship & Choir",
    handle: "@4kilo_worship",
    avatar:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    banner:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    team: "Worship Team",
    department: "Acoustic & Vocal Ministry",
    academicYear: "AAU 4 Kilo",
    bio: "Lifting up holy hands across 4 Kilo campus halls. Rehearsals every Wednesday & Friday at 5:30 PM. 🎸🎹🙌",
    streakDays: 45,
    followersCount: 890,
    followingCount: 64,
    postsCount: 34,
    isFollowing: false,
    telegramUsername: "worship_4kilo",
  },
  "user-bethlehem": {
    id: "user-bethlehem",
    fullName: "Bethlehem Haile",
    handle: "@bethlehem_h",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    banner:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
    team: "I4U Ministry",
    department: "Software Engineering",
    academicYear: "4th Year",
    bio: "Saved by grace alone. Passionate about algorithms, prayer walks around Sidist Kilo park, and campus discipleship. ✨",
    streakDays: 28,
    followersCount: 342,
    followingCount: 198,
    postsCount: 19,
    isFollowing: false,
    telegramUsername: "bethlehem_h",
  },
  "user-freshman": {
    id: "user-freshman",
    fullName: "Freshman Ministry",
    handle: "@freshman_4k",
    avatar:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
    banner:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    team: "Freshman Outreach",
    department: "Orientation & Discipleship",
    academicYear: "AAU ECSF",
    bio: "Walking alongside newly joined university brothers and sisters! Mentorship, dorm fellowship, and prayer cells. 🌱",
    streakDays: 62,
    followersCount: 520,
    followingCount: 110,
    postsCount: 27,
    isFollowing: true,
    telegramUsername: "freshman_4kilo",
  },
  "user-samuel": {
    id: "user-samuel",
    fullName: "Samuel Kebede",
    handle: "@samuelk_worship",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    banner:
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    team: "Worship Team",
    department: "Electrical Engineering",
    academicYear: "5th Year",
    bio: "Lead guitarist with 4 Kilo Fellowship. Acoustic worship night is coming! Let all that has breath praise the Lord. 🎵",
    streakDays: 34,
    followersCount: 412,
    followingCount: 156,
    postsCount: 22,
    isFollowing: false,
    telegramUsername: "samuelk_worship",
  },
  m1: {
    id: "m1",
    fullName: "Abenezer Bekele",
    handle: "@abenezer_worship",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    banner:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    team: "Worship Team",
    department: "Software Engineering",
    academicYear: "4th Year",
    bio: "Grace upon grace. Acoustic worship coordinator at 4 Kilo Campus Fellowship. Soli Deo Gloria. 🎸✝️",
    streakDays: 32,
    followersCount: 480,
    followingCount: 210,
    postsCount: 16,
    isFollowing: false,
    telegramUsername: "abenezer_worship",
    location: "4 Kilo Fellowship Hall",
    joinedDate: "September 2022",
    mutualFollowers: {
      names: ["Hiwot", "Bethelhem", "Natnael"],
      count: 28,
      avatars: [
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      ],
    },
  },
  m2: {
    id: "m2",
    fullName: "Hiwot Tadesse",
    handle: "@hiwot_prayer",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    banner:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
    team: "Prayer Ministry",
    department: "Biomedical Engineering",
    academicYear: "3rd Year",
    bio: "Devoted to campus intercession and morning prayer tower watch. 'Pray without ceasing.' 1 Thess 5:17 🙏",
    streakDays: 45,
    followersCount: 395,
    followingCount: 180,
    postsCount: 12,
    isFollowing: false,
    telegramUsername: "hiwot_prayer",
    location: "Sidist Kilo Prayer Tower",
    joinedDate: "October 2023",
    mutualFollowers: {
      names: ["Abenezer", "Yohannes", "Natnael"],
      count: 34,
      avatars: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      ],
    },
  },
};

export const INITIAL_FELLOWSHIP_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    authorId: "user-fellowship",
    authorName: "4 Kilo Fellowship",
    authorHandle: "@4kilo_fellowship",
    authorAvatar: require("@/assets/images/app-icon.png"),
    authorTeam: "Executive Ministry",
    isVerified: true,
    timestamp: "2h ago",
    content:
      "Introducing the brand-new 4 Kilo Fellowship digital platform! ✨\n\nTrack your daily devotions streak, connect with fellowship ministry teams, listen to acoustic worship sessions, and stay deeply rooted in Christ across campus. 'Let us hold fast the confession of our hope without wavering.' #4KiloECSF #CampusMinistry",
    image: require("@/assets/images/onboarding-connected.jpg"),
    category: "all",
    repliesCount: 3,
    repostsCount: 84,
    likesCount: 342,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    comments: [
      {
        id: "c-1",
        postId: "post-1",
        authorId: "user-bethlehem",
        authorName: "Bethlehem Haile",
        authorHandle: "@bethlehem_h",
        authorAvatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        timestamp: "1h ago",
        content:
          "Praise God! The streak tracker and prayer requests feature are going to bless so many students in our dorms! 🙏🔥",
        likesCount: 14,
        isLiked: true,
      },
      {
        id: "c-2",
        postId: "post-1",
        authorId: "user-samuel",
        authorName: "Samuel Kebede",
        authorHandle: "@samuelk_worship",
        authorAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        timestamp: "45m ago",
        content:
          "Amen! Acoustic session audios sound crystal clear. Huge blessing to our team!",
        likesCount: 8,
        isLiked: false,
      },
      {
        id: "c-3",
        postId: "post-1",
        authorId: "user-freshman",
        authorName: "Freshman Ministry",
        authorHandle: "@freshman_4k",
        authorAvatar:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
        timestamp: "20m ago",
        content:
          "Sharing this with all freshmen dorm group chats immediately! 🎉",
        likesCount: 5,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-2",
    authorId: "user-worship",
    authorName: "Worship & Choir",
    authorHandle: "@4kilo_worship",
    authorAvatar:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    authorTeam: "Worship Team",
    isVerified: true,
    timestamp: "4h ago",
    content:
      "“O come, let us sing unto the Lord: let us make a joyful noise to the rock of our salvation.” 🎶\n\nRehearsals for Friday Night Fellowship are officially ongoing at the campus hall. Come with expectant hearts to lift up Jesus together! Bring your roommates and dorm friends. #WorshipNight #AAUChristianFellowship",
    image: require("@/assets/images/onboarding-community.jpg"),
    category: "worship",
    repliesCount: 2,
    repostsCount: 52,
    likesCount: 275,
    isLiked: true,
    isReposted: false,
    isBookmarked: true,
    comments: [
      {
        id: "c-4",
        postId: "post-2",
        authorId: "user-samuel",
        authorName: "Samuel Kebede",
        authorHandle: "@samuelk_worship",
        authorAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        timestamp: "3h ago",
        content:
          "We have prepared new Amharic worship songs alongside contemporary pieces. See you all at 6:00 PM! 🎸",
        likesCount: 12,
        isLiked: true,
      },
    ],
  },
  {
    id: "post-3",
    authorId: "user-bethlehem",
    authorName: "Bethlehem Haile",
    authorHandle: "@bethlehem_h",
    authorAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    authorTeam: "I4U Ministry",
    isVerified: false,
    timestamp: "6h ago",
    content:
      "Late night study break reminder: 'Peace I leave with you; my peace I give you.' John 14:27. Midterm exams are approaching, but our God is steadfast and faithful! Praying over every engineering student preparing in the library tonight. 🙏📚",
    category: "prayer",
    repliesCount: 4,
    repostsCount: 31,
    likesCount: 189,
    isLiked: false,
    isReposted: true,
    isBookmarked: false,
    comments: [],
  },
];

/**
 * Adapter from API Post to UI CommunityPost
 */
export function apiPostToCommunityPost(p: ApiPost): CommunityPost {
  let mediaImage: any = null;
  if (p.media && p.media.length > 0) {
    const primary = p.media[0];
    const url =
      primary.urls?.lg ||
      primary.urls?.md ||
      primary.urls?.original ||
      primary.urls?.sm;
    if (url) {
      mediaImage = { uri: url };
    }
  } else if (p.image) {
    mediaImage = typeof p.image === "string" ? { uri: p.image } : p.image;
  }

  let avatarUrl: any = null;
  if (typeof p.author?.avatar === "string") {
    avatarUrl = p.author.avatar;
  } else if (p.author?.avatar?.urls) {
    avatarUrl =
      p.author.avatar.urls.md ||
      p.author.avatar.urls.sm ||
      p.author.avatar.urls.lg;
  } else {
    avatarUrl = getPrefilledAvatar(p.author?.id || "fellow");
  }

  return {
    id: p.id,
    authorId: p.author?.id || "user-unknown",
    authorName:
      p.author?.displayName || p.author?.username || "Fellowship Member",
    authorHandle: p.author?.username?.startsWith("@")
      ? p.author.username
      : `@${p.author?.username || "fellow"}`,
    authorAvatar: avatarUrl,
    authorTeam:
      p.author?.fellowshipRole ||
      p.author?.ministryBadge ||
      "Campus Ministry",
    isVerified: !!p.author?.isVerified,
    timestamp: formatRelativeTime(p.createdAt),
    content: p.body || "",
    image: mediaImage,
    category: ((p as any).category as CommunityCategory) || "all",
    repliesCount: p.counts?.replies ?? 0,
    repostsCount: p.counts?.reposts ?? 0,
    likesCount: p.counts?.likes ?? 0,
    isLiked: !!p.viewer?.liked,
    isReposted: !!p.viewer?.reposted,
    isBookmarked: !!p.viewer?.bookmarked,
    comments: [],
  };
}

/**
 * Adapter from API Profile to UI MemberProfile
 */
export function apiProfileToMemberProfile(p: ProfileDetail): MemberProfile {
  let avatar: any = null;
  if (typeof p.avatar === "string") {
    avatar = p.avatar;
  } else if (p.avatar?.urls) {
    avatar = p.avatar.urls.lg || p.avatar.urls.md || p.avatar.urls.sm;
  } else {
    avatar = getPrefilledAvatar(p.id);
  }

  let banner: any = null;
  if (typeof p.cover === "string") {
    banner = p.cover;
  } else if (p.cover?.urls) {
    banner = p.cover.urls.lg || p.cover.urls.md;
  } else {
    banner =
      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80";
  }

  const mutualPreview = p.followedByPreview || { total: 0, users: [] };
  const mutualNames = mutualPreview.users.map(
    (u) => u.displayName || u.username,
  );
  const mutualAvatars = mutualPreview.users.map((u) => {
    if (typeof u.avatar === "string") return u.avatar;
    if (u.avatar?.urls) return u.avatar.urls.sm || u.avatar.urls.md;
    return getPrefilledAvatar(u.id);
  });

  return {
    id: p.id,
    fullName: p.displayName || p.username || "Fellowship Member",
    handle: p.username?.startsWith("@") ? p.username : `@${p.username || "member"}`,
    avatar,
    banner,
    team: p.fellowshipRole || p.ministryBadge || "Campus Ministry",
    department:
      p.academic?.department || p.department || "Addis Ababa University",
    academicYear:
      p.academic?.label ||
      (p.academic?.studyYear
        ? `${p.academic.studyYear} Year`
        : p.academicYear || "AAU 4 Kilo"),
    bio:
      p.bio ||
      "Rooted in Christ, walking in faith together with 4 Kilo Fellowship brothers and sisters. ✨",
    streakDays: p.streak?.current ?? 1,
    followersCount: p.counts?.connects ?? 0,
    followingCount: p.counts?.following ?? 0,
    postsCount: p.counts?.reflections ?? 0,
    isFollowing: !!p.viewer?.following,
    telegramUsername:
      p.links?.find((l) => l.kind === "telegram")?.handle || p.username,
    location: p.location || "4 Kilo Campus, Addis Ababa",
    joinedDate: p.joinedAt
      ? formatRelativeTime(p.joinedAt)
      : "September 2022",
    mutualFollowers: {
      names: mutualNames,
      count: mutualPreview.total,
      avatars: mutualAvatars,
    },
  };
}

/**
 * Adapter from API SuggestedUser to UI SuggestedMember
 */
export function apiSuggestedToSuggestedMember(
  s: SuggestedUser,
): SuggestedMember {
  let avatarUrl = "";
  if (typeof s.avatar === "string") {
    avatarUrl = s.avatar;
  } else if (s.avatar?.urls) {
    avatarUrl = s.avatar.urls.md || s.avatar.urls.sm || "";
  } else {
    avatarUrl = getPrefilledAvatar(s.id);
  }

  let dept = s.department || "Addis Ababa University";
  if (s.academicYear) {
    dept = `${dept} • ${s.academicYear}`;
  }

  return {
    id: s.id,
    name: s.displayName || s.username || "Fellowship Member",
    role: s.fellowshipRole || "Fellowship Member",
    department: dept,
    mutualCount: s.mutualCount ?? s.mutualPeersCount ?? 0,
    avatar: avatarUrl,
  };
}

interface CommunityStore {
  posts: CommunityPost[];
  members: Record<string, MemberProfile>;
  whoToFollow: SuggestedMember[];
  selectedCategory: CommunityCategory;
  feedType: "following" | "foryou";
  feedCursor: string | null;
  hasMoreFeed: boolean;
  isFeedLoading: boolean;
  isRefreshing: boolean;

  setSelectedCategory: (cat: CommunityCategory) => void;
  setFeedType: (type: "following" | "foryou") => void;

  // Real async API actions with optimistic updates & rollbacks
  fetchFeed: (
    type?: "following" | "foryou",
    refresh?: boolean,
  ) => Promise<void>;
  fetchWhoToFollow: () => Promise<void>;
  dismissSuggestedMember: (memberId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleRepost: (postId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
  toggleFollowMember: (memberId: string) => Promise<void>;
  createPost: (payload: {
    body: string;
    kind?: "post" | "reply" | "quote";
    parentId?: string;
    quotedId?: string;
    image?: any;
    author?: any;
  }) => Promise<CommunityPost>;
  addComment: (
    postId: string,
    comment: CommunityComment,
  ) => Promise<void>;
  fetchUserProfile: (
    idOrUsername: string,
  ) => Promise<MemberProfile | undefined>;
  fetchPostThread: (
    postId: string,
  ) => Promise<
    | {
        post: CommunityPost;
        ancestors?: CommunityPost[];
        replies: CommunityComment[];
      }
    | undefined
  >;

  // Synchronous helpers
  addPost: (post: CommunityPost) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  updateMemberProfile: (
    memberId: string,
    updates: Partial<MemberProfile>,
  ) => void;
  getPostById: (postId: string) => CommunityPost | undefined;
  getMemberById: (memberId: string) => MemberProfile | undefined;
}

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set, get) => ({
      posts: INITIAL_FELLOWSHIP_POSTS,
      members: INITIAL_MEMBERS,
      whoToFollow: DEFAULT_SUGGESTED_MEMBERS,
      selectedCategory: "all",
      feedType: "foryou",
      feedCursor: null,
      hasMoreFeed: true,
      isFeedLoading: false,
      isRefreshing: false,

      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setFeedType: (type) => set({ feedType: type }),

      fetchFeed: async (type = "foryou", refresh = false) => {
        const currentCursor = refresh ? undefined : (get().feedCursor || undefined);
        set({ isFeedLoading: true, ...(refresh ? { isRefreshing: true } : {}) });

        try {
          const response = await socialApi.getFeed(type, currentCursor);
          const adaptedPosts = (response.items || []).map(apiPostToCommunityPost);

          set((state) => {
            let mergedPosts: CommunityPost[];
            if (refresh || !state.posts.length) {
              mergedPosts = adaptedPosts;
            } else {
              const existingIds = new Set(state.posts.map((p) => p.id));
              const newUnique = adaptedPosts.filter((p) => !existingIds.has(p.id));
              mergedPosts = [...state.posts, ...newUnique];
            }

            const updatedMembers = { ...state.members };
            for (const item of response.items || []) {
              if (item.author && !updatedMembers[item.author.id]) {
                const auth = item.author;
                updatedMembers[auth.id] = {
                  id: auth.id,
                  fullName: auth.displayName || auth.username,
                  handle: auth.username?.startsWith("@")
                    ? auth.username
                    : `@${auth.username}`,
                  avatar:
                    typeof auth.avatar === "string"
                      ? auth.avatar
                      : auth.avatar?.urls?.md || getPrefilledAvatar(auth.id),
                  banner:
                    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
                  team:
                    auth.fellowshipRole ||
                    auth.ministryBadge ||
                    "Campus Ministry",
                  department: auth.department || "Addis Ababa University",
                  academicYear: auth.academicYear || "AAU 4 Kilo",
                  bio: "Rooted in Christ with 4 Kilo Fellowship brothers and sisters.",
                  streakDays: 1,
                  followersCount: 1,
                  followingCount: 1,
                  postsCount: 0,
                  isFollowing: false,
                };
              }
            }

            return {
              posts: mergedPosts,
              members: updatedMembers,
              feedCursor: response.nextCursor ?? null,
              hasMoreFeed: !!response.hasMore,
              feedType: type,
              isFeedLoading: false,
              isRefreshing: false,
            };
          });
        } catch {
          set({ isFeedLoading: false, isRefreshing: false });
        }
      },

      fetchWhoToFollow: async () => {
        try {
          const rawSuggestions = await socialApi.getWhoToFollow();
          if (rawSuggestions && rawSuggestions.length > 0) {
            const suggestions: SuggestedMember[] = rawSuggestions.map(
              apiSuggestedToSuggestedMember,
            );
            set((state) => {
              const updatedMembers = { ...state.members };
              suggestions.forEach((s) => {
                if (!updatedMembers[s.id]) {
                  updatedMembers[s.id] = {
                    id: s.id,
                    fullName: s.name,
                    handle: `@${s.name.toLowerCase().replace(/\s+/g, "_")}`,
                    avatar: s.avatar,
                    banner:
                      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
                    team: s.role,
                    department: s.department,
                    academicYear: "AAU 4 Kilo",
                    bio: "Rooted in Christ, serving in 4 Kilo Fellowship.",
                    streakDays: 1,
                    followersCount: 1,
                    followingCount: 1,
                    postsCount: 0,
                    isFollowing: false,
                  };
                }
              });
              return {
                whoToFollow: suggestions,
                members: updatedMembers,
              };
            });
          }
        } catch {
          // Keep cached whoToFollow on error
        }
      },

      dismissSuggestedMember: async (memberId: string) => {
        set((state) => ({
          whoToFollow: state.whoToFollow.filter((m) => m.id !== memberId),
        }));
        try {
          await socialApi.dismissSuggestion(memberId);
        } catch {
          // Ignore
        }
      },

      toggleLike: async (postId: string) => {
        const currentPost = get().posts.find((p) => p.id === postId);
        if (!currentPost) return;

        const previousIsLiked = !!currentPost.isLiked;
        const previousLikesCount = currentPost.likesCount;
        const nextIsLiked = !previousIsLiked;
        const nextLikesCount = nextIsLiked
          ? previousLikesCount + 1
          : Math.max(0, previousLikesCount - 1);

        // Optimistic update
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, isLiked: nextIsLiked, likesCount: nextLikesCount }
              : p,
          ),
        }));

        try {
          if (nextIsLiked) {
            await socialApi.likePost(postId);
          } else {
            await socialApi.unlikePost(postId);
          }
        } catch {
          // Rollback on error
          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    isLiked: previousIsLiked,
                    likesCount: previousLikesCount,
                  }
                : p,
            ),
          }));
        }
      },

      toggleRepost: async (postId: string) => {
        const currentPost = get().posts.find((p) => p.id === postId);
        if (!currentPost) return;

        const previousIsReposted = !!currentPost.isReposted;
        const previousRepostsCount = currentPost.repostsCount;
        const nextIsReposted = !previousIsReposted;
        const nextRepostsCount = nextIsReposted
          ? previousRepostsCount + 1
          : Math.max(0, previousRepostsCount - 1);

        // Optimistic update
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isReposted: nextIsReposted,
                  repostsCount: nextRepostsCount,
                }
              : p,
          ),
        }));

        try {
          if (nextIsReposted) {
            await socialApi.repostPost(postId);
          } else {
            await socialApi.unrepostPost(postId);
          }
        } catch {
          // Rollback on error
          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    isReposted: previousIsReposted,
                    repostsCount: previousRepostsCount,
                  }
                : p,
            ),
          }));
        }
      },

      toggleBookmark: async (postId: string) => {
        const currentPost = get().posts.find((p) => p.id === postId);
        if (!currentPost) return;

        const previousIsBookmarked = !!currentPost.isBookmarked;
        const nextIsBookmarked = !previousIsBookmarked;

        // Optimistic update
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, isBookmarked: nextIsBookmarked }
              : p,
          ),
        }));

        try {
          if (nextIsBookmarked) {
            await socialApi.bookmarkPost(postId);
          } else {
            await socialApi.unbookmarkPost(postId);
          }
        } catch {
          // Rollback on error
          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === postId
                ? { ...p, isBookmarked: previousIsBookmarked }
                : p,
            ),
          }));
        }
      },

      toggleFollowMember: async (memberId: string) => {
        const target = get().members[memberId];
        if (!target) return;

        const prevIsFollowing = !!target.isFollowing;
        const prevFollowersCount = target.followersCount;
        const nextIsFollowing = !prevIsFollowing;
        const nextFollowersCount = nextIsFollowing
          ? prevFollowersCount + 1
          : Math.max(0, prevFollowersCount - 1);

        // Optimistic update in both members and whoToFollow
        set((state) => ({
          members: {
            ...state.members,
            [memberId]: {
              ...target,
              isFollowing: nextIsFollowing,
              followersCount: nextFollowersCount,
            },
          },
        }));

        try {
          if (nextIsFollowing) {
            await socialApi.followUser(memberId);
          } else {
            await socialApi.unfollowUser(memberId);
          }
        } catch {
          // Rollback on error
          set((state) => ({
            members: {
              ...state.members,
              [memberId]: {
                ...target,
                isFollowing: prevIsFollowing,
                followersCount: prevFollowersCount,
              },
            },
          }));
        }
      },

      createPost: async (payload) => {
        const tempId = `temp-${Date.now()}`;
        const optimisticPost: CommunityPost = {
          id: tempId,
          authorId: payload.author?.id || "user-current",
          authorName: payload.author?.fullName || "Fellowship Member",
          authorHandle: payload.author?.telegramUserName
            ? `@${payload.author.telegramUserName.replace(/^@/, "")}`
            : `@${(payload.author?.fullName || "member").toLowerCase().replace(/\s+/g, "")}`,
          authorAvatar:
            payload.author?.profileImage ||
            getPrefilledAvatar(payload.author?.id || "fellow"),
          authorTeam: payload.author?.team || "Campus Ministry",
          isVerified: false,
          timestamp: "Just now",
          content: payload.body,
          image: payload.image || null,
          category: "all",
          repliesCount: 0,
          repostsCount: 0,
          likesCount: 0,
          isLiked: false,
          isReposted: false,
          isBookmarked: false,
          comments: [],
        };

        // Prepend optimistically
        set((state) => ({
          posts: [optimisticPost, ...state.posts],
        }));

        try {
          const apiResult = await socialApi.createPost({
            body: payload.body,
            kind: payload.kind || "post",
            parentId: payload.parentId,
            quotedId: payload.quotedId,
          });

          const realPost = apiPostToCommunityPost(apiResult);
          if (payload.image && !realPost.image) {
            realPost.image = payload.image;
          }

          // Replace optimistic post with real server post
          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === tempId ? realPost : p,
            ),
          }));

          return realPost;
        } catch (err) {
          // Rollback optimistic post on error
          set((state) => ({
            posts: state.posts.filter((p) => p.id !== tempId),
          }));
          throw err;
        }
      },

      addComment: async (postId, comment) => {
        // Optimistically append comment
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  repliesCount: p.repliesCount + 1,
                  comments: [...(p.comments || []), comment],
                }
              : p,
          ),
        }));

        try {
          await socialApi.createPost({
            body: comment.content,
            kind: "reply",
            parentId: postId,
          });
        } catch (err) {
          // Rollback on error
          set((state) => ({
            posts: state.posts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    repliesCount: Math.max(0, p.repliesCount - 1),
                    comments: (p.comments || []).filter(
                      (c) => c.id !== comment.id,
                    ),
                  }
                : p,
            ),
          }));
          throw err;
        }
      },

      fetchUserProfile: async (idOrUsername) => {
        try {
          const profile = await socialApi.getUserProfile(idOrUsername);
          const member = apiProfileToMemberProfile(profile);
          set((state) => ({
            members: {
              ...state.members,
              [member.id]: member,
              [idOrUsername]: member,
            },
          }));
          return member;
        } catch {
          return get().members[idOrUsername];
        }
      },

      fetchPostThread: async (postId) => {
        try {
          const thread = await socialApi.getPostThread(postId);
          const mainPost = apiPostToCommunityPost(thread.post);
          const replies: CommunityComment[] = (thread.replies || []).map(
            (r) => ({
              id: r.id,
              postId: mainPost.id,
              authorId: r.author?.id || "user-unknown",
              authorName:
                r.author?.displayName ||
                r.author?.username ||
                "Fellowship Member",
              authorHandle: r.author?.username?.startsWith("@")
                ? r.author.username
                : `@${r.author?.username || "member"}`,
              authorAvatar:
                typeof r.author?.avatar === "string"
                  ? r.author.avatar
                  : r.author?.avatar?.urls?.md ||
                    getPrefilledAvatar(r.author?.id),
              timestamp: formatRelativeTime(r.createdAt),
              content: r.body || "",
              likesCount: r.counts?.likes ?? 0,
              isLiked: !!r.viewer?.liked,
            }),
          );

          mainPost.comments = replies;
          const ancestors: CommunityPost[] = (thread.ancestors || []).map(
            apiPostToCommunityPost,
          );

          set((state) => ({
            posts: state.posts.some((p) => p.id === mainPost.id)
              ? state.posts.map((p) =>
                  p.id === mainPost.id
                    ? { ...p, ...mainPost, comments: replies }
                    : p,
                )
              : [mainPost, ...state.posts],
          }));

          return { post: mainPost, ancestors, replies };
        } catch {
          const local = get().posts.find((p) => p.id === postId);
          if (local) {
            return {
              post: local,
              ancestors: [],
              replies: local.comments || [],
            };
          }
          return undefined;
        }
      },

      addPost: (newPost) =>
        set((state) => ({
          posts: [newPost, ...state.posts],
        })),

      toggleLikeComment: (postId, commentId) =>
        set((state) => ({
          posts: state.posts.map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              comments: (p.comments || []).map((c) =>
                c.id === commentId
                  ? {
                      ...c,
                      isLiked: !c.isLiked,
                      likesCount: c.isLiked
                        ? Math.max(0, c.likesCount - 1)
                        : c.likesCount + 1,
                    }
                  : c,
              ),
            };
          }),
        })),

      updateMemberProfile: (memberId, updates) =>
        set((state) => {
          const existing = state.members[memberId] || {
            id: memberId,
            fullName: updates.fullName || "Fellowship Member",
            handle: updates.handle || "@fellowship_member",
            avatar: updates.avatar || "",
            banner: updates.banner || "",
            team: updates.team || "Campus Ministry",
            department: updates.department || "Addis Ababa University",
            academicYear: updates.academicYear || "AAU 4 Kilo",
            bio: updates.bio || "",
            streakDays: 1,
            followersCount: 1,
            followingCount: 1,
            postsCount: 0,
            isFollowing: false,
          };

          const updated = { ...existing, ...updates };

          return {
            members: {
              ...state.members,
              [memberId]: updated,
            },
            posts: state.posts.map((p) =>
              p.authorId === memberId
                ? {
                    ...p,
                    authorName: updates.fullName ?? p.authorName,
                    authorAvatar: updates.avatar ?? p.authorAvatar,
                    authorHandle: updates.handle ?? p.authorHandle,
                    authorTeam: updates.team ?? p.authorTeam,
                  }
                : p,
            ),
          };
        }),

      getPostById: (postId) => {
        return get().posts.find((p) => p.id === postId);
      },

      getMemberById: (memberId) => {
        return get().members[memberId];
      },
    }),
    {
      name: "fellowship-community-cache",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        posts: state.posts,
        members: state.members,
        whoToFollow: state.whoToFollow,
        selectedCategory: state.selectedCategory,
      }),
    },
  ),
);
