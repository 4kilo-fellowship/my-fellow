import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

const SelectionModal = ({
  visible,
  onClose,
  title,
  options,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  onSelect: (val: string) => void;
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    // here animation was face
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-center items-center px-6"
      >
        <View
          className={`${isDark ? "bg-slate-900" : "bg-white"} w-full max-h-[70%] rounded-3xl overflow-hidden p-6 shadow-2xl`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {title}
            </Text>
            <TouchableOpacity activeOpacity={0.9} onPress={onClose}>
              <Ionicons
                name="close-circle"
                size={28}
                color={isDark ? "#4b5563" : "#94a3b8"}
              />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
                className={`py-4 border-b ${isDark ? "border-slate-800" : "border-slate-100"} flex-row justify-between items-center`}
              >
                <Text
                  className={`${isDark ? "text-slate-200" : "text-slate-700"} text-lg font-medium`}
                >
                  {option}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isDark ? "#334155" : "#cbd5e1"}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default SelectionModal;
