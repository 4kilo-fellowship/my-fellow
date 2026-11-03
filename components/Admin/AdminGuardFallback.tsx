import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  title?: string;
}

export const AdminGuardFallback: React.FC<Props> = ({ title = "Admin Access" }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={[styles.screen, isDark ? styles.screenDark : styles.screenLight]}>
      <ScreenHeader title={title} />
      <View style={styles.centerBox}>
        <View style={[styles.iconWrap, isDark ? styles.iconWrapDark : styles.iconWrapLight]}>
          <Ionicons name="shield-outline" size={54} color="#ff6719" />
        </View>
        <Text style={[styles.title, isDark ? styles.textLight : styles.textDark]}>
          Admin Access Required
        </Text>
        <Text style={[styles.desc, isDark ? styles.descDark : styles.descLight]}>
          You must be signed in with an authorized fellowship administrator account to access this management console.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenDark: {
    backgroundColor: "#000000",
  },
  screenLight: {
    backgroundColor: "#ffffff",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    marginTop: -40,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconWrapDark: {
    backgroundColor: "rgba(255, 103, 25, 0.12)",
  },
  iconWrapLight: {
    backgroundColor: "rgba(255, 103, 25, 0.08)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  desc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  textLight: {
    color: "#f8fafc",
  },
  textDark: {
    color: "#0f172a",
  },
  descDark: {
    color: "#94a3b8",
  },
  descLight: {
    color: "#64748b",
  },
});
