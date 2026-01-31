import { useTheme } from "@/context/ThemeContext";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

const ConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Sign out",
  cancelLabel = "Cancel",
  danger = true,
}: ConfirmationModalProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View
            style={[
              styles.container,
              { backgroundColor: isDark ? "#18181B" : "#FFFFFF" },
            ]}
          >
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  danger ? styles.dangerText : null,
                  { color: isDark ? "#FFFFFF" : "#111827" },
                ]}
              >
                {title}
              </Text>
              <Text
                style={[
                  styles.message,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                {message}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={[
                  styles.cancelButton,
                  { backgroundColor: isDark ? "#27272A" : "#F1F5F9" },
                ]}
              >
                <Text
                  style={[
                    styles.cancelText,
                    { color: isDark ? "#D1D5DB" : "#374151" },
                  ]}
                >
                  {cancelLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onConfirm}
                style={styles.dangerButton}
              >
                <Text style={styles.dangerButtonText}>{confirmLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },
  dangerText: {
    color: "#EF4444",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
    paddingHorizontal: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 14,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "700",
  },
  dangerButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff6619",
    shadowColor: "#ff6619",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});

export default ConfirmationModal;
