import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Text,
  ToastAndroid,
  TouchableOpacity,
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
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = 180;
const CARD_HEIGHT = 220;

function DevotionCard({ item, isDark }: DevotionCardProps) {
  const handlePress = () => {
    if (Platform.OS === "android") {
      ToastAndroid.show("Coming Soon...", ToastAndroid.SHORT);
    } else {
      console.log("Coming Soon");
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={{
        marginRight: 16,
        borderRadius: 16,
        overflow: "hidden",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        backgroundColor: isDark ? "#111" : "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        flex: 1,
      }}
    >
      <Image
        source={item.image}
        cachePolicy="disk"
        contentFit="cover"
        transition={150}
        style={{ width: "100%", height: 120 }}
      />

      <View style={{ padding: 12, flex: 1, justifyContent: "space-between" }}>
        <View className="flex-1">
          <Text
            numberOfLines={2}
            style={{
              fontWeight: "700",
              color: isDark ? "#fff" : "#111",
              marginBottom: 6,
            }}
          >
            {item.title}
          </Text>

          <Text style={{ color: "#ff6719", fontSize: 12, marginBottom: 8 }}>
            {item.date}
          </Text>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="eye-outline"
                size={14}
                color={isDark ? "#94a3b8" : "#64748b"}
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                {item.views}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="heart-outline"
                size={14}
                color={isDark ? "#94a3b8" : "#64748b"}
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                {item.likes}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
