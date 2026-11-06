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

  const isOfficial =
    memberId === "user-fellowship" ||
    memberId === "4kilofellowship" ||
    memberId === "6aec43ef64e7e1d073d0bc1c" ||
    displayName.toLowerCase().includes("4 kilo") ||
    handle.toLowerCase().includes("4kilo");

  const profile: MemberProfile = {
    id: isOfficial ? "user-fellowship" : memberId,
    fullName: isOfficial ? "4 Kilo Fellowship" : displayName,
    handle: isOfficial ? "@4kilo_fellowship" : handle,
    avatar:
      seed.avatar ||
      (isOfficial
        ? "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=400&q=80"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"),
    banner: isOfficial
      ? "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
      : null,
    team: isOfficial ? "Executive Ministry" : (seed.team || "Campus Ministry"),
    department: isOfficial ? "Campus Ministry Leadership" : (seed.department || "Addis Ababa University"),
    academicYear: isOfficial ? "AAU ECSF" : "",
    bio: isOfficial
      ? "Official digital home of Addis Ababa University 4 Kilo Christian Students Fellowship. 'Rooted & Built Up in Him.' Col 2:7 ✝️"
      : "",
    streakDays: isOfficial ? 142 : 0,
    followersCount: isOfficial ? 1240 : 0,
    followingCount: isOfficial ? 38 : 0,
    postsCount: isOfficial ? 56 : 0,
    isFollowing: isOfficial ? true : false,
    location: isOfficial ? "Addis Ababa University 4 Kilo Campus" : undefined,
    joinedDate: undefined,
    mutualFollowers: undefined,
  };

  return {
    data: profile,
    isPlaceholder: !isOfficial,
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
  const storeMember = useCommunityStore((s) =>
    s.members[memberId] ||
    (memberId === "user-fellowship" ||
    memberId === "4kilofellowship" ||
    memberId === "6aec43ef64e7e1d073d0bc1c"
      ? s.members["user-fellowship"]
      : undefined)
  );

  return useMemo(() => {
    return resolveProfileSeed(seed, storeMember);
  }, [storeMember, seed]);
}
