import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";


type DevotionItem = {
  id: string;
  image: string;
  title: string;
  date: string;
  views: number;
  likes: number;
};

type DevotionCardProps = {
  item: DevotionItem;
  isDark: boolean;
  onPress?: () => void;
};

const CARD_WIDTH = 180;
const CARD_HEIGHT = 220;

function DevotionCard({ item, isDark, onPress }: DevotionCardProps) {
  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    if (onPress) {
      onPress();
    } else {
      Alert.alert("Coming Soon", "Devotions will be available soon.");
    }
  };

  const rippleColor = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <View
      style={[
        styles.cardContainer,
        {
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
          backgroundColor: isDark ? "#18181b" : "#ffffff",
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={item.title}
        android_ripple={{
          color: rippleColor,
          borderless: false,
          foreground: true,
        }}
        style={styles.cardPressable}
      >
        <Image
          source={item.image}
          cachePolicy="disk"
          contentFit="cover"
          transition={150}
          style={styles.cardImage}
        />

        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text
              numberOfLines={2}
              style={[
                styles.cardTitle,
                { color: isDark ? "#ffffff" : "#0f172a" },
              ]}
            >
              {item.title}
            </Text>

            <Text style={styles.cardDate}>{item.date}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons
                  name="eye-outline"
                  size={14}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
                <Text
                  style={[
                    styles.statText,
                    { color: isDark ? "#94a3b8" : "#64748b" },
                  ]}
                >
                  {item.views}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons
                  name="heart-outline"
                  size={14}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
                <Text
                  style={[
                    styles.statText,
                    { color: isDark ? "#94a3b8" : "#64748b" },
                  ]}
                >
                  {item.likes}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1.5,
  },
  cardPressable: {
    width: "100%",
    height: "100%",
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  cardContent: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  cardDate: {
    color: "#ff6719",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "500",
  },
});

type DevotionListProps = {
  data: DevotionItem[];
  isDark: boolean;
};

export function DevotionList({ data, isDark }: DevotionListProps) {
  const flatListRef = useRef<FlatList>(null);

  const infiniteData = [...data, ...data, ...data];

  const onScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width;

    if (contentOffsetX + layoutWidth >= contentWidth - CARD_WIDTH) {
      flatListRef.current?.scrollToOffset({
        offset: contentWidth / 3,
        animated: false,
      });
    }
  };

  return (
    <FlatList
      ref={flatListRef}
      data={infiniteData}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) => item.id + index}
      renderItem={({ item }) => <DevotionCard item={item} isDark={isDark} />}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      onMomentumScrollEnd={onScrollEnd}
    />
  );
}
export default DevotionCard;
