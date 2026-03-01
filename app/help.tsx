import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HelpScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handlePhoneCall = () => {
    Linking.openURL("tel:0994627985");
  };

  const handleTelegram = async () => {
    await WebBrowser.openBrowserAsync("https://t.me/natitam1");
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSend = () => {
    if (!message.trim() && !selectedImage) return;

    if (Platform.OS === "android") {
      ToastAndroid.show("Coming Soon...", ToastAndroid.SHORT);
    } else {
      // For iOS/Web, we can just use a simple alert or ignore if only toast is requested
      // but usually users want some feedback.
      alert("Coming Soon...");
    }

    setMessage("");
    setSelectedImage(null);
  };
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#f8fafc" },
      ]}
    >
      <LinearGradient
        colors={isDark ? ["#0a0a0a", "#000000"] : ["#ffffff", "#f1f5f9"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        className={`px-5 pb-4 flex-row items-center border-b ${isDark ? "bg-[#0A0A0A] border-gray-800" : "bg-[#f8fafc] border-gray-200"}`}
        style={{ paddingTop: insets.top + 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            borderless: true,
          }}
          className="w-11 h-11 rounded-full items-center justify-center mr-4"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "white" : "#0f172a"}
          />
        </Pressable>
        <Text
          className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Support
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 60 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: 32 }]}
          style={{ flex: 1 }}
        >
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#fff" : "#1e293b" },
              ]}
            >
              How can we help?
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#94a3b8" : "#475569" },
              ]}
            >
              If you are experiencing any issues with the application or have
              questions regarding our community, you're in the right place.
            </Text>
            <Text
              style={[
                styles.paragraph,
                { color: isDark ? "#94a3b8" : "#475569" },
              ]}
            >
              For technical support, feature requests, or reporting bugs, please
              reach out to our administration team.
            </Text>
          </View>

          <View style={styles.minimalList}>
            <Pressable
              onPress={handlePhoneCall}
              style={styles.minimalItem}
              android_ripple={{ color: "rgba(0,0,0,0.05)" }}
            >
              <Ionicons
                name="call-outline"
                size={22}
                color={isDark ? "#fff" : "#1e293b"}
              />
              <View style={styles.itemContent}>
                <Text
                  style={[
                    styles.itemLabel,
                    { color: isDark ? "#475569" : "#94a3b8" },
                  ]}
                >
                  Phone Number
                </Text>
                <Text
                  style={[
                    styles.itemValue,
                    { color: isDark ? "#f8fafc" : "#1e293b" },
                  ]}
                >
                  0994627985
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#fff" : "#000"}
              />
            </Pressable>

            <View
              style={[
                styles.divider,
                { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" },
              ]}
            />

            <Pressable
              onPress={handleTelegram}
              style={styles.minimalItem}
              android_ripple={{ color: "rgba(0,0,0,0.05)" }}
            >
              <Ionicons
                name="paper-plane-outline"
                size={22}
                color={isDark ? "#fff" : "#1e293b"}
              />
              <View style={styles.itemContent}>
                <Text
                  style={[
                    styles.itemLabel,
                    { color: isDark ? "#475569" : "#94a3b8" },
                  ]}
                >
                  Telegram
                </Text>
                <Text
                  style={[
                    styles.itemValue,
                    { color: isDark ? "#f8fafc" : "#1e293b" },
                  ]}
                >
                  @natitam1
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#fff" : "#000"}
              />
            </Pressable>
          </View>
        </ScrollView>

        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: isDark ? "#0A0A0A" : "#fff",
              paddingBottom:
                Platform.OS === "ios" ? Math.max(insets.bottom, 12) : 12,
              borderTopColor: isDark ? "#1e293b" : "#e2e8f0",
            },
          ]}
        >
          <View
            style={{
              position: "absolute",
              bottom: -200,
              left: 0,
              right: 0,
              height: 200,
              backgroundColor: isDark ? "#0A0A0A" : "#fff",
            }}
          />
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
          >
            <Pressable onPress={pickImage} style={styles.attachBtn}>
              <Ionicons
                name="image-outline"
                size={22}
                color={
                  selectedImage ? "#ff6619" : isDark ? "#94a3b8" : "#64748b"
                }
              />
            </Pressable>
            <TextInput
              style={[styles.textInput, { color: isDark ? "#fff" : "#1e293b" }]}
              placeholder="Type your enquire..."
              placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <Pressable
              onPress={handleSend}
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    message.trim() || selectedImage ? "#ff6619" : "transparent",
                },
              ]}
            >
              <Ionicons
                name="send"
                size={18}
                color={
                  message.trim() || selectedImage
                    ? "#fff"
                    : isDark
                      ? "#94a3b8"
                      : "#64748b"
                }
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: "400",
  },
  minimalList: {
    marginTop: 8,
  },
  minimalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 4,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    borderRadius: 28,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  attachBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
