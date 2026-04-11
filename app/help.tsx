import { InfoModal } from "@/components/Modals/InfoModal";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HelpScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const focusValue = useDerivedValue(() => {
    return withTiming(isFocused ? 1 : 0, { duration: 250 });
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusValue.value,
      [0, 1],
      [isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", "#ff6619"],
    );

    return {
      borderColor,
      borderWidth: 1.5,
      transform: [{ scale: withSpring(isFocused ? 1.01 : 1) }],
    };
  });

  const sendButtonStyle = useAnimatedStyle(() => {
    const hasContent = message.trim().length > 0 || selectedImage !== null;
    return {
      transform: [{ scale: withSpring(hasContent ? 1 : 0.8) }],
      opacity: withTiming(hasContent ? 1 : 0.5),
    };
  });

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
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("message", message);

      if (selectedImage) {
        const uriParts = selectedImage.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("image", {
          uri: selectedImage,
          name: `support_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      await api.post("/api/support", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setInfoModal({
        visible: true,
        title: "Success",
        message:
          "Your enquiry has been sent successfully. We will get back to you soon.",
        type: "success",
      });

      setMessage("");
      setSelectedImage(null);
    } catch (error: any) {
      setInfoModal({
        visible: true,
        title: "Error",
        message:
          error.response?.data?.message ||
          "Failed to send enquiry. Please try again.",
        type: "error",
      });
    } finally {
      setIsSending(false);
    }
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
        style={{ paddingTop: insets.top + 10, zIndex: 10 }}
      >
        <Pressable
          onPress={() => router.back()}
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
          contentContainerStyle={[styles.content, { paddingBottom: 150 }]}
          style={{ flex: 1 }}
        >
          <View style={styles.section}>
            <Animated.Text
              entering={FadeIn.delay(200)}
              style={[
                styles.sectionTitle,
                { color: isDark ? "#fff" : "#1e293b" },
              ]}
            >
              How can we help?
            </Animated.Text>
            <Animated.Text
              entering={FadeIn.delay(300)}
              style={[
                styles.paragraph,
                { color: isDark ? "#94a3b8" : "#475569" },
              ]}
            >
              {" "}
              If you are experiencing any issues with the application or have
              questions regarding our community, you're in the right place.
            </Animated.Text>
          </View>

          <View style={styles.minimalList}>
            <Pressable
              onPress={handlePhoneCall}
              style={styles.minimalItem}
              android_ripple={{ color: "rgba(0,0,0,0.05)" }}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: isDark ? "#1a1a1a" : "#f1f5f9" },
                ]}
              >
                <Ionicons name="call-outline" size={20} color="#ff6619" />
              </View>
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
                color={isDark ? "#334155" : "#cbd5e1"}
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
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: isDark ? "#1a1a1a" : "#f1f5f9" },
                ]}
              >
                <Ionicons
                  name="paper-plane-outline"
                  size={20}
                  color="#ff6619"
                />
              </View>
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
                color={isDark ? "#334155" : "#cbd5e1"}
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
          {selectedImage && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
              style={styles.previewWrapper}
            >
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imagePreview}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => setSelectedImage(null)}
                  style={styles.removeImageBtn}
                >
                  <Ionicons name="close-circle" size={22} color="#ef4444" />
                </Pressable>
              </View>
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.inputContainer,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.8)",
              },
              animatedContainerStyle,
            ]}
          >
            <Pressable
              onPress={pickImage}
              style={styles.attachBtn}
              className="active:opacity-60"
            >
              <Ionicons
                name="image-outline"
                size={22}
                color={
                  selectedImage ? "#ff6619" : isDark ? "#94a3b8" : "#64748b"
                }
              />
            </Pressable>
            <TextInput
              ref={inputRef}
              style={[styles.textInput, { color: isDark ? "#fff" : "#1e293b" }]}
              placeholder="Type your enquiry..."
              placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
              value={message}
              onChangeText={setMessage}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              multiline
            />
            <AnimatedPressable
              onPress={handleSend}
              disabled={isSending || (!message.trim() && !selectedImage)}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: "#ff6619",
                },
                sendButtonStyle,
              ]}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </AnimatedPressable>
          </Animated.View>
          <View style={styles.charCount}>
            <Text
              style={{ fontSize: 10, color: isDark ? "#475569" : "#94a3b8" }}
            >
              {message.length} characters
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
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
    marginBottom: 20,
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
    paddingVertical: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
  },
  itemLabel: {
    fontSize: 10,
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
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  previewWrapper: {
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: 110,
    height: 110,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ff6619",
  },
  removeImageBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 11,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  attachBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 150,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    lineHeight: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  charCount: {
    alignItems: "flex-end",
    paddingRight: 12,
    paddingTop: 4,
  },
});
