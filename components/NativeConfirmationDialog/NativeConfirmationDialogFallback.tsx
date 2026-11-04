import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeConfirmationDialogProps } from "./types";

export function NativeConfirmationDialogFallback({
  visible,
  onClose,
  title,
  message,
  actions,
  isDark = false,
}: NativeConfirmationDialogProps) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.dialog,
            { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {title ? (
            <Text
              style={[
                styles.title,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              {title}
            </Text>
          ) : null}
          {message ? (
            <Text
              style={[
                styles.message,
                { color: isDark ? "#94A3B8" : "#475569" },
              ]}
            >
              {message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            {actions.map((action, idx) => {
              const isCancel = action.role === "cancel";
              const isDestructive = action.role === "destructive";

              return (
                <TouchableOpacity
                  key={`${action.label}-${idx}`}
                  style={styles.button}
                  onPress={() => {
                    onClose();
                    action.onPress();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isCancel && { color: isDark ? "#94A3B8" : "#64748B" },
                      !isCancel && !isDestructive && styles.primaryButtonText,
                      isDestructive && { color: "#EF4444", fontWeight: "700" },
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  dialog: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: Platform.OS === "ios" ? "center" : "left",
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 20,
    textAlign: Platform.OS === "ios" ? "center" : "left",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "#ff6719",
  },
});
