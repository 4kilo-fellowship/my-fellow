import { create } from "zustand";

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

export const INITIAL_MEMBERS: Record<string, MemberProfile> = {
  "user-fellowship": {
    id: "user-fellowship",
    fullName: "4 Kilo Fellowship",
    handle: "@4kilo_fellowship",
    avatar: require("@/assets/images/app-icon.png"),
    banner: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
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
    avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    banner: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
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
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    banner: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
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
    avatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
    banner: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
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
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    banner: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    team: "Worship Team",
    department: "Electrical Engineering",
    academicYear: "5th Year",
    bio: "Lead guitarist with 4 Kilo Fellowship. Acoustic worship night is coming! Let all that has breath praise the Lord. 🎵",
    streakDays: 34,
    followersCount: 412,
    followingCount: 167,
    postsCount: 22,
    isFollowing: false,
    telegramUsername: "samuelk_guitar",
    location: "AAU 4 Kilo Campus",
    joinedDate: "October 2021",
    mutualFollowers: {
      names: ["Abenezer", "Hiwot", "Bethelhem"],
      count: 22,
      avatars: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      ],
    },
  },
  m1: {
    id: "m1",
    fullName: "Abenezer Bekele",
    handle: "@abenezer_b",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    banner: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    team: "Worship Team",
    department: "Software Engineering",
    academicYear: "4th Year",
    bio: "Saved to worship. Lead vocalist with 4 Kilo Fellowship choir. 'Let everything that has breath praise the Lord.' Psalm 150:6 🎸🎶",
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
    handle: "@hiwot_t",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    banner: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
    team: "Prayer Ministry",
    department: "Biomedical Engineering",
    academicYear: "3rd Year",
    bio: "Interceding for 4 Kilo campus students day and night. Morning devotions lead at Sidist Kilo prayer chapel. 🙏🤍",
    streakDays: 58,
    followersCount: 520,
    followingCount: 195,
    postsCount: 24,
    isFollowing: false,
    telegramUsername: "hiwot_prayer",
    location: "Sidist Kilo Chapel & 4 Kilo",
    joinedDate: "October 2023",
    mutualFollowers: {
      names: ["Abenezer", "Bethelhem", "Yohannes"],
      count: 34,
      avatars: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      ],
    },
  },
  m3: {
    id: "m3",
    fullName: "Yohannes Hailu",
    handle: "@yohannes_h",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    banner: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
    team: "Bible Study Team",
    department: "Electrical Engineering",
    academicYear: "5th Year",
    bio: "Deep in the Word. Leading Friday inductive Bible study through the Gospel of John. Soli Deo Gloria 📖✝️",
    streakDays: 41,
    followersCount: 390,
    followingCount: 140,
    postsCount: 18,
    isFollowing: false,
    telegramUsername: "yohannes_bible",
    location: "AAU Library & Study Hall",
    joinedDate: "September 2021",
    mutualFollowers: {
      names: ["Abenezer", "Natnael", "Hiwot"],
      count: 19,
      avatars: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      ],
    },
  },
  m4: {
    id: "m4",
    fullName: "Bethelhem Assefa",
    handle: "@bethelhem_a",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    banner: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    team: "Freshman Outreach",
    department: "Computer Engineering",
    academicYear: "4th Year",
    bio: "Mentoring new freshmen navigating Addis Ababa University dorms and campus faith walk. You are never alone! 🌱✨",
    streakDays: 64,
    followersCount: 610,
    followingCount: 245,
    postsCount: 31,
    isFollowing: false,
    telegramUsername: "bethelhem_mentor",
    location: "Freshman Block 5, 4 Kilo",
    joinedDate: "November 2022",
    mutualFollowers: {
      names: ["Hiwot", "Abenezer", "Samuel"],
      count: 22,
      avatars: [
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      ],
    },
  },
  m5: {
    id: "m5",
    fullName: "Natnael Tamiru",
    handle: "@natnael_t",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    team: "Media & Tech",
    department: "Information Systems",
    academicYear: "5th Year",
    bio: "Serving through technology, sound design, and live-streaming for 4 Kilo Fellowship. Code & worship. 💻🎧",
    streakDays: 78,
    followersCount: 740,
    followingCount: 310,
    postsCount: 42,
    isFollowing: false,
    telegramUsername: "natnael_tech",
    location: "Fellowship Media Control Booth",
    joinedDate: "October 2021",
    mutualFollowers: {
      names: ["Abenezer", "Bethelhem", "Yohannes"],
      count: 42,
      avatars: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      ],
    },
  },
};

