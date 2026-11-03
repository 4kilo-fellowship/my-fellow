import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PRIMARY } from "@/constants";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface Props {
  onPress: () => void;
  accessibilityLabel?: string;
  size?: number;
}

export const AdminEditTrigger: React.FC<Props> = ({
  onPress,
  accessibilityLabel = "Edit item",
  size = 36,
}) => {
  const isAdmin = useIsAdmin();

  if (!isAdmin) return null;

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    onPress();
  };

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        android_ripple={{
          color: "rgba(255, 103, 25, 0.35)",
          borderless: false,
          foreground: true,
        }}
        style={styles.inner}
      >
        <Ionicons name="pencil" size={Math.round(size * 0.52)} color={PRIMARY} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 103, 25, 0.3)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
