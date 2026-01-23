import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    Modal,
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
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? "#1A1A1B" : "white" },
          ]}
        >
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mb-4">
              <Ionicons name="calendar" size={32} color="#ff6619" />
            </View>
            <Text
              className={`text-xl font-bold text-center mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Event Registration
            </Text>
            <Text
              className={`text-base text-center ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Do you want to register for "
              <Text className="font-bold">{eventTitle}</Text>"?
            </Text>
          </View>

          <View className="space-y-3">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onConfirm}
              disabled={loading}
              className="w-full bg-[#ff6619] py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-500/30"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white text-lg font-bold mr-2">
                    Yes, Register
                  </Text>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              disabled={loading}
              className={`w-full py-4 rounded-2xl items-center justify-center ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-lg font-semibold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Cancel
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
