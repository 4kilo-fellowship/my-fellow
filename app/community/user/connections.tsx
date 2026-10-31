import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { socialApi } from "@/services/socialApi";
import { MemberProfile, useCommunityStore } from "@/stores/community.store";
import { getPrefilledAvatar } from "@/utils/avatar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function UserConnectionsScreen() {
  const { id, initialTab, name } = useLocalSearchParams<{
    id: string;
    initialTab?: "followers" | "following";
    name?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    initialTab === "following" ? "following" : "followers"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [apiFollowers, setApiFollowers] = useState<MemberProfile[]>([]);
  const [apiFollowing, setApiFollowing] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const membersMap = useCommunityStore((s) => s.members);
  const toggleFollowMember = useCommunityStore((s) => s.toggleFollowMember);

  const allMembers = useMemo(() => Object.values(membersMap), [membersMap]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const adaptUser = (u: any): MemberProfile => ({
      id: u.id,
      fullName: u.displayName || u.fullName || u.username || "Fellowship Member",
      handle: u.username?.startsWith("@") ? u.username : `@${u.username || "fellow"}`,
      avatar:
        typeof u.avatar === "string"
          ? u.avatar
          : u.avatar?.urls?.md || u.avatar?.urls?.sm || getPrefilledAvatar(u.id),
      banner:
        "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
      team: u.fellowshipRole || u.ministryBadge || u.team || "Campus Ministry",
      department: u.department || "Addis Ababa University",
      academicYear: u.academicYear || "AAU 4 Kilo",
      bio: u.bio || "Rooted in Christ.",
      streakDays: 1,
      followersCount: 1,
      followingCount: 1,
      postsCount: 0,
      isFollowing: !!u.isFollowing,
    });

    Promise.all([
      socialApi.getUserFollowers(id),
      socialApi.getUserFollowing(id),
    ])
      .then(([followers, following]) => {
        if (Array.isArray(followers) && followers.length > 0) {
          setApiFollowers(followers.map(adaptUser));
        }
        if (Array.isArray(following) && following.length > 0) {
          setApiFollowing(following.map(adaptUser));
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Derived follower/following lists (API first, falling back to cache)
  const followersList = useMemo(() => {
    return apiFollowers.length > 0
      ? apiFollowers
      : allMembers.filter((m) => m.id !== id);
  }, [apiFollowers, allMembers, id]);

  const followingList = useMemo(() => {
    return apiFollowing.length > 0
      ? apiFollowing
      : allMembers.filter(
          (m) => m.id !== id && (m.isFollowing || m.followersCount > 100),
        );
  }, [apiFollowing, allMembers, id]);

  const activeList = activeTab === "followers" ? followersList : followingList;

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeList;
    return activeList.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.handle.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.team.toLowerCase().includes(q)
    );
  }, [activeList, searchQuery]);

  const textColor = isDark ? "#ffffff" : "#0f172a";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#27272a" : "#e2e8f0";
  const bg = isDark ? "#09090b" : "#ffffff";
  const inputBg = isDark ? "#1f1f23" : "#f1f5f9";

  return (
    <View style={[styles.screen, { backgroundColor: bg, paddingTop: insets.top }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header Bar */}
      <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          android_ripple={{
            color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
            borderless: true,
            radius: 20,
          }}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && Platform.OS === "ios" && { opacity: 0.7 },
          ]}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={textColor} />
        </Pressable>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            {name || "Fellowship Network"}
          </Text>
          <Text style={[styles.headerSub, { color: mutedColor }]}>
            {activeTab === "followers" ? `${followersList.length} Followers` : `${followingList.length} Following`}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setActiveTab("followers");
          }}
          style={styles.tabBtn}
        >
          <Text
            style={[
              styles.tabBtnText,
              {
                color: activeTab === "followers" ? textColor : mutedColor,
                fontWeight: activeTab === "followers" ? "700" : "500",
              },
            ]}
          >
            Followers ({followersList.length})
          </Text>
          {activeTab === "followers" && <View style={[styles.tabIndicator, { backgroundColor: PRIMARY }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setActiveTab("following");
          }}
          style={styles.tabBtn}
        >
          <Text
            style={[
              styles.tabBtnText,
              {
                color: activeTab === "following" ? textColor : mutedColor,
                fontWeight: activeTab === "following" ? "700" : "500",
              },
            ]}
          >
            Following ({followingList.length})
          </Text>
          {activeTab === "following" && <View style={[styles.tabIndicator, { backgroundColor: PRIMARY }]} />}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchInputContainer, { backgroundColor: inputBg, borderColor }]}>
          <Ionicons name="search" size={17} color={mutedColor} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor={mutedColor}
            style={[styles.searchInput, { color: textColor }]}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={17} color={mutedColor} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Member List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: 48, alignItems: "center" }}>
              <ActivityIndicator size="small" color={PRIMARY} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={44} color={mutedColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                No members found
              </Text>
              <Text style={[styles.emptySub, { color: mutedColor }]}>
                {searchQuery
                  ? "Try a different search keyword"
                  : `No ${activeTab} yet.`}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
              }
              router.push(`/community/user/${item.id}` as any);
            }}
            android_ripple={{
              color: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              borderless: false,
            }}
            style={({ pressed }) => [
              styles.memberRow,
              { borderBottomColor: borderColor },
              pressed && Platform.OS === "ios" && { opacity: 0.8 },
            ]}
          >
            <ExpoImage
              source={typeof item.avatar === "string" ? { uri: item.avatar } : item.avatar}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.memberInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.memberName, { color: textColor }]} numberOfLines={1}>
                  {item.fullName}
                </Text>
                <Ionicons name="checkmark-circle" size={14} color={PRIMARY} style={{ marginLeft: 4 }} />
              </View>
              <Text style={[styles.memberHandle, { color: mutedColor }]} numberOfLines={1}>
                {item.handle} · {item.department}
              </Text>
              <Text style={[styles.memberTeam, { color: PRIMARY }]} numberOfLines={1}>
                {item.team}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                if (Platform.OS !== "web") {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                }
                toggleFollowMember(item.id);
              }}
              style={[
                styles.followBtn,
                {
                  backgroundColor: item.isFollowing ? (isDark ? "#27272a" : "#f1f5f9") : PRIMARY,
                  borderColor: item.isFollowing ? borderColor : "transparent",
                  borderWidth: item.isFollowing ? 1 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.followBtnText,
                  { color: item.isFollowing ? textColor : "#ffffff" },
                ]}
              >
                {item.isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerRow: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerSub: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabBtnText: {
    fontSize: 14,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 3,
    borderRadius: 1.5,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
  },
  memberHandle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  memberTeam: {
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  followBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
  },
});