const INITIAL_FELLOWSHIP_POSTS: CommunityPost[] = [
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
        authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        timestamp: "1h ago",
        content: "Praise God! The streak tracker and prayer requests feature are going to bless so many students in our dorms! 🙏🔥",
        likesCount: 14,
        isLiked: true,
      },
      {
        id: "c-2",
        postId: "post-1",
        authorId: "user-samuel",
        authorName: "Samuel Kebede",
        authorHandle: "@samuelk_worship",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        timestamp: "45m ago",
        content: "Amen! Acoustic session audios sound crystal clear. Huge blessing to our team!",
        likesCount: 8,
        isLiked: false,
      },
      {
        id: "c-3",
        postId: "post-1",
        authorId: "user-freshman",
        authorName: "Freshman Ministry",
        authorHandle: "@freshman_4k",
        authorAvatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
        timestamp: "20m ago",
        content: "Sharing this with all freshmen dorm group chats immediately! 🎉",
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
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        timestamp: "3h ago",
        content: "We have prepared new Amharic worship songs alongside contemporary pieces. See you all at 6:00 PM! 🎸",
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
    timestamp: "8h ago",
    content:
      "“The Lord is my strength and my shield; in him my heart trusts, and I am helped.” — Psalm 28:7\n\nWhatever semester challenges you're facing today in fundamentals exams, lab submissions, or dorm life, remember you are never alone. Have an anchored day fellowship fam! 🤍 #PrayerRequest #FaithfulGod",
    category: "prayer",
    repliesCount: 1,
    repostsCount: 31,
    likesCount: 198,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    comments: [
      {
        id: "c-5",
        postId: "post-3",
        authorId: "user-freshman",
        authorName: "Freshman Ministry",
        authorHandle: "@freshman_4k",
        authorAvatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
        timestamp: "6h ago",
        content: "Needed this scripture today sister. God bless you!",
        likesCount: 4,
        isLiked: false,
      },
    ],
  },
  {
    id: "post-4",
    authorId: "user-freshman",
    authorName: "Freshman Ministry",
    authorHandle: "@freshman_4k",
    authorAvatar:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
    authorTeam: "Freshman Outreach",
    isVerified: true,
    timestamp: "1d ago",
    content:
      "Orientation week was such a blessing! Over 300 freshman students joined our welcome fellowships across 4 Kilo and 5 Kilo campus dorms. Huge shoutout to all student mentors and volunteers! 🙏🎉 #Outreach #StudentMinistry",
    image: require("@/assets/images/onboarding-devotions.jpg"),
    category: "outreach",
    repliesCount: 4,
    repostsCount: 112,
    likesCount: 630,
    isLiked: false,
    isReposted: true,
    isBookmarked: false,
    comments: [],
  },
  {
    id: "post-5",
    authorId: "user-samuel",
    authorName: "Samuel Kebede",
    authorHandle: "@samuelk_worship",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    authorTeam: "Worship Team",
    isVerified: false,
    timestamp: "2d ago",
    content:
      "Testimony time: God showed up so powerfully during final exams preparation! Our dorm prayer group prayed through stressful project deadlines and every single brother passed with peace. All glory to God! ✨🙌 #Testimony #4KiloECSF",
    category: "testimonies",
    repliesCount: 2,
    repostsCount: 43,
    likesCount: 215,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    comments: [],
  },
  {
    id: "post-m1-1",
    authorId: "m1",
    authorName: "Abenezer Bekele",
    authorHandle: "@abenezer_b",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    authorTeam: "Worship Team",
    isVerified: true,
    timestamp: "3h ago",
    content:
      "Worship night setlist is ready! 🎸 We will be diving deep into acoustic praise this Friday at the Fellowship hall. Can't wait to worship Jesus together with everyone. Bring your roommates!",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
    category: "worship",
    repliesCount: 4,
    repostsCount: 28,
    likesCount: 184,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    comments: [],
  },
  {
    id: "post-m1-2",
    authorId: "m1",
    authorName: "Abenezer Bekele",
    authorHandle: "@abenezer_b",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    authorTeam: "Worship Team",
    isVerified: true,
    timestamp: "1d ago",
    content:
      "‘The Lord is my strength and my song; he has become my salvation.’ Exodus 15:2. Blessed mid-week rehearsals! 🎵🙌",
    category: "worship",
    repliesCount: 1,
    repostsCount: 15,
    likesCount: 92,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    comments: [],
  },
  {
    id: "post-m2-1",
    authorId: "m2",
    authorName: "Hiwot Tadesse",
    authorHandle: "@hiwot_t",
    authorAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    authorTeam: "Prayer Ministry",
    isVerified: true,
    timestamp: "5h ago",
    content:
      "Morning intercession at Sidist Kilo prayer chapel was filled with the presence of God today. Lifting up every student navigating midterm pressure and dorm adjustments. You are covered in prayer! 🙏🤍",
    image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80",
    category: "prayer",
    repliesCount: 6,
    repostsCount: 41,
    likesCount: 230,
    isLiked: true,
    isReposted: false,
    isBookmarked: true,
    comments: [],
  },
  {
    id: "post-m3-1",
    authorId: "m3",
    authorName: "Yohannes Hailu",
    authorHandle: "@yohannes_h",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    authorTeam: "Bible Study Team",
    isVerified: true,
    timestamp: "1d ago",
    content:
      "Inductive Bible study through John chapter 15 this evening: 'I am the true vine, and my Father is the gardener.' Bring your bibles and open hearts to room B-204! 📖✝️",
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
    category: "academic",
    repliesCount: 3,
    repostsCount: 19,
    likesCount: 145,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    comments: [],
  },
  {
    id: "post-m4-1",
    authorId: "m4",
    authorName: "Bethelhem Assefa",
    authorHandle: "@bethelhem_a",
    authorAvatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    authorTeam: "Freshman Outreach",
    isVerified: true,
    timestamp: "7h ago",
    content:
      "To all the freshman brothers and sisters settling into 4 Kilo campus dorms: our mentorship team is always here for you! Do not hesitate to reach out for prayer, study tips, or fellowship. 🌱✨",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    category: "outreach",
    repliesCount: 8,
    repostsCount: 37,
    likesCount: 312,
    isLiked: true,
    isReposted: true,
    isBookmarked: false,
    comments: [],
  },
  {
    id: "post-m5-1",
    authorId: "m5",
    authorName: "Natnael Tamiru",
    authorHandle: "@natnael_t",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    authorTeam: "Media & Tech",
    isVerified: true,
    timestamp: "12h ago",
    content:
      "Media & Tech setup completed for Sunday's service livestream! Microphones tested, multi-track audio sounding clean. Praise God for the crew serving behind the screens! 🎧💻🎥",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    category: "all",
    repliesCount: 5,
    repostsCount: 22,
    likesCount: 198,
    isLiked: false,
    isReposted: false,
    isBookmarked: false,
    comments: [],
  },
];

