import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark: boolean;
  title?: string;
  message?: string;
}

export const DeleteConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  isDark,
  title = "Delete Reminder",
  message = "This action will permanently remove this alert from your schedule.",
}: DeleteConfirmModalProps) => {
  const bgColor = isDark ? "#121212" : "#FFFFFF";
  const textColor = isDark ? "#E4E4E7" : "#18181B";
  const subTextColor = isDark ? "#71717A" : "#71717A";

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          { backgroundColor: isDark ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.4)" },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.container, { backgroundColor: bgColor }]}>
          {/* Subtle Icon - No Background */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="trash-outline"
              size={32}
              color={isDark ? "#52525B" : "#A1A1AA"}
            />
          </View>

          <Text style={[styles.title, { color: textColor }]}>{title}</Text>

          <Text style={[styles.message, { color: subTextColor }]}>
            {message}
          </Text>

          {/* Minimalist Button Row - No Backgrounds */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={onClose}
              style={styles.button}
            >
              <Text style={[styles.buttonText, { color: subTextColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => {
                onConfirm();
                onClose();
              }}
              style={styles.button}
            >
              <Text style={[styles.buttonText, styles.deleteButtonText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
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
  },
  container: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    borderTopWidth: 0,
    paddingTop: 0,
  },
  button: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  deleteButtonText: {
    color: "#EF4444",
  },
});
