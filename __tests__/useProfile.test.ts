/// <reference types="bun-types" />
import { describe, expect, it } from "bun:test";
import { resolveProfileSeed } from "../hooks/useProfile";
import { MemberProfile } from "../stores/community.store";

describe("useProfile / resolveProfileSeed Unit Tests", () => {
  const mockStoreMember: MemberProfile = {
    id: "user-123",
    fullName: "Dawit Tsige",
    handle: "@dawit_worship",
    avatar: "https://images.unsplash.com/mock-dawit.jpg",
    banner: "https://images.unsplash.com/mock-banner.jpg",
    team: "Worship Ministry",
    department: "Software Engineering",
    academicYear: "4th Year",
    bio: "Praising God daily.",
    streakDays: 45,
    followersCount: 220,
    followingCount: 180,
    postsCount: 14,
    isFollowing: true,
  };

  it("prioritizes full cached member data from the store when available", () => {
    const seed = {
      id: "user-123",
      name: "Stale Seed Name",
      username: "@stale_handle",
    };

    const result = resolveProfileSeed(seed, mockStoreMember);

    expect(result.isPlaceholder).toBe(false);
    expect(result.data.fullName).toBe("Dawit Tsige");
    expect(result.data.handle).toBe("@dawit_worship");
    expect(result.data.followersCount).toBe(220);
    expect(result.data.isFollowing).toBe(true);
  });

  it("seeds Frame 1 instantly from entry-point parameters when store has no entry", () => {
    const seed = {
      id: "user-456",
      name: "Selamawit Bekele",
      username: "selam_prayer", // without leading @
      avatar: "https://images.unsplash.com/selam.jpg",
      team: "Prayer Ministry",
      department: "Electrical Engineering",
    };

    const result = resolveProfileSeed(seed, undefined);

    expect(result.isPlaceholder).toBe(true);
    expect(result.data.id).toBe("user-456");
    expect(result.data.fullName).toBe("Selamawit Bekele");
    expect(result.data.handle).toBe("@selam_prayer"); // Formatted with @
    expect(result.data.avatar).toBe("https://images.unsplash.com/selam.jpg");
    expect(result.data.team).toBe("Prayer Ministry");
    expect(result.data.department).toBe("Electrical Engineering");
    expect(result.data.bio).toBeDefined();
    expect(result.data.banner).toBeDefined();
  });

  it("gracefully falls back to deterministic defaults when empty seed is provided", () => {
    const emptySeed = {};

    const result = resolveProfileSeed(emptySeed, undefined);

    expect(result.isPlaceholder).toBe(true);
    expect(result.data.id).toBe("user-unknown");
    expect(result.data.fullName).toBe("Fellowship Member");
    expect(result.data.handle).toBe("@fellowship_student");
    expect(result.data.avatar).toBeDefined();
    expect(typeof result.data.avatar).toBe("string");
    expect(result.data.team).toBe("Campus Ministry");
    expect(result.data.department).toBe("Addis Ababa University");
  });

  it("preserves leading @ on username if already present in seed", () => {
    const seed = {
      id: "user-789",
      name: "Ephraim",
      username: "@ephraim_sound",
    };

    const result = resolveProfileSeed(seed, undefined);

    expect(result.data.handle).toBe("@ephraim_sound");
  });
});
