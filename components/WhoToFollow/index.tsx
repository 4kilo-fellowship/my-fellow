import { NativeViewAllButton } from "@/components/NativeViewAllButton";
import { PRIMARY } from "@/constants/colors";
import { useCommunityStore } from "@/stores/community.store";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface SuggestedMember {
  id: string;
  name: string;
  role: string;
  department: string;
  mutualCount: number;
  badge?: string;
  avatar: string;
}

const DEFAULT_MEMBERS: SuggestedMember[] = [
  {
    id: "m1",
    name: "Abenezer Bekele",
    role: "Worship Leader",
    department: "Software Eng. • 4th Yr",
    mutualCount: 28,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m2",
    name: "Hiwot Tadesse",
    role: "Prayer Coordinator",
    department: "Biomedical Eng. • 3rd Yr",
    mutualCount: 34,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m3",
    name: "Yohannes Hailu",
    role: "Bible Study Lead",
    department: "Electrical Eng. • 5th Yr",
    mutualCount: 19,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m4",
    name: "Bethelhem Assefa",
    role: "Freshman Mentor",
    department: "Computer Eng. • 4th Yr",
    mutualCount: 22,
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m5",
    name: "Natnael Tamiru",
    role: "Media & Tech Lead",
    department: "Information Systems • 5th Yr",
    mutualCount: 42,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
  },
];

interface WhoToFollowSectionProps {
  isDark?: boolean;
}

