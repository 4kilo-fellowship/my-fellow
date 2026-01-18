import { ANNOUNCEMENTS, DEVOTIONS, QUICK_ACTIONS, VIDEOS } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

/* -------------------------- ANNOUNCEMENT CARD ----------------------------- */
const AnnouncementCard: React.FC<any> = ({ item, index, scrollX, isDark }) => {
  const inputRange = [
    (index - 1) * (width - 48),
    index * (width - 48),
    (index + 1) * (width - 48),
  ];
  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.2, 0, -width * 0.2],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={{
        marginRight: 16,
        overflow: "hidden",
        borderRadius: 20,
        width: width - 48,
        height: 200,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <View style={{ flex: 1 }}>
        <Animated.Image
          source={{ uri: item.image }}
          style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFill]}>
          <LinearGradient
            colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.45)"]}
            style={{ flex: 1 }}
          />
        </View>

        <View style={{ flex: 1, justifyContent: "flex-end", padding: 16 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: "800",
              marginBottom: 4,
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {item.subtitle}
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: "#14B8A6",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", marginRight: 8 }}>
              {item.cta}
            </Text>
            <Ionicons name={item.ctaIcon} size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

/* ----------------------------- QUICK ACTION ------------------------------- */
const QuickAction: React.FC<any> = ({ item, isDark }) => (
  <TouchableOpacity style={{ alignItems: "center", marginRight: 16 }}>
    <View
      style={{
        width: 56,
        height: 56,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDark ? "#262626" : "#f1f5f9",
      }}
    >
      <Ionicons
        name={item.icon}
        size={22}
        color={isDark ? "#60A5FA" : "#0369A1"}
      />
    </View>
    <Text
      style={{
        marginTop: 8,
        fontSize: 12,
        color: isDark ? "#cbd5e1" : "#475569",
      }}
    >
      {item.label}
    </Text>
  </TouchableOpacity>
);

/* ---------------------------- DEVOTION CARD ------------------------------- */
const DevotionCard: React.FC<any> = ({ item, isDark, anim }) => {
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const opacity = anim;

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
        opacity,
        backgroundColor: isDark ? "#111" : "#fff",
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: "100%", height: 96 }}
      />
      <View style={{ padding: 12 }}>
        <Text
          style={{
            fontWeight: "700",
            color: isDark ? "#fff" : "#111",
            marginBottom: 6,
          }}
          numberOfLines={1}
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
};

/* ----------------------------- VIDEO ITEM -------------------------------- */
const VideoItem: React.FC<any> = ({ item, isDark, anim }) => {
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const opacity = anim;

  return (
    <Animated.View
      style={{
        backgroundColor: isDark ? "#111" : "#fff",
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: "row",
        padding: 12,
        transform: [{ translateY }],
        opacity,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
      }}
    >
      <View style={{ flex: 1, paddingRight: 8, justifyContent: "center" }}>
        <Text
          style={{
            fontWeight: "700",
            color: isDark ? "#fff" : "#111",
            fontSize: 16,
            marginBottom: 6,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            color: isDark ? "#94a3b8" : "#64748b",
            fontSize: 13,
            marginBottom: 8,
          }}
          numberOfLines={2}
        >
          {item.desc}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="time-outline"
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
            {item.duration}
          </Text>
        </View>
      </View>

      <View
        style={{ width: 110, height: 70, borderRadius: 8, overflow: "hidden" }}
      >
        <Image
          source={{ uri: item.thumbnail }}
          style={{ width: "100%", height: "100%" }}
        />
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.25)"]}
            style={{ flex: 1 }}
          />
        </View>
        <View style={styles.playIconWrap}>
          <Ionicons name="play-circle" size={28} color="white" />
        </View>
      </View>
    </Animated.View>
  );
};

