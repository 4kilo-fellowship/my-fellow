import { PRIMARY } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface ReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isDark: boolean;
}

export const ReasonModal = ({
  visible,
  onClose,
  onSubmit,
  isDark,
}: ReasonModalProps) => {
  const [reason, setReason] = useState<string>("Gift");

  const handleSubmit = () => {
    onSubmit(reason.trim() || "Gift");
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView
            intensity={20}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%", alignItems: "center" }}
            pointerEvents="box-none"
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={[
                  styles.container,
                  { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
                ]}
              >
                <View style={styles.header}>
                  <Text
                    style={[
                      styles.title,
                      { color: isDark ? "#FFFFFF" : "#000000" },
                    ]}
                  >
                    Provide a Reason
                  </Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDark ? "#A1A1AA" : "#71717A"}
                    />
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    styles.subtitle,
                    { color: isDark ? "#A1A1AA" : "#71717A" },
                  ]}
                >
                  What is this payment for?
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#2C2C2E" : "#F4F4F5",
                        color: isDark ? "#FFFFFF" : "#000000",
                        borderColor: PRIMARY,
                        borderWidth: 1.5,
                      },
                    ]}
                    placeholder="Enter reason"
                    placeholderTextColor={isDark ? "#52525B" : "#A1A1AA"}
                    value={reason}
                    onChangeText={setReason}
                  />
                </View>

                <View style={styles.buttonOuter}>
                  <Pressable
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light,
                        ).catch(() => {});
                      }
                      handleSubmit();
                    }}
                    unstable_pressDelay={0}
                    accessibilityRole="button"
                    accessibilityLabel="Continue to payment"
                    android_ripple={{
                      color: "rgba(255, 255, 255, 0.28)",
                      borderless: false,
                      foreground: true,
                    }}
                    style={({ pressed }) => [
                      styles.button,
                      { backgroundColor: PRIMARY },
                      Platform.OS === "ios" &&
                        pressed && {
                          opacity: 0.88,
                          transform: [{ scale: 0.99 }],
                        },
                    ]}
                  >
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={styles.buttonText}>Continue</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
    width: "100%",
  },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  buttonOuter: {
    width: "100%",
    borderRadius: 9999,
    overflow: "hidden",
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
