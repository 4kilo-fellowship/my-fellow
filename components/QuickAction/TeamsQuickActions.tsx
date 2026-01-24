import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Modal, Text, TouchableOpacity, View } from "react-native";

const QuickActions = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [modalVisible, setModalVisible] = useState(false);

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err),
    );
  };

  return (
    <>
      <View className="flex-row justify-between px-5 mb-6">
        <TouchableOpacity
          onPress={() => router.push("/leaders")}
          activeOpacity={0.9}
          className={`flex-1 mr-2 h-14 rounded-xl flex-row items-center justify-center ${
            isDark ? "bg-zinc-800" : "bg-zinc-100"
          }`}
        >
          <Ionicons
            name="people"
            size={26}
            color={isDark ? "white" : "black"}
          />
          <Text
            className={`ml-2 font-bold ${isDark ? "text-white" : "text-black"}`}
          >
            Leaders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 ml-2 h-14 rounded-xl flex-row items-center justify-center ${
            isDark ? "bg-zinc-800" : "bg-zinc-100"
          }`}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.9}
        >
          <Ionicons
            name="chatbubble"
            size={23}
            color={isDark ? "white" : "black"}
          />
          <Text
            className={`ml-2 font-bold ${isDark ? "text-white" : "text-black"}`}
          >
            Contact Us
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          className="flex-1 bg-black/60 justify-center items-center px-6"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className={`w-full rounded-3xl p-6 ${
              isDark ? "bg-zinc-900 border border-zinc-700" : "bg-white"
            } shadow-2xl`}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
              >
                Contact Us
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className={`p-2 rounded-full ${
                  isDark ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? "white" : "black"}
                />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <TouchableOpacity
                onPress={() => openLink("tel:+251911234567")}
                className={`flex-row items-center p-4 rounded-2xl ${
                  isDark ? "bg-zinc-800" : "bg-zinc-50"
                }`}
              >
                <View className="w-12 h-12 rounded-full bg-blue-500/10 items-center justify-center mr-4">
                  <Ionicons name="call" size={24} color="#3b82f6" />
                </View>
                <View>
                  <Text
                    className={`text-sm ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Phone Number
                  </Text>
                  <Text
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    +251 911 234 567
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openLink("https://t.me/myfellow_bot")}
                className={`flex-row items-center p-4 rounded-2xl ${
                  isDark ? "bg-zinc-800" : "bg-zinc-50"
                }`}
              >
                <View className="w-12 h-12 rounded-full bg-sky-500/10 items-center justify-center mr-4">
                  <Ionicons name="paper-plane" size={24} color="#0ea5e9" />
                </View>
                <View>
                  <Text
                    className={`text-sm ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Telegram
                  </Text>
                  <Text
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    @myfellow_bot
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default QuickActions;