/* --------------------------------- MAIN ----------------------------------- */
const Home: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Animations for DEVOTIONS
  const devotionAnims = useMemo(
    () => DEVOTIONS.map(() => new Animated.Value(0)),
    [],
  );

  // Loading State
  const [loading, setLoading] = useState(true);

  // Animation refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const announceScrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);

  // For "scroll to bottom" button visibility
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // For fade-in sequence (VIDEOS)
  const itemAnim = useMemo(() => VIDEOS.map(() => new Animated.Value(0)), []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.stagger(
        80,
        devotionAnims.map((a) =>
          Animated.timing(a, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }
  }, [loading, devotionAnims]);

  useEffect(() => {
    if (!loading) {
      Animated.stagger(
        100,
        itemAnim.map((a) =>
          Animated.timing(a, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }
  }, [loading, itemAnim]);

  // Header animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [118, 72],
    extrapolate: "clamp",
  });

  const headerPaddingTop = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [38, Platform.OS === "ios" ? 18 : 6],
    extrapolate: "clamp",
  });

  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [0, 0.12],
    extrapolate: "clamp",
  });

  // Active announcement index for dots
  const [activeIndex, setActiveIndex] = useState(0);
  const onAnnouncementScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: announceScrollX } } }],
    {
      useNativeDriver: true,
      listener: (e: any) => {
        const x = e.nativeEvent.contentOffset.x;
        const idx = Math.round(x / (width - 48));
        setActiveIndex(idx);
      },
    },
  );

  // Scroll event for main scroll view
  const onScrollMain = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        setShowScrollToBottom(y > height * 0.45);
      },
    },
  );

  const scrollToBottom = () => {
    if (scrollRef.current) {
      // @ts-ignore - scrollToEnd available
      (scrollRef.current as any).scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F0F10" : "#f8fafc" }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      {/* Animated Header */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          zIndex: 20,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          height: headerHeight,
          paddingTop: headerPaddingTop,
          shadowOpacity: headerShadowOpacity,
          backgroundColor: isDark
            ? "rgba(20,20,21,0.4)"
            : "rgba(255,255,255,0.7)",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
            },
            android: {
              elevation: 8,
            },
          }),
        }}
      >
        <BlurView
          intensity={30}
          style={StyleSheet.absoluteFill}
          tint={isDark ? "dark" : "light"}
        />

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("@/assets/images/logo-primary.png")}
              style={{ width: 140, height: 36 }}
              resizeMode="contain"
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 12 }}>
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={22}
                color={isDark ? "#fff" : "#111827"}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDark ? "#1f2937" : "#f1f5f9",
                }}
              >
                <Ionicons
                  name="person"
                  size={18}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* CONTENT */}
      <Animated.ScrollView
        ref={(r) => (scrollRef.current = r as any)}
        onScroll={onScrollMain}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Announcements */}
        <View style={{ marginTop: 20 }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: isDark ? "#fff" : "#0f172a",
              }}
            >
              Upcoming Events
            </Text>
          </View>

          <Animated.FlatList
            data={ANNOUNCEMENTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i: any) => i.id}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            snapToInterval={width - 48}
            decelerationRate="fast"
            onScroll={onAnnouncementScroll}
            scrollEventThrottle={16}
            renderItem={({ item, index }: any) => (
              <AnnouncementCard
                item={item}
                index={index}
                scrollX={announceScrollX}
                isDark={isDark}
              />
            )}
            style={{ paddingTop: 4 }}
          />

          {/* Pagination */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 12,
            }}
          >
            {ANNOUNCEMENTS.map((_, i) => (
              <View
                key={i}
                style={[
                  {
                    height: 8,
                    borderRadius: 8,
                    marginHorizontal: 6,
                  },
                  i === activeIndex
                    ? { width: 36, backgroundColor: "#06b6d4" }
                    : {
                        width: 8,
                        backgroundColor: isDark ? "#2b2b2b" : "#e6e7ea",
                      },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginTop: 20 }}>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {QUICK_ACTIONS.map((action) => (
              <QuickAction key={action.id} item={action} isDark={isDark} />
            ))}
          </Animated.ScrollView>
        </View>

        {/* Devotions */}
        <View style={{ marginTop: 20 }}>
          <View
            style={{
              paddingHorizontal: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: isDark ? "#fff" : "#0f172a",
              }}
            >
              Recent Devotions
            </Text>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Text
                style={{
                  color: "#14B8A6",
                  fontWeight: "600",
                  marginRight: 8,
                }}
              >
                View All
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={isDark ? "#60a5fa" : "#0369A1"}
              />
            </TouchableOpacity>
          </View>

          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {DEVOTIONS.map((d, idx) => (
              <DevotionCard
                key={d.id}
                item={d}
                isDark={isDark}
                anim={devotionAnims[idx]}
              />
            ))}
          </Animated.ScrollView>
        </View>

        {/* Videos */}
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              marginBottom: 12,
              color: isDark ? "#fff" : "#0f172a",
            }}
          >
            Latest Sermons
          </Text>
          {VIDEOS.map((v, i) => (
            <VideoItem key={v.id} item={v} isDark={isDark} anim={itemAnim[i]} />
          ))}
        </View>
      </Animated.ScrollView>

      {/* Scroll to bottom FAB */}
      {showScrollToBottom && (
        <Animated.View style={styles.fabWrap as any}>
          <TouchableOpacity onPress={scrollToBottom} style={styles.fabInner}>
            <Ionicons name="chevrons-down" size={20} color="white" />
            <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "700" }}>
              Bottom
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  playIconWrap: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "rgba(0,0,0,0.28)",
    padding: 6,
    borderRadius: 20,
  },
  fabWrap: {
    position: "absolute",
    right: 18,
    bottom: 28,
    zIndex: 50,
  },
  fabInner: {
    backgroundColor: "#06b6d4",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default Home;
