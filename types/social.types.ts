export interface MediaRef {
  id: string;
  kind: "image" | "video";
  width?: number;
  height?: number;
  blurhash?: string;
  thumbhash?: string;
  urls: {
    sm: string;
    md: string;
    lg: string;
    original?: string;
  };
  alt?: string;
}

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatar: string | MediaRef | null;
  isVerified: boolean;
  fellowshipRole?: string | null;
  ministryBadge?: string | null;
  department?: string | null;
  academicYear?: string | null;
}

export interface ApiPost {
  id: string;
  kind: "post" | "reply" | "repost" | "quote";
  author: UserSummary;
  body: string | null;
  createdAt: string;
  editedAt?: string | null;
  media?: MediaRef[];
  image?: any;
  replyTo?: { id: string; authorUsername: string } | null;
  repostOf?: ApiPost | null;
  quoted?: ApiPost | null;
  counts: {
    replies: number;
    reposts: number;
    likes: number;
    bookmarks?: number;
  };
  viewer: {
    liked: boolean;
    reposted: boolean;
    bookmarked: boolean;
  };
  tombstone?: "deleted" | "unavailable";
}

export interface FeedResponse {
  items: ApiPost[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ThreadResponse {
  post: ApiPost;
  ancestors?: ApiPost[];
  replies: ApiPost[];
}

export interface SuggestedUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string | MediaRef | null;
  fellowshipRole?: string | null;
  department?: string | null;
  academicYear?: string | null;
  mutualCount?: number;
  mutualPeersCount?: number;
  isFollowing?: boolean;
}

export interface StoryHighlight {
  id: string;
  title: string;
  emoji?: string;
  icon?: string;
  cover?: string | MediaRef | null;
  image?: string;
  quote?: string;
}

export interface MinistryScheduleItem {
  day: string;
  time: string;
  location: string;
}

export interface MinistryEventItem {
  id: string;
  title: string;
  date: string;
  location: string;
}

export interface UserMinistry {
  id: string;
  name: string;
  role: string;
  badge?: string;
  schedule?: MinistryScheduleItem[];
  upcomingEvents?: MinistryEventItem[];
}

export interface MutualFollowersData {
  total: number;
  users: UserSummary[];
}

export interface ProfileDetail extends UserSummary {
  cover: string | MediaRef | null;
  bio: string | null;
  location: string | null;
  joinedAt: string;
  links?: { kind: string; handle?: string; url: string }[];
  academic?: {
    department?: string;
    studyYear?: number | string;
    label?: string;
  };
  badges?: {
    kind: "ministry" | "academic" | "streak" | "role";
    label: string;
  }[];
  streak?: { current: number } | null;
  counts: {
    following: number;
    connects: number;
    reflections: number;
  };
  presence?: {
    online: boolean;
    lastSeenAt?: string | null;
  } | null;
  viewer: {
    isSelf: boolean;
    following: boolean;
    followedBy: boolean;
    pendingRequest?: boolean;
    blocked?: boolean;
    blockedBy?: boolean;
    muted?: boolean;
  };
  followedByPreview?: {
    total: number;
    users: UserSummary[];
  };
  highlights?: StoryHighlight[];
  ministries?: UserMinistry[];
}

export interface ContentVideo {
  id: string;
  title: string;
  duration: string;
  speaker: string;
  publishedAt: string;
  thumbnail: string;
  videoUrl: string;
  views?: string | number;
  description?: string;
  category?: string;
}

export interface StreakMe {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  activeDates?: string[];
  totalDevotionsCompleted?: number;
}

export interface TrendingTag {
  tag: string;
  category?: string;
  count: string | number;
}

export interface SocialSearchResult {
  people: SuggestedUser[];
  posts: ApiPost[];
  tags?: TrendingTag[];
}
