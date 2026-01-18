import { AnnouncementCard, QuickAction, VideoItem } from "@/components";
import { DevotionCard } from "@/components/DevotionCard";
import { ANNOUNCEMENTS, DEVOTIONS, QUICK_ACTIONS, VIDEOS } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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

const Home: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0F0F10" : "#f8fafc" }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      <View
        style={{
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
          backgroundColor: isDark ? "#111827" : "#ffffff",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: Platform.OS === "ios" ? 8 : 12,
            paddingBottom: 16,
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

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 32, marginBottom: 8 }}>
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

        <View style={{ marginTop: 28 }}>
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

        <View style={{ marginTop: 28 }}>
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

        <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
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
});

export default Home;
