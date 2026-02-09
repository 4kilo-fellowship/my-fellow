import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: readonly string[];
  selectedValue: string;
  title: string;
}

const SelectionModal = ({
  visible,
  onClose,
  onSelect,
  options,
  selectedValue,
  title,
}: SelectionModalProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.container,
                { backgroundColor: isDark ? "#111827" : "white" },
              ]}
            >
              <View style={styles.header}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: isDark ? "#374151" : "#E5E7EB" },
                  ]}
                />
                <View className="flex-row justify-between items-center px-6 py-4">
                  <Text
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {title}
                  </Text>
                  <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                    <Ionicons
                      name="close-circle"
                      size={28}
                      color={isDark ? "#4b5563" : "#cbd5e1"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                className="px-4 pb-8"
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}
              >
                {options &&
                  options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelect(option);
                        onClose();
                      }}
                      className={`p-4 rounded-xl flex-row justify-between items-center mb-2 ${
                        selectedValue === option
                          ? isDark
                            ? "bg-primary/20"
                            : "bg-primary/10"
                          : "transparent"
                      }`}
                    >
                      <Text
                        className={`text-lg ${
                          selectedValue === option
                            ? "text-primary font-bold"
                            : isDark
                              ? "text-slate-200"
                              : "text-slate-800"
                        }`}
                      >
                        {option}
                      </Text>
                      {selectedValue === option && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#ff6719"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 8,
  },
});

export default SelectionModal;
