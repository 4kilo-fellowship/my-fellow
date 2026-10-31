# Profile Screen: Real Social Media Smooth Open Architecture

## Overview
This document outlines the smooth opening and transition architecture for the Profile screen in **my-fellow** (Expo SDK 58, React Native 0.88, React 19).

When a user taps any avatar, username, or member entry point (feed reflections, comments, discovery search results, or recommendations), the profile opens fluidly with:
1. **Motion Layer**:
   - **iOS 18+**: Native zoom transition via `Link.AppleZoom` and `Link.AppleZoomTarget`. The tapped avatar grows directly into the profile avatar, and interactive swipe-to-dismiss returns it back to where it came from.
   - **Android & iOS < 18**: High-performance native stack push (`slide_from_right` on Android) without layout shifts or flashes.
2. **Instant Content (Frame 1)**:
   - Name, handle, avatar, ministry team, and department are rendered on Frame 1 using `useProfile` seeded cache pattern (`resolveProfileSeed`).
   - Skeletons (`ProfileSkeleton`) match exact real content dimensions.
3. **Zero Hitch Runtime Performance**:
   - Heavy tab content (reflections list, image media grid, ministry cards) is deferred until after the push transition completes via `useAfterTransition`.
   - UI thread animations powered by React Native Reanimated.
   - Free-speed image prefetching triggered during the user's initial touch-down window in `ProfileLink`.

---

## Directory & File Structure

```
my-fellow/
├── app/
│   ├── _layout.tsx                     # Root native Stack (headerShown: false, zoom-enabled)
│   ├── community/
│   │   ├── [id].tsx                    # Reflection detail (ProfileLink entry points)
│   │   ├── search.tsx                  # Search & member discovery (ProfileLink entry points)
│   │   └── user/
│   │       └── [id].tsx                # Profile screen with AppleZoomTarget & useAfterTransition
│   └── (tabs)/
│       └── community.tsx               # Main reflections feed (ProfileLink entry points)
├── components/
│   ├── profile/
│   │   ├── ProfileLink.tsx             # Universal entry point with hitSlop, debounce, prefetch, & AppleZoom
│   │   └── ProfileSkeleton.tsx         # Exact-geometry UI-thread shimmer skeletons
│   └── WhoToFollow/
│       └── index.tsx                   # Recommendations carousel using ProfileLink & seed params
├── hooks/
│   ├── useAfterTransition.ts           # Defers heavy children until transitionEnd
│   └── useProfile.ts                   # Frame-1 instant profile seed, cache, & fallback
├── lib/
│   └── transitions.ts                  # Centralized platform transition capabilities & flags
└── docs/
    └── profile-transition.md           # This architecture guide
```

---

## Platform Strategy Switchboard (`lib/transitions.ts`)

| Platform | Transition Strategy | Description |
|---|---|---|
| **iOS 18+** | `Link.AppleZoom` + `Link.AppleZoomTarget` | Native iOS 18 fluid zoom transition with interactive gestures |
| **iOS < 18** | Standard Native Stack Push | High-framerate native push with Frame 1 seeded data |
| **Android** | `slide_from_right` Native Stack Push | Hardware-accelerated stack transition |

```typescript
export const USE_APPLE_ZOOM = Platform.OS === "ios";
export const ANDROID_SHARED_TRANSITION = false;
```

---

## Frame-1 Seed & Cache (`useProfile`)

To prevent the dreaded "spinner then pop" or layout bounce:
- `ProfileLink` attaches seed parameters (`id`, `name`, `username`, `avatar`, `team`, `department`) to route params.
- `useProfile(params)` immediately checks `useCommunityStore.members[id]`.
- If cached in store, it returns the complete profile (`isPlaceholder: false`).
- If not yet in store, it constructs an immediate valid profile from `params` (`isPlaceholder: true`), allowing the avatar, full name, badge, and bio to mount on Frame 1.
- Unit tested in `__tests__/useProfile.test.ts`.

---

## Deferred Rendering (`useAfterTransition`)

Rendering heavy lists or image grids while the screen is in transit degrades frame rates.
`useAfterTransition` listens to `navigation.addListener("transitionEnd")` with a 400ms fallback:
```typescript
const ready = useAfterTransition();

{ready ? (
  renderActiveTabContent()
) : (
  <ProfileSkeleton variant={activeTab === "media" ? "grid" : "posts"} isDark={isDark} />
)}
```
This guarantees 60fps on standard devices and 120fps on ProMotion displays during the transition.
