import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/user.store";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SettingItem {
  id: string;
  icon: string;
  iconFamily: "ionicons" | "material" | "community";
  label: string;
  description?: string;
  type: "navigation" | "toggle" | "action" | "header";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

export default function Settings() {
  const { top } = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const { authState, logout } = useAuth();
  const { user } = useUserStore();
  const router = useRouter();
  const isDark = theme === "dark";

  const isAuthenticated = authState.authenticated === true;

  // Local state for toggles (these would connect to real settings in production)
  const [notifications, setNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [devotionReminders, setDevotionReminders] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [dataSync, setDataSync] = useState(true);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/sign-in");
          } catch (error) {
            console.error("Sign out error:", error);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert(
              "Coming Soon",
              "Account deletion will be available soon.",
            );
          },
        },
      ],
    );
  };

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: "Account",
      items: [
        {
          id: "profile",
          icon: "person-outline",
          iconFamily: "ionicons",
          label: "Edit Profile",
          description: "Update your name, photo, and info",
          type: "navigation",
          onPress: () =>
            Alert.alert(
              "Coming Soon",
              "Profile editing will be available soon.",
            ),
        },
        {
          id: "password",
          icon: "lock-closed-outline",
          iconFamily: "ionicons",
          label: "Change Password",
          description: "Update your password",
          type: "navigation",
          onPress: () =>
            Alert.alert(
              "Coming Soon",
              "Password change will be available soon.",
            ),
        },
        {
          id: "phone",
          icon: "call-outline",
          iconFamily: "ionicons",
          label: "Phone Number",
          description: user?.phoneNumber || "Not set",
          type: "navigation",
          onPress: () =>
            Alert.alert(
              "Coming Soon",
              "Phone number update will be available soon.",
            ),
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          id: "darkMode",
          icon: isDark ? "moon" : "sunny-outline",
          iconFamily: "ionicons",
          label: "Dark Mode",
          description: isDark ? "Currently enabled" : "Currently disabled",
          type: "toggle",
          value: isDark,
          onToggle: () => toggleTheme(),
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          id: "pushNotifications",
          icon: "notifications-outline",
          iconFamily: "ionicons",
          label: "Push Notifications",
          description: "Receive important updates",
          type: "toggle",
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: "eventReminders",
          icon: "calendar-outline",
          iconFamily: "ionicons",
          label: "Event Reminders",
          description: "Get notified before events start",
          type: "toggle",
          value: eventReminders,
          onToggle: setEventReminders,
        },
        {
          id: "devotionReminders",
          icon: "book-outline",
          iconFamily: "ionicons",
          label: "Devotion Reminders",
          description: "Daily devotion notifications",
          type: "toggle",
          value: devotionReminders,
          onToggle: setDevotionReminders,
        },
        {
          id: "sound",
          icon: "volume-high-outline",
          iconFamily: "ionicons",
          label: "Sound",
          description: "Play notification sounds",
          type: "toggle",
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
        {
          id: "vibration",
          icon: "phone-portrait-outline",
          iconFamily: "ionicons",
          label: "Vibration",
          description: "Vibrate on notifications",
          type: "toggle",
          value: vibrationEnabled,
          onToggle: setVibrationEnabled,
        },
      ],
    },
    {
      title: "Media & Data",
      items: [
        {
          id: "autoPlay",
          icon: "play-circle-outline",
          iconFamily: "ionicons",
          label: "Auto-play Videos",
          description: "Videos play automatically",
          type: "toggle",
          value: autoPlay,
          onToggle: setAutoPlay,
        },
        {
          id: "dataSync",
          icon: "sync-outline",
          iconFamily: "ionicons",
          label: "Background Sync",
          description: "Sync data in background",
          type: "toggle",
          value: dataSync,
          onToggle: setDataSync,
        },
        {
          id: "clearCache",
          icon: "trash-outline",
          iconFamily: "ionicons",
          label: "Clear Cache",
          description: "Free up storage space",
          type: "action",
          onPress: () =>
            Alert.alert(
              "Cache Cleared",
              "Your cache has been cleared successfully.",
            ),
        },
        {
          id: "downloadedContent",
          icon: "download-outline",
          iconFamily: "ionicons",
          label: "Downloaded Content",
          description: "Manage offline content",
          type: "navigation",
          onPress: () =>
            Alert.alert(
              "Coming Soon",
              "Download management will be available soon.",
            ),
        },
      ],
    },
    {
      title: "Privacy & Security",
      items: [
        {
          id: "privacy",
          icon: "shield-checkmark-outline",
          iconFamily: "ionicons",
          label: "Privacy Policy",
          type: "navigation",
          onPress: () => Linking.openURL("https://4kilofellowship.org/privacy"),
        },
        {
          id: "terms",
          icon: "document-text-outline",
          iconFamily: "ionicons",
          label: "Terms of Service",
          type: "navigation",
          onPress: () => Linking.openURL("https://4kilofellowship.org/terms"),
        },
        {
          id: "dataUsage",
          icon: "analytics-outline",
          iconFamily: "ionicons",
          label: "Data Usage",
          description: "How we use your data",
          type: "navigation",
          onPress: () =>
            Alert.alert(
              "Coming Soon",
              "Data usage info will be available soon.",
            ),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          icon: "help-circle-outline",
          iconFamily: "ionicons",
          label: "Help Center",
          description: "Get help and FAQs",
          type: "navigation",
          onPress: () =>
            Alert.alert("Coming Soon", "Help center will be available soon."),
        },
        {
          id: "contact",
          icon: "chatbubble-ellipses-outline",
          iconFamily: "ionicons",
          label: "Contact Us",
          description: "Send us a message",
          type: "navigation",
          onPress: () => Linking.openURL("mailto:support@4kilofellowship.org"),
        },
        {
          id: "feedback",
          icon: "star-outline",
          iconFamily: "ionicons",
          label: "Send Feedback",
          description: "Help us improve",
          type: "navigation",
          onPress: () =>
            Alert.alert("Coming Soon", "Feedback form will be available soon."),
        },
        {
          id: "rateApp",
          icon: "heart-outline",
          iconFamily: "ionicons",
          label: "Rate This App",
          description: "Leave a review",
          type: "navigation",
          onPress: () =>
            Alert.alert("Thank You!", "Rate us on the App Store/Play Store."),
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          id: "version",
          icon: "information-circle-outline",
          iconFamily: "ionicons",
          label: "App Version",
          description: "1.0.0 (Build 1)",
          type: "navigation",
          onPress: () => {},
        },
        {
          id: "whatsNew",
          icon: "sparkles-outline",
          iconFamily: "ionicons",
          label: "What's New",
          description: "See latest updates",
          type: "navigation",
          onPress: () =>
            Alert.alert(
              "What's New",
              "• Improved user profile menu\n• Theme toggle\n• Settings screen\n• And more!",
            ),
        },
        {
          id: "licenses",
          icon: "code-slash-outline",
          iconFamily: "ionicons",
          label: "Open Source Licenses",
          type: "navigation",
          onPress: () =>
            Alert.alert("Coming Soon", "Licenses info will be available soon."),
        },
      ],
    },
  ];

  // Add danger zone for authenticated users
  if (isAuthenticated) {
    settingsSections.push({
      title: "Danger Zone",
      items: [
        {
          id: "signOut",
          icon: "log-out-outline",
          iconFamily: "ionicons",
          label: "Sign Out",
          type: "action",
          danger: true,
          onPress: handleSignOut,
        },
        {
          id: "deleteAccount",
          icon: "trash-outline",
          iconFamily: "ionicons",
          label: "Delete Account",
          description: "Permanently remove your account",
          type: "action",
          danger: true,
          onPress: handleDeleteAccount,
        },
      ],
    });
  }

  const renderIcon = (item: SettingItem) => {
    const color = item.danger ? "#ef4444" : isDark ? "#fff" : "#374151";
    const size = 22;

    switch (item.iconFamily) {
      case "material":
        return (
          <MaterialIcons name={item.icon as any} size={size} color={color} />
        );
      case "community":
        return (
          <MaterialCommunityIcons
            name={item.icon as any}
            size={size}
            color={color}
          />
        );
      default:
        return <Ionicons name={item.icon as any} size={size} color={color} />;
    }
  };

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.settingItem,
        { backgroundColor: isDark ? "#1c1c1e" : "#ffffff" },
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
      <View style={styles.settingItemLeft}>
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
          {renderIcon(item)}
        </View>
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.settingLabel,
              { color: item.danger ? "#ef4444" : isDark ? "#fff" : "#1f2937" },
            ]}
          >
            {item.label}
          </Text>
          {item.description && (
            <Text
              style={[
                styles.settingDescription,
                { color: isDark ? "#9ca3af" : "#6b7280" },
              ]}
            >
              {item.description}
            </Text>
          )}
        </View>
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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#f9fafb" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        className={`px-5 pb-4 flex-row items-center border-b ${isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"}`}
        style={{ paddingTop: top + 10 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: isDark ? "#1C1C1E" : "#e2e8f0" }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "white" : "#0f172a"}
          />
        </TouchableOpacity>
        <Text
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Settings
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card (if authenticated) */}
        {isAuthenticated && user && (
          <TouchableOpacity
            style={[
              styles.userCard,
              { backgroundColor: isDark ? "#1c1c1e" : "#ffffff" },
            ]}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Profile editing will be available soon.",
              )
            }
          >
            <View style={styles.userImageContainer}>
              {user.profileImage || user.image ? (
                <Image
                  source={{ uri: user.profileImage || user.image || "" }}
                  style={styles.userImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.userImagePlaceholder,
                    { backgroundColor: isDark ? "#2c2c2e" : "#e5e7eb" },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={28}
                    color={isDark ? "#6b7280" : "#9ca3af"}
                  />
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text
                style={[
                  styles.userName,
                  { color: isDark ? "#fff" : "#1f2937" },
                ]}
              >
                {user.fullName || "Fellow Member"}
              </Text>
              <Text
                style={[
                  styles.userPhone,
                  { color: isDark ? "#9ca3af" : "#6b7280" },
                ]}
              >
                {user.phoneNumber}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#6b7280" : "#9ca3af"}
            />
          </TouchableOpacity>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#9ca3af" : "#6b7280" },
              ]}
            >
              {section.title}
            </Text>
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: isDark ? "#1c1c1e" : "#ffffff" },
              ]}
            >
              {section.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderSettingItem(item)}
                  {index < section.items.length - 1 && (
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: isDark ? "#2c2c2e" : "#e5e7eb" },
                      ]}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Image
            source={require("@/assets/images/logo-primary.png")}
            style={[styles.footerLogo, { transform: [{ scale: 3.8 }] }]}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.footerText,
              { color: isDark ? "#6b7280" : "#9ca3af" },
            ]}
          >
            Made with{" "}
            <Ionicons
              name="heart"
              size={15}
              color={isDark ? "#6b7280" : "#9ca3af"}
            />{" "}
            by 4 Kilo Fellowship
          </Text>
          <Text
            style={[
              styles.footerVersion,
              { color: isDark ? "#4b5563" : "#d1d5db" },
            ]}
          >
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userImageContainer: {
    marginRight: 14,
  },
  userImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#ff6619",
  },
  userImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  labelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginLeft: 68,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  footerLogo: {
    width: 120,
    height: 40,
    marginBottom: 12,
    opacity: 0.8,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
  },
});
