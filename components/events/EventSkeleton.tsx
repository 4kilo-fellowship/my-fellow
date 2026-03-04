import React, { memo, useEffect } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface EventSkeletonProps {
  isDark: boolean;
}

const EventSkeleton = ({ isDark }: EventSkeletonProps) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const bgColor = isDark ? "#2a2a2b" : "#e5e7eb";
  const containerBg = isDark ? "#1A1A1B" : "#ffffff";

  return (
    <View style={{ flex: 1, backgroundColor: containerBg }}>
      {/* Header Image Skeleton */}
      <Animated.View
        style={[
          animatedStyle,
          { width: "100%", height: "45%", backgroundColor: bgColor },
        ]}
      />

      <View
        style={{
          flex: 1,
          marginTop: -24,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 24,
          paddingTop: 32,
          backgroundColor: containerBg,
        }}
      >
        {/* Title Skeleton */}
        <Animated.View
          style={[
            animatedStyle,
            {
              width: "40%",
              height: 24,
              backgroundColor: bgColor,
              borderRadius: 8,
              marginBottom: 12,
            },
          ]}
        />

        {/* Description Skeletons */}
        <Animated.View
          style={[
            animatedStyle,
            {
              width: "100%",
              height: 16,
              backgroundColor: bgColor,
              borderRadius: 8,
              marginBottom: 8,
            },
          ]}
        />
        <Animated.View
          style={[
            animatedStyle,
            {
              width: "90%",
              height: 16,
              backgroundColor: bgColor,
              borderRadius: 8,
              marginBottom: 8,
            },
          ]}
        />
        <Animated.View
          style={[
            animatedStyle,
            {
              width: "95%",
              height: 16,
              backgroundColor: bgColor,
              borderRadius: 8,
              marginBottom: 24,
            },
          ]}
        />

        {/* Location Skeleton */}
        <Animated.View
          style={[
            animatedStyle,
            {
              width: "100%",
              height: 80,
              backgroundColor: bgColor,
              borderRadius: 12,
            },
          ]}
        />
      </View>
    </View>
  );
};

export default memo(EventSkeleton);
