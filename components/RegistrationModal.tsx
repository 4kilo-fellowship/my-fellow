import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  eventTitle: string;
}

const RegistrationModal = ({
  visible,
  onClose,
  onConfirm,
  loading,
  eventTitle,
}: RegistrationModalProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.container,
            { backgroundColor: isDark ? "#111827" : "white" },
          ]}
        >
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-orange-100/50 items-center justify-center mb-4">
              <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center">
                <Ionicons name="calendar-outline" size={32} color="#ff6619" />
              </View>
            </View>
            <Text
              className={`text-2xl font-bold text-center mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Event Registration
            </Text>
            <Text
              className={`text-base text-center px-4 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Do you want to register for{" "}
              <Text className="text-primary font-bold">
                &quot;{eventTitle}&quot;
              </Text>
              ?
            </Text>
          </View>

          <View className="space-y-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              disabled={loading}
              className="w-full bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold mr-2">
                    Yes, Register
                  </Text>
                  <Ionicons name="sparkles" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              disabled={loading}
              className={`w-full py-4 rounded-2xl items-center justify-center ${
                isDark ? "bg-slate-800" : "bg-slate-100"
              }`}
            >
              <Text
                className={`text-lg font-semibold ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
});

export default RegistrationModal;
