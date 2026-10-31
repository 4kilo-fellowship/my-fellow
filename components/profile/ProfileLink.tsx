import React, { useRef } from "react";
import { Link } from "expo-router";
import { Platform, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { USE_APPLE_ZOOM } from "@/lib/transitions";

export interface ProfileSeed {
  id: string;
  name?: string;
  username?: string;
  avatarUrl?: string | any;
  blurhash?: string;
  team?: string;
  department?: string;
}

export interface ProfileLinkProps {
  user: ProfileSeed;
  size?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showAvatar?: boolean;
  showStatusDot?: boolean;
  statusDotBorderColor?: string;
}

/**
 * Universal Entry Point for Profile Navigation (Section 5.1).
 *
 * Implements:
 * 1. UI-thread instant touch feedback (< 1 frame latency).
 * 2. Pre-fetching avatar into disk/memory cache during the finger-down window.
 * 3. Seed route parameters for Frame-1 instant header render with zero flash.
 * 4. Native iOS 18+ AppleZoom transition source wrapping the avatar.
 * 5. Minimum 44x44 touch target via hitSlop.
 */
export function ProfileLink({
  user,
  size = 40,
  children,
  style,
  showAvatar = true,
  showStatusDot = false,
  statusDotBorderColor = "#ffffff",
}: ProfileLinkProps) {
  const pressed = useSharedValue(0);
  const lastNavTime = useRef(0);

  const animatedTouchStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.04 }],
    opacity: 1 - pressed.value * 0.12,
  }));

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 70 });

    // Free speed image prefetching during press-down window
    if (typeof user.avatarUrl === "string" && user.avatarUrl.startsWith("http")) {
      try {
        Image.prefetch(user.avatarUrl, "memory-disk");
      } catch {}
    }
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 110 });
  };

  const avatarSource =
    typeof user.avatarUrl === "string"
      ? { uri: user.avatarUrl }
      : user.avatarUrl;

  const hitSlopPadding = Math.max(0, (44 - size) / 2);

  const routeParams: Record<string, string> = {
    id: user.id || "user-fellowship",
    name: user.name || "",
    username: user.username || "",
    avatar: typeof user.avatarUrl === "string" ? user.avatarUrl : "",
    blurhash: user.blurhash || "",
    team: user.team || "",
    department: user.department || "",
    srcSize: String(size),
  };

  const dotSize = Math.max(10, Math.round(size * 0.22));

  // Avatar component with fixed circular bounds
  const avatarElement = showAvatar ? (
    <View
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
      collapsable={false}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
        }}
        collapsable={false}
      >
        <Image
          source={avatarSource}
          placeholder={user.blurhash ? { blurhash: user.blurhash } : undefined}
          cachePolicy="memory-disk"
          contentFit="cover"
          style={{ width: size, height: size, borderRadius: size / 2 }}
          transition={150}
        />
      </View>
      {showStatusDot && (
        <View
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: "#22c55e",
            borderWidth: 2,
            borderColor: statusDotBorderColor,
          }}
        />
      )}
    </View>
  ) : null;

  const AppleZoom = (Link as any)?.AppleZoom;

  return (
    <Link
      asChild
      href={{
        pathname: "/community/user/[id]",
        params: routeParams,
      }}
    >
      <Pressable
        hitSlop={{
          top: hitSlopPadding,
          bottom: hitSlopPadding,
          left: hitSlopPadding,
          right: hitSlopPadding,
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={(e) => {
          // Debounce rapid double-tap to avoid navigation push duplication
          const now = Date.now();
          if (now - lastNavTime.current < 600) {
            e.preventDefault();
            return;
          }
          lastNavTime.current = now;
        }}
        style={StyleSheet.flatten([styles.container, style])}
        accessibilityRole="button"
        accessibilityLabel={`View ${user.name || user.username || "profile"}`}
      >
        <Animated.View style={[styles.innerRow, animatedTouchStyle]}>
          {showAvatar ? (
            USE_APPLE_ZOOM && Platform.OS === "ios" && AppleZoom ? (
              React.createElement(AppleZoom, null, avatarElement)
            ) : (
              avatarElement
            )
          ) : null}
          {children}
        </Animated.View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  innerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
