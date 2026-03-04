import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const SkeletonBox = ({
  width,
  height,
  borderRadius = 8,
  isDark,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  isDark: boolean;
  style?: any;
}) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? "#3f3f46" : "#e4e4e7",
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

interface ProductSkeletonProps {
  isDark: boolean;
}

const ProductSkeleton = ({ isDark }: ProductSkeletonProps) => {
  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      <SkeletonBox width="100%" height={140} borderRadius={0} isDark={isDark} />
      <View style={styles.content}>
        <SkeletonBox
          width="75%"
          height={14}
          isDark={isDark}
          style={{ marginBottom: 8 }}
        />
        <SkeletonBox
          width="100%"
          height={10}
          isDark={isDark}
          style={{ marginBottom: 4 }}
        />
        <SkeletonBox
          width="60%"
          height={10}
          isDark={isDark}
          style={{ marginBottom: 12 }}
        />
        <View style={styles.footer}>
          <SkeletonBox width={70} height={16} isDark={isDark} />
          <SkeletonBox
            width={32}
            height={32}
            borderRadius={10}
            isDark={isDark}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardLight: {
    backgroundColor: "#fff",
    borderColor: "#f4f4f5",
  },
  cardDark: {
    backgroundColor: "#262626",
    borderColor: "#3f3f46",
  },
  content: {
    padding: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default ProductSkeleton;
