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

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface ButtonConfig {
  label: string;
  onPress: () => void;
  variant?: "default" | "danger" | "primary";
  testID?: string;
}

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  icon?: IoniconsName;
  iconColor?: string;
  title: string;
  description: string;
  buttons: ButtonConfig[];
  cancelButton?: {
    label: string;
    onPress?: () => void;
  };
}

export const ConfirmModal = ({
  visible,
  onClose,
  isDark,
  icon,
  iconColor,
  title,
  description,
  buttons,
  cancelButton,
}: ConfirmModalProps) => {
  const bgColor = isDark ? "#121212" : "#FFFFFF";
  const textColor = isDark ? "#E4E4E7" : "#18181B";
  const subTextColor = isDark ? "#71717A" : "#71717A";

  const getButtonTextColor = (variant?: string) => {
    switch (variant) {
      case "danger":
        return "#EF4444";
      case "primary":
        return "#f97316";
      default:
        return subTextColor;
    }
  };

  const handleCancelPress = () => {
    if (cancelButton?.onPress) {
      cancelButton.onPress();
    }
    onClose();
  };

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
          {/* Icon */}
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons
                name={icon}
                size={32}
                color={iconColor || (isDark ? "#52525B" : "#A1A1AA")}
              />
            </View>
          )}

          {/* Title */}
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>

          {/* Description */}
          <Text style={[styles.message, { color: subTextColor }]}>
            {description}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {/* Cancel Button */}
            {cancelButton && (
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleCancelPress}
                style={styles.button}
              >
                <Text style={[styles.buttonText, { color: subTextColor }]}>
                  {cancelButton.label}
                </Text>
              </TouchableOpacity>
            )}

            {/* Dynamic Buttons */}
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.6}
                onPress={() => {
                  button.onPress();
                  onClose();
                }}
                style={styles.button}
                testID={button.testID}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: getButtonTextColor(button.variant) },
                  ]}
                >
                  {button.label}
                </Text>
              </TouchableOpacity>
            ))}
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
});