interface CommunityStore {
  posts: CommunityPost[];
  members: Record<string, MemberProfile>;
  selectedCategory: CommunityCategory;
  setSelectedCategory: (cat: CommunityCategory) => void;
  addPost: (post: CommunityPost) => void;
  toggleLike: (postId: string) => void;
  toggleRepost: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  addComment: (postId: string, comment: CommunityComment) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  toggleFollowMember: (memberId: string) => void;
  updateMemberProfile: (memberId: string, updates: Partial<MemberProfile>) => void;
  getPostById: (postId: string) => CommunityPost | undefined;
  getMemberById: (memberId: string) => MemberProfile | undefined;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  posts: INITIAL_FELLOWSHIP_POSTS,
  members: INITIAL_MEMBERS,
  selectedCategory: "all",
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  addPost: (newPost) =>
    set((state) => ({
      posts: [newPost, ...state.posts],
    })),

  toggleLike: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: p.isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
            }
          : p
      ),
    })),

  toggleRepost: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isReposted: !p.isReposted,
              repostsCount: p.isReposted
                ? Math.max(0, p.repostsCount - 1)
                : p.repostsCount + 1,
            }
          : p
      ),
    })),

  toggleBookmark: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isBookmarked: !p.isBookmarked,
            }
          : p
      ),
    })),

  addComment: (postId, newComment) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              repliesCount: p.repliesCount + 1,
              comments: [...(p.comments || []), newComment],
            }
          : p
      ),
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
                  likesCount: c.isLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1,
                }
              : c
          ),
        };
      }),
    })),

  toggleFollowMember: (memberId) =>
    set((state) => {
      const target = state.members[memberId];
      if (!target) return state;
      const isNowFollowing = !target.isFollowing;
      return {
        members: {
          ...state.members,
          [memberId]: {
            ...target,
            isFollowing: isNowFollowing,
            followersCount: isNowFollowing
              ? target.followersCount + 1
              : Math.max(0, target.followersCount - 1),
          },
        },
      };
    }),

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
            : p
        ),
      };
    }),

  getPostById: (postId) => {
    return get().posts.find((p) => p.id === postId);
  },

  getMemberById: (memberId) => {
    return get().members[memberId];
  },
}));
