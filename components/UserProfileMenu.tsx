import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/user.store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  type: "action" | "toggle" | "navigation" | "divider";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

const UserProfileMenu = () => {
  const { theme, toggleTheme } = useTheme();
  const { authState, logout, getCurrentUser } = useAuth();
  const { user } = useUserStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [slideAnim] = useState(
    new Animated.Value(Dimensions.get("window").width),
  );
  const [backdropAnim] = useState(new Animated.Value(0));

  const isAuthenticated = authState.authenticated === true;

  // Fetch user data when authenticated and no user data
  useEffect(() => {
    if (isAuthenticated && !user) {
      getCurrentUser().catch(console.error);
    }
  }, [isAuthenticated, user, getCurrentUser]);

  const openMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: Dimensions.get("window").width,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setMenuVisible(false));
  };

  const handleSignOut = async () => {
    closeMenu();
    setTimeout(async () => {
      try {
        await logout();
        router.replace("/(auth)/sign-in");
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }, 300);
  };

  const handleSignIn = () => {
    closeMenu();
    setTimeout(() => {
      router.push("/(auth)/sign-in");
    }, 300);
  };

  const handleSettings = () => {
    closeMenu();
    setTimeout(() => {
      router.push("/settings" as any);
    }, 300);
  };

  // Menu items configuration (constants)
  const menuItems: MenuItem[] = [
    {
      id: "theme",
      icon: isDark ? "moon" : "sunny",
      label: "Dark Mode",
      type: "toggle",
      value: isDark,
      onToggle: () => toggleTheme(),
    },
    {
      id: "divider1",
      icon: "ellipse",
      label: "",
      type: "divider",
    },
    {
      id: "settings",
      icon: "settings-outline",
      label: "Settings",
      type: "navigation",
      onPress: handleSettings,
    },
    {
      id: "notifications",
      icon: "notifications-outline",
      label: "Notifications",
      type: "navigation",
      onPress: () => {
        closeMenu();
        router.push("/reminders" as any);
      },
    },
    {
      id: "help",
      icon: "help-circle-outline",
      label: "Help & Support",
      type: "navigation",
      onPress: handleSettings,
    },
    {
      id: "about",
      icon: "information-circle-outline",
      label: "About",
      type: "navigation",
      onPress: handleSettings,
    },
    {
      id: "divider2",
      icon: "ellipse",
      label: "",
      type: "divider",
    },
    {
      id: "auth",
      icon: isAuthenticated ? "log-out-outline" : "log-in-outline",
      label: isAuthenticated ? "Sign Out" : "Sign In",
      type: "action",
      danger: isAuthenticated,
      onPress: isAuthenticated ? handleSignOut : handleSignIn,
    },
  ];

  const renderMenuItem = (item: MenuItem) => {
    if (item.type === "divider") {
      return (
        <View
          key={item.id}
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
            },
          ]}
        />
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.menuItem,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.02)",
          },
        ]}
        onPress={() => {
          if (item.type === "toggle") {
            item.onToggle?.(!item.value);
          } else {
            item.onPress?.();
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: item.danger
                  ? "rgba(239, 68, 68, 0.15)"
                  : isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
              },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={item.danger ? "#ef4444" : isDark ? "#fff" : "#374151"}
            />
          </View>
          <Text
            style={[
              styles.menuItemLabel,
              {
                color: item.danger ? "#ef4444" : isDark ? "#fff" : "#1f2937",
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
        {item.type === "toggle" && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: "#d1d5db", true: "#ff6619" }}
            thumbColor="#ffffff"
            ios_backgroundColor="#d1d5db"
          />
        )}
        {item.type === "navigation" && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* profile */}
      <TouchableOpacity onPress={openMenu} activeOpacity={0.8}>
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor: isAuthenticated
                ? "#ff6619"
                : isDark
                  ? "#2c2c2e"
                  : "#ffffff",
              borderColor: isAuthenticated
                ? "#ff6619"
                : isDark
                  ? "#3c3c3e"
                  : "#e5e7eb",
            },
          ]}
        >
          {isAuthenticated && user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : isAuthenticated ? (
            <Ionicons
              name="person"
              size={22}
              color={isDark ? "#fff" : "#374151"}
            />
          ) : (
            <Ionicons
              name="person"
              size={22}
              color={isDark ? "#fff" : "#374151"}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Side Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeMenu}
      >
        {/* Backdrop with blur effect */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <Pressable style={styles.backdropPressable} onPress={closeMenu} />
        </Animated.View>

        {/* Side Panel */}
        <Animated.View
          style={[
            styles.sidePanel,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Gradient Background */}
          <LinearGradient
            colors={
              isDark
                ? ["#0a0a0a", "#1a1a1a", "#0f0f0f"]
                : ["#ffffff", "#f8fafc", "#f1f5f9"]
            }
            style={styles.gradientBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* header */}
          <View style={[styles.panelHeader, { paddingTop: insets.top + 12 }]}>
            <Text
              style={[
                styles.panelTitle,
                { color: isDark ? "#fff" : "#1f2937" },
              ]}
            >
              Profile
            </Text>
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
              onPress={closeMenu}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close"
                size={22}
                color={isDark ? "#fff" : "#374151"}
              />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 40 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* User Profile Section */}
            <View
              style={[
                styles.profileSection,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.02)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                },
              ]}
            >
              {/* Profile Image */}
              <View style={styles.profileImageWrapper}>
                <LinearGradient
                  colors={["#ff6619", "#ff8a50", "#ffb380"]}
                  style={styles.profileImageGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View
                    style={[
                      styles.profileImageInner,
                      { backgroundColor: isDark ? "#0a0a0a" : "#ffffff" },
                    ]}
                  >
                    {isAuthenticated && user?.profileImage ? (
                      <Image
                        source={{
                          uri: user.profileImage,
                        }}
                        style={styles.profileImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons
                        name="person"
                        size={48}
                        color={isDark ? "#334155" : "#cbd5e1"}
                      />
                    )}
                  </View>
                </LinearGradient>
                {isAuthenticated && (
                  <View style={styles.onlineBadge}>
                    <View style={styles.onlineBadgeInner} />
                  </View>
                )}
              </View>

              {/* User Info */}
              {isAuthenticated && user ? (
                <View style={styles.profileInfo}>
                  <Text
                    style={[
                      styles.profileName,
                      { color: isDark ? "#fff" : "#1f2937" },
                    ]}
                  >
                    {user.fullName || "Fellow Member"}
                  </Text>
                  <Text
                    style={[
                      styles.profilePhone,
                      { color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280" },
                    ]}
                  >
                    {user.phoneNumber}
                  </Text>
                  {user.team && (
                    <View
                      style={[
                        styles.teamBadge,
                        {
                          backgroundColor: isDark
                            ? "rgba(255,102,25,0.15)"
                            : "rgba(255,102,25,0.1)",
                        },
                      ]}
                    >
                      <MaterialIcons name="groups" size={14} color="#ff6619" />
                      <Text style={styles.teamText}>{user.team}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.profileInfo}>
                  <Text
                    style={[
                      styles.profileName,
                      { color: isDark ? "#fff" : "#1f2937" },
                    ]}
                  >
                    Guest User
                  </Text>
                  <Text
                    style={[
                      styles.profilePhone,
                      { color: isDark ? "rgba(255,255,255,0.6)" : "#6b7280" },
                    ]}
                  >
                    Sign in to access all features
                  </Text>
                </View>
              )}
            </View>

            {/* Account Stats - Only for authenticated users */}
            {isAuthenticated && user && (
              <View style={styles.statsContainer}>
                {/* Department Stat */}
                <View
                  style={[
                    styles.statItem,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,102,25,0.06)"
                        : "rgba(255,102,25,0.03)",
                      borderColor: isDark
                        ? "rgba(255,102,25,0.15)"
                        : "rgba(255,102,25,0.08)",
                    },
                  ]}
                >
                  <View style={styles.statIconContainer}>
                    <Ionicons name="layers-outline" size={18} color="#ff6619" />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" },
                      ]}
                    >
                      Department
                    </Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      style={[
                        styles.statValue,
                        { color: isDark ? "#fff" : "#1e293b" },
                      ]}
                    >
                      {user.department || "Not set"}
                    </Text>
                  </View>
                </View>

                {/* Year Stat */}
                <View
                  style={[
                    styles.statItem,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,102,25,0.06)"
                        : "rgba(255,102,25,0.03)",
                      borderColor: isDark
                        ? "rgba(255,102,25,0.15)"
                        : "rgba(255,102,25,0.08)",
                    },
                  ]}
                >
                  <View style={styles.statIconContainer}>
                    <Ionicons
                      name="calendar-clear-outline"
                      size={18}
                      color="#ff6619"
                    />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8" },
                      ]}
                    >
                      Year
                    </Text>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      style={[
                        styles.statValue,
                        { color: isDark ? "#fff" : "#1e293b" },
                      ]}
                    >
                      {user.yearOfStudy || "Not set"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Menu Items */}
            <View style={styles.menuContainer}>
              <Text
                style={[
                  styles.menuSectionTitle,
                  { color: isDark ? "rgba(255,255,255,0.5)" : "#6b7280" },
                ]}
              >
                PREFERENCES
              </Text>
              {menuItems.map(renderMenuItem)}
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              {
                paddingBottom: insets.bottom + 16,
                borderTopColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              },
            ]}
          >
            <Text
              style={[
                styles.footerText,
                { color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" },
              ]}
            >
              4 Kilo Fellowship • v1.0.0
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  backdropPressable: {
    flex: 1,
  },

  // Side Panel
  sidePanel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "80%",
    maxWidth: 340,
    overflow: "hidden",
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },

  // Header
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexGrow: 1,
    paddingBottom: 60,
  },

  // Profile Section
  profileSection: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  profileImageWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  profileImageGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImageInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  onlineBadgeInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22c55e",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  profilePhone: {
    fontSize: 15,
    marginBottom: 12,
  },
  teamBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  teamText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ff6619",
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,102,25,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },

  // Menu
  menuContainer: {
    gap: 8,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 8,
  },

  // Footer
  footer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default UserProfileMenu;
