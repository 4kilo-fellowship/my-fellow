import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ForgotPasswordModal = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const openLink = async (url: string) => {
    if (url.startsWith("http")) {
      await WebBrowser.openBrowserAsync(url);
    } else {
      Linking.openURL(url).catch((err) =>
        console.error("An error occurred", err),
      );
    }
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        className="mt-2"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-primary font-bold text-base">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
            className="flex-1 justify-center items-center px-6"
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              className={`w-full rounded-3xl p-6 pb-10 ${
                isDark ? "bg-zinc-900 border border-zinc-700" : "bg-white"
              }`}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  Contact Developers
                </Text>

                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons
                    name="close"
                    size={22}
                    color={isDark ? "white" : "black"}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setModalVisible(false);
                  openLink("tel:+251994627985");
                }}
                className={`flex-row items-center p-4 mb-4 rounded-2xl ${
                  isDark ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <Ionicons name="call" size={24} color={PRIMARY} />
                <Text
                  className={`ml-4 text-lg flex-1 ${isDark ? "text-white" : "text-zinc-900"}`}
                >
                  0994627985
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  openLink("https://t.me/natitam1");
                  setModalVisible(false);
                }}
                className={`flex-row items-center p-4 rounded-2xl ${
                  isDark ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <Ionicons name="paper-plane" size={24} color="#ff6619" />
                <Text
                  className={`ml-4 text-lg flex-1 ${isDark ? "text-white" : "text-zinc-900"}`}
                >
                  @natitam1
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </BlurView>
      </Modal>
    </>
  );
};

export default ForgotPasswordModal;
