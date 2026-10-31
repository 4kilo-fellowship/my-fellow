import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ProfileSkeletonProps {
  variant?: "grid" | "stats" | "bio" | "posts";
  isDark?: boolean;
}

export function ProfileSkeleton({
  variant = "grid",
  isDark = false,
}: ProfileSkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 700 }),
        withTiming(0.4, { duration: 700 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const placeholderBg = isDark ? "#27272a" : "#e2e8f0";

  if (variant === "grid") {
    const cellSize = (SCREEN_WIDTH - 36) / 3;
    return (
      <View style={styles.gridContainer}>
        {Array.from({ length: 9 }).map((_, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.gridCell,
              animatedStyle,
              {
                width: cellSize,
                height: cellSize,
                backgroundColor: placeholderBg,
              },
            ]}
          />
        ))}
      </View>
    );
  }

  if (variant === "stats") {
    return (
      <View style={styles.statsRow}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <View key={idx} style={styles.statCol}>
            <Animated.View
              style={[
                styles.statNum,
                animatedStyle,
                { backgroundColor: placeholderBg },
              ]}
            />
            <Animated.View
              style={[
                styles.statLabel,
                animatedStyle,
                { backgroundColor: placeholderBg },
              ]}
            />
          </View>
        ))}
      </View>
    );
  }

  if (variant === "posts") {
    return (
      <View style={styles.postsContainer}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <View key={idx} style={styles.postSkeletonRow}>
            <Animated.View
              style={[
                styles.postAvatar,
                animatedStyle,
                { backgroundColor: placeholderBg },
              ]}
            />
            <View style={{ flex: 1, gap: 8 }}>
              <Animated.View
                style={[
                  styles.postLineHeader,
                  animatedStyle,
                  { width: "40%", backgroundColor: placeholderBg },
                ]}
              />
              <Animated.View
                style={[
                  styles.postLineText,
                  animatedStyle,
                  { width: "95%", backgroundColor: placeholderBg },
                ]}
              />
              <Animated.View
                style={[
                  styles.postLineText,
                  animatedStyle,
                  { width: "75%", backgroundColor: placeholderBg },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.bioContainer}>
      <Animated.View
        style={[
          styles.bioLine,
          animatedStyle,
          { width: "90%", backgroundColor: placeholderBg },
        ]}
      />
      <Animated.View
        style={[
          styles.bioLine,
          animatedStyle,
          { width: "70%", backgroundColor: placeholderBg, marginTop: 6 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 6,
  },
  gridCell: {
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  statCol: {
    alignItems: "center",
  },
  statNum: {
    width: 32,
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  statLabel: {
    width: 50,
    height: 12,
    borderRadius: 3,
  },
  bioContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bioLine: {
    height: 14,
    borderRadius: 4,
  },
  postsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  postSkeletonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postLineHeader: {
    height: 14,
    borderRadius: 4,
  },
  postLineText: {
    height: 12,
    borderRadius: 4,
  },
});
