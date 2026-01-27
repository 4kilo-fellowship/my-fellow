import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/user.store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
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

  const [menuVisible, setMenuVisible] = useState(false);
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

  // Menu items configuration
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
            { backgroundColor: isDark ? "#2c2c2e" : "#e5e7eb" },
          ]}
        />
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.menuItem,
          { backgroundColor: isDark ? "#1c1c1e" : "#ffffff" },
        ]}
        onPress={item.type === "toggle" ? undefined : item.onPress}
        activeOpacity={item.type === "toggle" ? 1 : 0.7}
      >
        <View style={styles.menuItemLeft}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: item.danger
                  ? "rgba(239, 68, 68, 0.12)"
                  : isDark
                    ? "#2c2c2e"
                    : "#f3f4f6",
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
            color={isDark ? "#6b7280" : "#9ca3af"}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Profile Avatar Button */}
      <TouchableOpacity onPress={openMenu} activeOpacity={0.8}>
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor: isDark ? "#2c2c2e" : "#ffffff",
              borderColor: isDark ? "#3c3c3e" : "#e5e7eb",
            },
          ]}
        >
          {isAuthenticated && (user?.profileImage || user?.image) ? (
            <Image
              source={{ uri: user.profileImage || user.image || "" }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : isAuthenticated ? (
            <Ionicons
              name="person"
              size={24}
              color={isDark ? "#fff" : "#374151"}
            />
          ) : (
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.avatarImage}
              resizeMode="contain"
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
        {/* Backdrop */}
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
              backgroundColor: isDark ? "#000000" : "#f9fafb",
              paddingTop: insets.top,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: isDark ? "#1c1c1e" : "#ffffff" },
            ]}
            onPress={closeMenu}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={24}
              color={isDark ? "#fff" : "#374151"}
            />
          </TouchableOpacity>

          {/* User Profile Section */}
          <View
            style={[
              styles.profileSection,
              { backgroundColor: isDark ? "#1c1c1e" : "#ffffff" },
            ]}
          >
            <View style={styles.profileImageContainer}>
              {isAuthenticated && (user?.profileImage || user?.image) ? (
                <Image
                  source={{ uri: user.profileImage || user.image || "" }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.profileImagePlaceholder,
                    { backgroundColor: isDark ? "#2c2c2e" : "#e5e7eb" },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={40}
                    color={isDark ? "#6b7280" : "#9ca3af"}
                  />
                </View>
              )}
              {isAuthenticated && <View style={styles.onlineBadge} />}
            </View>

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
                    { color: isDark ? "#9ca3af" : "#6b7280" },
                  ]}
                >
                  {user.phoneNumber}
                </Text>
                {user.team && (
                  <View
                    style={[
                      styles.teamBadge,
                      { backgroundColor: isDark ? "#2c2c2e" : "#f3f4f6" },
                    ]}
                  >
                    <MaterialIcons name="groups" size={14} color="#ff6619" />
                    <Text
                      style={[
                        styles.teamText,
                        { color: isDark ? "#d1d5db" : "#4b5563" },
                      ]}
                    >
                      {user.team}
                    </Text>
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
                    { color: isDark ? "#9ca3af" : "#6b7280" },
                  ]}
                >
                  Sign in to access all features
                </Text>
              </View>
            )}
          </View>

          {/* Account Stats - Only for authenticated users */}
          {isAuthenticated && user && (
            <View
              style={[
                styles.statsContainer,
                { backgroundColor: isDark ? "#1c1c1e" : "#ffffff" },
              ]}
            >
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    { color: isDark ? "#fff" : "#1f2937" },
                  ]}
                >
                  {user.department || "—"}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: isDark ? "#9ca3af" : "#6b7280" },
                  ]}
                >
                  Department
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: isDark ? "#2c2c2e" : "#e5e7eb" },
                ]}
              />
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    { color: isDark ? "#fff" : "#1f2937" },
                  ]}
                >
                  {user.yearOfStudy || "—"}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: isDark ? "#9ca3af" : "#6b7280" },
                  ]}
                >
                  Year
                </Text>
              </View>
            </View>
          )}

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map(renderMenuItem)}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: isDark ? "#6b7280" : "#9ca3af" },
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
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropPressable: {
    flex: 1,
  },
  sidePanel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "85%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    marginTop: 60,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "#ff6619",
  },
  profileImagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22c55e",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    marginBottom: 12,
  },
  teamBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  teamText: {
    fontSize: 13,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: "100%",
    marginHorizontal: 12,
  },
  menuContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 4,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
  },
});

export default UserProfileMenu;
