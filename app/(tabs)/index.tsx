import QuickAction, { AnnouncementCard } from "@/components";
import { DevotionCard } from "@/components/DevotionCard";

import { ANNOUNCEMENTS, DEVOTIONS, QUICK_ACTIONS, VIDEOS } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
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

/* ----------------------------- VIDEO ITEM -------------------------------- */
const VideoItem: React.FC<any> = ({ item, isDark }) => {
  return (
    <View
      style={{
        backgroundColor: isDark ? "#111" : "#fff",
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: "row",
        padding: 12,
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
    </View>
  );
};

/* --------------------------------- MAIN ----------------------------------- */
const Home: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // For "scroll to bottom" button visibility
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Active announcement index for dots
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToBottom = () => {
    // This would need to be implemented differently without a ref
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

      {/* Fixed Header */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          zIndex: 20,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          height: 118,
          paddingTop: Platform.OS === "ios" ? 38 : 6,
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
      </View>

      {/* CONTENT */}
      <ScrollView
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {ANNOUNCEMENTS.map((item, index) => (
              <AnnouncementCard key={item.id} item={item} isDark={isDark} />
            ))}
          </ScrollView>

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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {QUICK_ACTIONS.map((action) => (
              <QuickAction key={action.id} item={action} isDark={isDark} />
            ))}
          </ScrollView>
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {DEVOTIONS.map((d) => (
              <DevotionCard key={d.id} item={d} isDark={isDark} />
            ))}
          </ScrollView>
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
          {VIDEOS.map((v) => (
            <VideoItem key={v.id} item={v} isDark={isDark} />
          ))}
        </View>
      </ScrollView>

      {/* Scroll to bottom FAB */}
      {showScrollToBottom && (
        <View style={styles.fabWrap}>
          <TouchableOpacity onPress={scrollToBottom} style={styles.fabInner}>
            <Ionicons name="chevrons-down" size={20} color="white" />
            <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "700" }}>
              Bottom
            </Text>
          </TouchableOpacity>
        </View>
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
