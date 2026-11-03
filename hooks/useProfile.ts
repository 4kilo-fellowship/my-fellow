import { useMemo } from "react";
import { useCommunityStore, MemberProfile } from "@/stores/community.store";

export interface ProfileSeedParams {
  id?: string;
  name?: string;
  username?: string;
  avatar?: string;
  blurhash?: string;
  team?: string;
  department?: string;
  srcSize?: string;
  streakDays?: string | number;
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

  const profile: MemberProfile = {
    id: memberId,
    fullName: displayName,
    handle,
    avatar: seed.avatar || null,
    banner: null,
    team: seed.team || "",
    department: seed.department || "",
    academicYear: "",
    bio: "",
    streakDays: 0,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isFollowing: false,
    location: undefined,
    joinedDate: undefined,
    mutualFollowers: undefined,
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
