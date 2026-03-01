import { ConfirmModal, ConfirmationModal, InfoModal } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { JoinRequest, joinRequestService } from "@/services/joinRequestService";
import { useUserStore } from "@/stores/user.store";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
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
  const { authState, logout, getCurrentUser } = useAuth();
  const { user } = useUserStore();
  const router = useRouter();
  const isDark = theme === "dark";

  const isAuthenticated = authState.authenticated === true;
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        getCurrentUser().catch(console.error);
        fetchUserRequests();
      }
    }, [isAuthenticated]),
  );

  const fetchUserRequests = async () => {
    try {
      const myRequests = await joinRequestService.getMyRequests();
      setRequests(myRequests);
    } catch (error) {
      console.error("Error fetching requests in Settings", error);
    }
  };

  // Local state for toggles (these would connect to real settings in production)
  const [notifications, setNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [devotionReminders, setDevotionReminders] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [dataSync, setDataSync] = useState(true);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const showInfoModal = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setInfoModal({ visible: true, title, message, type });
  };

  const handleAuthRequired = (action: () => void) => {
    if (!isAuthenticated) {
      setShowSignInPrompt(true);
    } else {
      action();
    }
  };

  const handleSignOut = () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutConfirm(false);
    try {
      await logout();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
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
          onPress: () => handleAuthRequired(() => router.push("/edit-profile")),
        },
        {
          id: "password",
          icon: "lock-closed-outline",
          iconFamily: "ionicons",
          label: "Change Password",
          description: "Update your password",
          type: "navigation",
          onPress: () =>
            handleAuthRequired(() => router.push("/change-password")),
        },
        {
          id: "phone",
          icon: "call-outline",
          iconFamily: "ionicons",
          label: "Phone Number",
          description: user?.phoneNumber || "Not set",
          type: "navigation",
          onPress: () => handleAuthRequired(() => router.push("/update-phone")),
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
          onToggle: toggleTheme,
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
            showInfoModal(
              "Cache Cleared",
              "Your cache has been cleared successfully.",
              "success",
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
            showInfoModal(
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
          onPress: () => router.push("/(auth)/legal?section=privacy"),
        },
        {
          id: "terms",
          icon: "document-text-outline",
          iconFamily: "ionicons",
          label: "Terms of Service",
          type: "navigation",
          onPress: () => router.push("/(auth)/legal?section=terms"),
        },
        {
          id: "dataUsage",
          icon: "analytics-outline",
          iconFamily: "ionicons",
          label: "Data Usage",
          description: "How we use your data",
          type: "navigation",
          onPress: () =>
            showInfoModal(
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
            showInfoModal("Coming Soon", "Help center will be available soon."),
        },
        {
          id: "contact",
          icon: "chatbubble-ellipses-outline",
          iconFamily: "ionicons",
          label: "Contact Us",
          description: "Give us a call",
          type: "navigation",
          onPress: () => Linking.openURL("tel:0994627985"),
        },
        {
          id: "feedback",
          icon: "star-outline",
          iconFamily: "ionicons",
          label: "Send Feedback",
          description: "Help us improve",
          type: "navigation",
          onPress: () =>
            showInfoModal("Coming Soon", "Feedback form will be available soon."),
        },
        {
          id: "rateApp",
          icon: "heart-outline",
          iconFamily: "ionicons",
          label: "Rate This App",
          description: "Leave a review",
          type: "navigation",
          onPress: () =>
            showInfoModal("Thank You!", "Rate us on the App Store/Play Store."),
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
          description: "1.1.0 (Build 2)",
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
            showInfoModal(
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
            showInfoModal("Coming Soon", "Licenses info will be available soon."),
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
      activeOpacity={1}
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
        <View pointerEvents="none">
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: "#d1d5db", true: "#ff6619" }}
            thumbColor="#ffffff"
            ios_backgroundColor="#d1d5db"
          />
        </View>
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
        { backgroundColor: isDark ? "#000000" : "#f8fafc" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        className={`px-5 pb-4 flex-row items-center border-b ${isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"}`}
        style={{ paddingTop: top + 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full items-center justify-center mr-4"
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            borderless: true,
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "white" : "#0f172a"}
          />
        </Pressable>
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
        {isAuthenticated && user && (
          <TouchableOpacity
            style={[
              styles.userCard,
              { backgroundColor: isDark ? "#1c1c1e" : "#ffffff" },
            ]}
            activeOpacity={1}
            onPress={() => router.push("/edit-profile")}
          >
            <View style={styles.userImageContainer}>
              {user.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
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
              {(() => {
                const approvedRequest = requests.find(
                  (r) =>
                    r.status === "approved" || (r as any).status === "accepted",
                );

                const getTeamName = () => {
                  if (!user.team) return (approvedRequest as any)?.teamName;
                  if (typeof user.team === "string") return user.team;
                  return (
                    (user.team as any).name ||
                    (user.team as any).fullName ||
                    (approvedRequest as any)?.teamName
                  );
                };

                const teamToShow = getTeamName();

                if (!teamToShow) return null;

                return (
                  <View
                    style={[
                      styles.teamBadge,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,102,25,0.15)"
                          : "rgba(255,102,25,0.1)",
                        marginTop: 4,
                      },
                    ]}
                  >
                    <MaterialIcons name="groups" size={12} color="#ff6619" />
                    <Text style={styles.teamText}>{teamToShow}</Text>
                  </View>
                );
              })()}
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
            Version v1.1.0
          </Text>
        </View>
      </ScrollView>
      <ConfirmationModal
        visible={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={confirmSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        danger
      />
      <ConfirmModal
        visible={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
        isDark={isDark}
        icon="log-in-outline"
        iconColor="#ff6619"
        title="Sign In Required"
        description="You need to sign in to access this feature. Would you like to sign in now?"
        buttons={[
          {
            label: "Sign In",
            onPress: () => router.push("/(auth)/sign-in"),
            variant: "primary",
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />

      <ConfirmModal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        isDark={isDark}
        icon="trash-outline"
        iconColor="#ef4444"
        title="Delete Account"
        description="This action cannot be undone. All your data will be permanently deleted. Are you sure?"
        buttons={[
          {
            label: "Delete",
            onPress: () => {
              setShowDeleteConfirm(false);
              // TODO: Implement account deletion
              showInfoModal(
                "Coming Soon",
                "Account deletion will be available soon.",
              );
            },
            variant: "primary",
          },
        ]}
        cancelButton={{
          label: "Cancel",
          onPress: () => setShowDeleteConfirm(false),
        }}
      />

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
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
    paddingTop: 16,
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
  teamBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  teamText: {
    color: "#ff6619",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
});
