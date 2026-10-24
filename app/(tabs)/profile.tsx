import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { PRIMARY } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/user.store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ProfileScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { authState, logout, getCurrentUser } = useAuth();
  const { user } = useUserStore();
  const router = useRouter();

  const [signOutConfirm, setSignOutConfirm] = useState(false);

  useEffect(() => {
    if (authState.authenticated) {
      getCurrentUser().catch(console.error);
    }
  }, [authState.authenticated, getCurrentUser]);

  const avatarInitial = user?.fullName
    ? user.fullName.trim().charAt(0).toUpperCase()
    : "F";

  const handleSignOut = async () => {
    setSignOutConfirm(false);
    try {
      await logout();
      router.replace("/(auth)/sign-in");
    } catch {
      // ignore
    }
  };

  const teamName =
    typeof user?.team === "string"
      ? user.team
      : (user?.team as any)?.name || "Fellowship Member";

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isDark ? "#121212" : "#f8fafc" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Header */}
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: top + 10,
            backgroundColor: isDark ? "#121212" : "#ffffff",
            borderBottomColor: isDark ? "#262626" : "#f1f5f9",
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? "#ffffff" : "#0f172a" },
          ]}
        >
          Profile
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/settings" as any)}
          style={[
            styles.settingsIconBtn,
            { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" },
          ]}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={isDark ? "#cbd5e1" : "#475569"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottom + 100 },
        ]}
      >
        {/* User Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        >
          <View style={styles.heroRow}>
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitialText}>{avatarInitial}</Text>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/edit-profile" as any)}
                style={styles.avatarBadge}
              >
                <Ionicons name="camera" size={13} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* User Meta */}
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.heroName,
                  { color: isDark ? "#ffffff" : "#0f172a" },
                ]}
                numberOfLines={1}
              >
                {user?.fullName || "Fellow Member"}
              </Text>
              <Text
                style={[
                  styles.heroPhone,
                  { color: isDark ? "#94a3b8" : "#64748b" },
                ]}
              >
                {user?.phoneNumber || "Member"}
              </Text>

              {/* Status Tag */}
              <View style={styles.badgeRow}>
                <View style={styles.activePill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.activePillText}>Active Member</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Edit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/edit-profile" as any)}
            style={[
              styles.editProfileBtn,
              {
                backgroundColor: isDark ? "#334155" : "#f1f5f9",
                borderColor: isDark ? "#475569" : "#e2e8f0",
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color={isDark ? "#e2e8f0" : "#334155"}
            />
            <Text
              style={[
                styles.editProfileBtnText,
                { color: isDark ? "#e2e8f0" : "#334155" },
              ]}
            >
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "#334155" : "#e2e8f0",
              },
            ]}
          >
            <Ionicons name="book-outline" size={22} color={PRIMARY} />
            <Text
              style={[
                styles.statNumber,
                { color: isDark ? "#ffffff" : "#0f172a" },
              ]}
            >
              24
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              Devotions
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              {
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "#334155" : "#e2e8f0",
              },
            ]}
          >
            <Ionicons name="people-outline" size={22} color="#10b981" />
            <Text
              style={[
                styles.statNumber,
                { color: isDark ? "#ffffff" : "#0f172a" },
              ]}
            >
              1
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              Team
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              {
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "#334155" : "#e2e8f0",
              },
            ]}
          >
            <Ionicons name="flame-outline" size={22} color="#f59e0b" />
            <Text
              style={[
                styles.statNumber,
                { color: isDark ? "#ffffff" : "#0f172a" },
              ]}
            >
              7
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
            >
              Day Streak
            </Text>
          </View>
        </View>

        {/* Ministry Information Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#94a3b8" : "#64748b" },
            ]}
          >
            MINISTRY & ACADEMICS
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="ribbon-outline" size={18} color={PRIMARY} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? "#94a3b8" : "#64748b" },
                ]}
              >
                Fellowship Team
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isDark ? "#ffffff" : "#0f172a" },
                ]}
              >
                {teamName}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="school-outline" size={18} color="#0284c7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? "#94a3b8" : "#64748b" },
                ]}
              >
                Department
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isDark ? "#ffffff" : "#0f172a" },
                ]}
              >
                {user?.department || "Campus Fellow"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="calendar-outline" size={18} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? "#94a3b8" : "#64748b" },
                ]}
              >
                Academic Year
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isDark ? "#ffffff" : "#0f172a" },
                ]}
              >
                {user?.yearOfStudy || "Not set"}
              </Text>
            </View>
          </View>

          {user?.telegramUserName ? (
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="paper-plane-outline" size={18} color="#06b6d4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: isDark ? "#94a3b8" : "#64748b" },
                  ]}
                >
                  Telegram
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: isDark ? "#ffffff" : "#0f172a" },
                  ]}
                >
                  {user.telegramUserName}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Menu Actions */}
        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            },
          ]}
        >
          {/* Dark Mode Toggle */}
          <View style={styles.menuItem}>
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: isDark ? "#334155" : "#f1f5f9" },
              ]}
            >
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={20}
                color={isDark ? "#facc15" : "#ea580c"}
              />
            </View>
            <Text
              style={[
                styles.menuItemLabel,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              Dark Theme
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              thumbColor={Platform.OS === "android" ? PRIMARY : undefined}
              trackColor={{ false: "#e2e8f0", true: `${PRIMARY}88` }}
            />
          </View>

          {/* Teams Navigation */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/teams" as any)}
            style={styles.menuItem}
          >
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: isDark ? "#334155" : "#f1f5f9" },
              ]}
            >
              <Ionicons name="people-outline" size={20} color={PRIMARY} />
            </View>
            <Text
              style={[
                styles.menuItemLabel,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              Ministry Teams
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? "#64748b" : "#94a3b8"}
            />
          </TouchableOpacity>

          {/* Change Password */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/change-password" as any)}
            style={styles.menuItem}
          >
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: isDark ? "#334155" : "#f1f5f9" },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={isDark ? "#cbd5e1" : "#475569"}
              />
            </View>
            <Text
              style={[
                styles.menuItemLabel,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              Change Password
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? "#64748b" : "#94a3b8"}
            />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/help" as any)}
            style={styles.menuItem}
          >
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: isDark ? "#334155" : "#f1f5f9" },
              ]}
            >
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={isDark ? "#cbd5e1" : "#475569"}
              />
            </View>
            <Text
              style={[
                styles.menuItemLabel,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              Help & Support
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? "#64748b" : "#94a3b8"}
            />
          </TouchableOpacity>

          {/* About Fellowship */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/about" as any)}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
          >
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: isDark ? "#334155" : "#f1f5f9" },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={isDark ? "#cbd5e1" : "#475569"}
              />
            </View>
            <Text
              style={[
                styles.menuItemLabel,
                { color: isDark ? "#f8fafc" : "#0f172a" },
              ]}
            >
              About Fellowship
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? "#64748b" : "#94a3b8"}
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSignOutConfirm(true)}
          style={[
            styles.signOutBtn,
            {
              backgroundColor: isDark ? "#2a1515" : "#fef2f2",
              borderColor: isDark ? "#451a1a" : "#fecaca",
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={19} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirm Sign Out Modal */}
      <ConfirmModal
        visible={signOutConfirm}
        onClose={() => setSignOutConfirm(false)}
        isDark={isDark}
        icon="log-out-outline"
        iconColor="#ef4444"
        title="Sign Out"
        description="Are you sure you want to sign out of your account on this device?"
        buttons={[
          {
            label: "Sign Out",
            onPress: handleSignOut,
            variant: "danger",
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  settingsIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 18,
    gap: 16,
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${PRIMARY}22`,
    borderWidth: 2,
    borderColor: `${PRIMARY}44`,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialText: {
    fontSize: 30,
    fontWeight: "800",
    color: PRIMARY,
  },
  avatarBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  heroName: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  heroPhone: {
    fontSize: 13,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  activePillText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "700",
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
  },
  editProfileBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(148, 163, 184, 0.2)",
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(148, 163, 184, 0.2)",
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  signOutText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "700",
  },
});
