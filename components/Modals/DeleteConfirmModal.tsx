import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ACCENT = "rgb(255, 103, 25)";

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
  title = "Delete Alert",
  message = "Are you sure you want to delete this alert? This action cannot be undone.",
}: DeleteConfirmModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <BlurView
        intensity={25}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
        className="justify-center items-center"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <View
          pointerEvents="auto"
          className={`w-[85%] max-w-[340px] rounded-[28px] p-6 items-center mx-6 ${
            isDark
              ? "bg-[#1C1C1E] border border-white/5"
              : "bg-white border border-black/5"
          }`}
          style={{
            shadowColor: ACCENT,
            shadowOffset: { width: 0, height: 18 },
            shadowOpacity: 0.35,
            shadowRadius: 35,
            elevation: 28,
          }}
        >
          {/* Icon */}
          <View
            className="w-14 h-14 rounded-full items-center justify-center mb-5"
            style={{
              backgroundColor: isDark
                ? "rgba(255,103,25,0.15)"
                : "rgba(255,103,25,0.12)",
            }}
          >
            <Ionicons name="trash-outline" size={28} color={ACCENT} />
          </View>

          {/* Title */}
          <Text
            className={`text-xl font-bold mb-2 text-center ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            className={`text-center text-[15px] leading-6 mb-8 ${
              isDark ? "text-white/60" : "text-gray-500"
            }`}
          >
            {message}
          </Text>

          {/* Actions */}
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              className={`flex-1 py-4 rounded-2xl items-center justify-center ${
                isDark ? "bg-[#2C2C2E]" : "bg-gray-100"
              }`}
            >
              <Text
                className={`font-semibold text-[17px] ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-4 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: ACCENT,
                shadowColor: ACCENT,
                shadowOpacity: 0.45,
                shadowRadius: 18,
                elevation: 12,
              }}
            >
              <Text className="font-semibold text-[17px] text-white">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};
