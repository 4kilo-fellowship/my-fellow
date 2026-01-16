import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

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
}) => (
  // here animation was face
  <Modal visible={visible} transparent animationType="none">
    <TouchableOpacity
      activeOpacity={1}
      onPress={onClose}
      className="flex-1 bg-black/50 justify-center items-center px-6"
    >
      <View className="bg-white w-full max-h-[70%] rounded-3xl overflow-hidden p-6 shadow-2xl">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-slate-900">{title}</Text>
          <TouchableOpacity activeOpacity={0.9} onPress={onClose}>
            <Ionicons name="close-circle" size={28} color="#94a3b8" />
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
              className="py-4 border-b border-slate-100 flex-row justify-between items-center"
            >
              <Text className="text-slate-700 text-lg font-medium">
                {option}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

export default SelectionModal;
