import AuthIcon from "@/components/AuthIcon";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { BlurView } from "expo-blur";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
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
      <Pressable
        onPress={() => setModalVisible(true)}
        android_ripple={{
          color: "rgba(255, 103, 25, 0.2)",
          borderless: true,
          radius: 60,
        }}
        style={({ pressed }) => [
          Platform.OS === "ios" && pressed ? { opacity: 0.7 } : undefined,
        ]}
        className="mt-2"
      >
        <Text className="text-primary font-bold text-base">
          Forgot Password?
        </Text>
      </Pressable>

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

                <Pressable
                  onPress={() => setModalVisible(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  android_ripple={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.15)",
                    borderless: true,
                    radius: 18,
                  }}
                  style={({ pressed }) => [
                    {
                      width: 36,
                      height: 36,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 18,
                    },
                    Platform.OS === "ios" && pressed
                      ? { opacity: 0.6 }
                      : undefined,
                  ]}
                >
                  <AuthIcon
                    name="close"
                    size={22}
                    color={isDark ? "white" : "black"}
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  openLink("tel:+251994627985");
                }}
                android_ripple={{
                  color: isDark
                    ? "rgba(255, 255, 255, 0.16)"
                    : "rgba(0, 0, 0, 0.1)",
                  borderless: false,
                  foreground: true,
                }}
                style={({ pressed }) => [
                  { borderRadius: 16, overflow: "hidden" },
                  Platform.OS === "ios" && pressed
                    ? { opacity: 0.7 }
                    : undefined,
                ]}
                className={`flex-row items-center p-4 mb-4 rounded-2xl ${
                  isDark ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <AuthIcon name="phone" size={24} color={PRIMARY} />
                <Text
                  className={`ml-4 text-lg flex-1 ${isDark ? "text-white" : "text-zinc-900"}`}
                >
                  0994627985
                </Text>
                <AuthIcon
                  name="chevron-right"
                  size={20}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
              </Pressable>

              <Pressable
                onPress={() => {
                  openLink("https://t.me/natitam1");
                  setModalVisible(false);
                }}
                android_ripple={{
                  color: isDark
                    ? "rgba(255, 255, 255, 0.16)"
                    : "rgba(0, 0, 0, 0.1)",
                  borderless: false,
                  foreground: true,
                }}
                style={({ pressed }) => [
                  { borderRadius: 16, overflow: "hidden" },
                  Platform.OS === "ios" && pressed
                    ? { opacity: 0.7 }
                    : undefined,
                ]}
                className={`flex-row items-center p-4 rounded-2xl ${
                  isDark ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <AuthIcon name="telegram" size={24} color="#ff6619" />
                <Text
                  className={`ml-4 text-lg flex-1 ${isDark ? "text-white" : "text-zinc-900"}`}
                >
                  @natitam1
                </Text>
                <AuthIcon
                  name="chevron-right"
                  size={20}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
              </Pressable>
            </TouchableOpacity>
          </TouchableOpacity>
        </BlurView>
      </Modal>
    </>
  );
};

export default ForgotPasswordModal;
