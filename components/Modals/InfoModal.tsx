import { PRIMARY } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  isDark: boolean;
}

export const InfoModal = ({
  visible,
  onClose,
  title,
  message,
  type = "success",
  isDark,
}: InfoModalProps) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      default:
        return "information-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#10B981";
      case "error":
        return "#EF4444";
      default:
        return PRIMARY;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "#10B98115";
      case "error":
        return "#EF444415";
      default:
        return `${PRIMARY}15`;
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={20}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
          ]}
          className="shadow-2xl"
        >
          <View style={[styles.iconWrapper, { backgroundColor: getBgColor() }]}>
            <Ionicons
              name={getIcon() as any}
              size={48}
              color={getIconColor()}
            />
          </View>

          <Text
            style={[styles.title, { color: isDark ? "#FFFFFF" : "#000000" }]}
          >
            {title}
          </Text>

          <Text
            style={[styles.message, { color: isDark ? "#A1A1AA" : "#71717A" }]}
          >
            {message}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={[styles.button, { backgroundColor: PRIMARY }]}
            className="shadow-lg shadow-orange-500/30"
          >
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 36,
    padding: 32,
    alignItems: "center",
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