export const WhoToFollowSection: React.FC<WhoToFollowSectionProps> = ({ isDark = false }) => {
  const router = useRouter();
  const [members, setMembers] = useState<SuggestedMember[]>(DEFAULT_MEMBERS);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const toggleFollowMember = useCommunityStore((s) => s.toggleFollowMember);
  const communityMembers = useCommunityStore((s) => s.members);

  const toggleFollow = (id: string) => {
    if (Platform.OS !== "web") {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
    setFollowingMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    toggleFollowMember(id);
  };

  const dismissMember = (id: string) => {
    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  if (members.length === 0) return null;

  const cardRippleColor = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <View style={styles.sectionContainer}>
      {/* Header Row with View all button on the right */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? "#ffffff" : "#0f172a" },
          ]}
        >
          Who to Follow
        </Text>
        <NativeViewAllButton
          label="View all"
          onPress={() => {
            router.push("/community/search" as any);
          }}
          isDark={isDark}
          accessibilityLabel="View all suggested fellowship members"
        />
      </View>

      {/* Horizontal Carousel of Recommended Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={200}
        snapToAlignment="start"
      >
        {members.map((member) => {
          const isFollowing = !!(communityMembers[member.id]?.isFollowing ?? followingMap[member.id]);

          return (
            <View
              key={member.id}
              style={[
                styles.memberCardContainer,
                {
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                  }
                  router.push(`/community/user/${member.id}` as any);
                }}
                unstable_pressDelay={0}
                android_ripple={{
                  color: cardRippleColor,
                  borderless: false,
                  foreground: true,
                }}
                style={({ pressed }) => [
                  styles.memberCardPressable,
                  Platform.OS === "ios" && pressed && { opacity: 0.9 },
                ]}
              >
                {/* Dismiss "X" Button */}
                <Pressable
                  hitSlop={8}
                  onPress={(e) => {
                    e.stopPropagation();
                    dismissMember(member.id);
                  }}
                  android_ripple={{ color: "rgba(0,0,0,0.12)", borderless: true, radius: 14 }}
                  style={styles.dismissBtn}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={isDark ? "#71717a" : "#94a3b8"}
                  />
                </Pressable>

                {/* Avatar with Status Ring */}
                <View style={styles.avatarWrap}>
                  <ExpoImage
                    source={{ uri: member.avatar }}
                    style={styles.avatar}
                    contentFit="cover"
                    transition={150}
                  />
                  <View
                    style={[
                      styles.onlineDot,
                      { borderColor: isDark ? "#18181b" : "#ffffff" },
                    ]}
                  />
                </View>

                {/* Name & Role */}
                <Text
                  numberOfLines={1}
                  style={[styles.memberName, { color: isDark ? "#ffffff" : "#0f172a" }]}
                >
                  {member.name}
                </Text>

                <Text numberOfLines={1} style={styles.memberRole}>
                  {member.role}
                </Text>

                <Text
                  numberOfLines={1}
                  style={[styles.memberDept, { color: isDark ? "#94a3b8" : "#64748b" }]}
                >
                  {member.department}
                </Text>

                {/* Centered Social Proof Pill Badge */}
                <View
                  style={[
                    styles.socialProofWrap,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.06)"
                        : "rgba(0, 0, 0, 0.04)",
                    },
                  ]}
                >
                  <Ionicons
                    name="people"
                    size={13}
                    color={isDark ? "#94a3b8" : "#64748b"}
                  />
                  <Text
                    style={[
                      styles.socialProofText,
                      { color: isDark ? "#94a3b8" : "#64748b" },
                    ]}
                  >
                    {member.mutualCount} mutual peers
                  </Text>
                </View>

                {/* Primary Action Button: Solid Rounded Pill */}
                <View
                  style={[
                    styles.followBtnContainer,
                    {
                      backgroundColor: isFollowing
                        ? isDark
                          ? "#27272a"
                          : "#f1f5f9"
                        : PRIMARY,
                      borderColor: isFollowing
                        ? isDark
                          ? "#3f3f46"
                          : "#cbd5e1"
                        : "transparent",
                      borderWidth: isFollowing ? 1 : 0,
                    },
                    !isFollowing && styles.followBtnShadow,
                  ]}
                >
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFollow(member.id);
                    }}
                    unstable_pressDelay={0}
                    android_ripple={{
                      color: isFollowing
                        ? (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)")
                        : "rgba(255,255,255,0.3)",
                      borderless: false,
                      foreground: true,
                    }}
                    style={({ pressed }) => [
                      styles.followBtnPressable,
                      Platform.OS === "ios" && pressed && { opacity: 0.8 },
                    ]}
                  >
                    <View style={styles.followBtnContent}>
                      <Ionicons
                        name={isFollowing ? "checkmark" : "person-add"}
                        size={14}
                        color={isFollowing ? (isDark ? "#e2e8f0" : "#334155") : "#ffffff"}
                      />
                      <Text
                        style={[
                          styles.followBtnText,
                          {
                            color: isFollowing
                              ? isDark
                                ? "#e2e8f0"
                                : "#334155"
                              : "#ffffff",
                          },
                        ]}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 24,
    marginBottom: 10,
  },
  headerRow: {
    paddingHorizontal: 20,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 10,
  },
  memberCardContainer: {
    width: 186,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  memberCardPressable: {
    width: "100%",
    paddingTop: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    position: "relative",
    marginTop: 14,
    marginBottom: 8,
    alignSelf: "center",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
  },
  memberName: {
    fontSize: 14.5,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
    paddingHorizontal: 4,
    width: "100%",
  },
  memberRole: {
    fontSize: 11.5,
    fontWeight: "700",
    color: PRIMARY,
    textAlign: "center",
    marginBottom: 2,
  },
  memberDept: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 7,
    paddingHorizontal: 4,
    width: "100%",
  },
  socialProofWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
    gap: 4,
    marginBottom: 14,
  },
  socialProofText: {
    fontSize: 11,
    fontWeight: "600",
  },
  followBtnContainer: {
    width: 152,
    height: 36,
    borderRadius: 9999,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: 16,
  },
  followBtnShadow: Platform.select({
    ios: {
      shadowColor: "#ff6719",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 5,
    },
    default: {},
  }) as any,
  followBtnPressable: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  followBtnContent: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

export default WhoToFollowSection;
