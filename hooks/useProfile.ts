import { useMemo } from "react";
import { useCommunityStore, MemberProfile } from "@/stores/community.store";
import { getPrefilledAvatar } from "@/utils/avatar";

export interface ProfileSeedParams {
  id?: string;
  name?: string;
  username?: string;
  avatar?: string;
  blurhash?: string;
  team?: string;
  department?: string;
  srcSize?: string;
}

export type ProfileSeed = ProfileSeedParams;

export interface UseProfileResult {
  data: MemberProfile;
  isPlaceholder: boolean;
}

/**
 * Pure resolution logic for Profile Seed (Section 5.3).
 * Tested independently of React hook lifecycle.
 */
export function resolveProfileSeed(
  seed: ProfileSeedParams,
  storeMember?: MemberProfile
): UseProfileResult {
  if (storeMember) {
    return {
      data: storeMember,
      isPlaceholder: false,
    };
  }

  const memberId = seed.id || "user-unknown";
  const displayName = seed.name?.trim() || "Fellowship Member";
  let handle = seed.username?.trim() || "@fellowship_student";
  if (handle && !handle.startsWith("@")) {
    handle = `@${handle}`;
  }

  const avatarUrl = seed.avatar?.trim() || getPrefilledAvatar(memberId);

  const profile: MemberProfile = {
    id: memberId,
    fullName: displayName,
    handle,
    avatar: avatarUrl,
    banner:
      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    team: seed.team || "Campus Ministry",
    department: seed.department || "Addis Ababa University",
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

  return {
    data: profile,
    isPlaceholder: true,
  };
}

/**
 * Seed, Cache, Revalidate hook for Profile Screen (Section 5.3).
 *
 * Frame 1: Guaranteed to provide a populated MemberProfile using either
 * 1) Full cached profile from Zustand store
 * 2) Instant route-param seed passed from the tapped entry point
 * 3) Deterministic avatar and naming fallbacks
 *
 * This completely eliminates white flashes, layout shifts, or loading spinners
 * before the header is visible.
 */
export function useProfile(seed: ProfileSeedParams): UseProfileResult {
  const memberId = seed.id || "user-unknown";
  const storeMember = useCommunityStore((s) => s.members[memberId]);

  return useMemo(() => {
    return resolveProfileSeed(seed, storeMember);
  }, [storeMember, seed]);
}
