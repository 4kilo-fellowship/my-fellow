import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Animated, Text, View } from "react-native";

type DevotionItem = {
  image: string;
  title: string;
  date: string;
  views: number;
  likes: number;
};

type DevotionCardProps = {
  item: DevotionItem;
  isDark: boolean;
  anim: Animated.Value;
};

export default function DevotionCard({
  item,
  isDark,
  anim,
}: DevotionCardProps) {
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  return (
    <Animated.View
      style={{
        marginRight: 12,
        borderRadius: 12,
        overflow: "hidden",
        width: 160,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
        transform: [{ translateY }],
        opacity: anim,
        backgroundColor: isDark ? "#111" : "#fff",
      }}
    >
      <Image
        source={item.image}
        cachePolicy="disk" // ✅ stored on disk (fast reloads)
        contentFit="cover"
        transition={150} // subtle fade-in
        style={{ width: "100%", height: 96 }}
      />

      <View style={{ padding: 12 }}>
        <Text
          numberOfLines={1}
          style={{
            fontWeight: "700",
            color: isDark ? "#fff" : "#111",
            marginBottom: 6,
          }}
        >
          {item.title}
        </Text>

        <Text style={{ color: "#14B8A6", fontSize: 12, marginBottom: 8 }}>
          {item.date}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="eye-outline"
              size={12}
              color={isDark ? "#94a3b8" : "#64748b"}
            />
            <Text
              style={{
                marginLeft: 8,
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
              size={12}
              color={isDark ? "#94a3b8" : "#64748b"}
            />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 12,
                color: isDark ? "#94a3b8" : "#64748b",
              }}
            >
              {item.likes}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
