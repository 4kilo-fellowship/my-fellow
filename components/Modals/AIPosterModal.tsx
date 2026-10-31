import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { eventsService } from "@/services/eventsService";

const STYLES = [
  "Modern",
  "Minimal",
  "Cinematic",
  "Corporate",
  "Social Media Poster",
  "Vintage",
  "Abstract",
  "Neon/Cyberpunk",
];

const COLOR_PRESETS = [
  { name: "Fellowship Green", primary: "#55B752", secondary: "#0F172A" },
  { name: "Royal Purple", primary: "#7C3AED", secondary: "#1E1B4B" },
  { name: "Ocean Blue", primary: "#0284C7", secondary: "#082F49" },
  { name: "Sunset Orange", primary: "#F97316", secondary: "#431407" },
  { name: "Golden Glow", primary: "#EAB308", secondary: "#18181B" },
];

interface AIPosterModalProps {
  visible: boolean;
  onClose: () => void;
  onPosterGenerated: (imageUrl: string) => void;
  defaultEventDetails?: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function AIPosterModal({
  visible,
  onClose,
  onPosterGenerated,
  defaultEventDetails,
}: AIPosterModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Modern");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or prefill prompt when opened
  useEffect(() => {
    if (visible && !prompt) {
      if (defaultEventDetails?.title) {
        setPrompt(
          `Vibrant and inspiring campus fellowship event: ${defaultEventDetails.title}. ${
            defaultEventDetails.description || "Joyful community, modern stage lights, uplifting worship atmosphere."
          }`,
        );
      }
    }
  }, [visible, defaultEventDetails, prompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Please enter a prompt describing the poster.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLoading(true);
    setErrorMsg(null);
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt.trim());
      formData.append("style", style);

      const chosenColor = COLOR_PRESETS[selectedColorIndex];
      formData.append(
        "colors",
        JSON.stringify({
          primary: chosenColor.primary,
          secondary: chosenColor.secondary,
        }),
      );

      if (defaultEventDetails) {
        formData.append("eventDetails", JSON.stringify(defaultEventDetails));
      }

      const res = await eventsService.generatePoster(formData);

      if (res?.imageUrl) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {},
        );
        setGeneratedImage(res.imageUrl);
      } else {
        throw new Error(res?.message || "Failed to generate poster.");
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Could not generate poster. Please check your internet connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUsePoster = () => {
    if (!generatedImage) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    onPosterGenerated(generatedImage);
    onClose();
  };

  const bgColor = isDark ? "#121214" : "#ffffff";
  const cardBg = isDark ? "#1c1c1f" : "#f8fafc";
  const textColor = isDark ? "#ffffff" : "#0f172a";
  const subTextColor = isDark ? "#a1a1aa" : "#64748b";
  const borderColor = isDark ? "#27272a" : "#e2e8f0";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.container, { backgroundColor: bgColor }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            AI Poster Generator
          </Text>
          <Pressable
            onPress={onClose}
            disabled={loading}
            hitSlop={12}
            style={({ pressed }) => [
              styles.closeBtn,
              { backgroundColor: isDark ? "#27272a" : "#f1f5f9" },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="close" size={20} color={subTextColor} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollInner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Prompt Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: textColor }]}>
              Image Description / Prompt
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                  color: textColor,
                },
              ]}
              placeholder="e.g. A vibrant youth worship night with energetic stage lights and modern aesthetics..."
              placeholderTextColor={subTextColor}
              multiline
              numberOfLines={4}
              value={prompt}
              onChangeText={setPrompt}
            />
          </View>

          {/* Style Chips */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: textColor }]}>
              Artistic Style
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {STYLES.map((s) => {
                const isSelected = style === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                        () => {},
                      );
                      setStyle(s);
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? PRIMARY
                          : isDark
                          ? "#27272a"
                          : "#f1f5f9",
                        borderColor: isSelected ? PRIMARY : borderColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected
                            ? "#ffffff"
                            : isDark
                            ? "#e4e4e7"
                            : "#334155",
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Color Presets */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: textColor }]}>
              Color Theme
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {COLOR_PRESETS.map((c, idx) => {
                const isSelected = selectedColorIndex === idx;
                return (
                  <Pressable
                    key={c.name}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                        () => {},
                      );
                      setSelectedColorIndex(idx);
                    }}
                    style={[
                      styles.colorCard,
                      {
                        backgroundColor: cardBg,
                        borderColor: isSelected ? PRIMARY : borderColor,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: c.primary },
                      ]}
                    />
                    <Text
                      style={[
                        styles.colorName,
                        {
                          color: isSelected
                            ? PRIMARY
                            : isDark
                            ? "#e4e4e7"
                            : "#334155",
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Error Message */}
          {errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Generated Result Preview */}
          {generatedImage && (
            <View style={styles.previewSection}>
              <Text style={[styles.sectionLabel, { color: textColor }]}>
                Generated Poster
              </Text>
              <View
                style={[
                  styles.previewCard,
                  { borderColor: borderColor, backgroundColor: cardBg },
                ]}
              >
                <ExpoImage
                  source={{ uri: generatedImage }}
                  style={styles.previewImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={250}
                />
              </View>

              <View style={styles.useBtnWrap}>
                <Pressable
                  onPress={handleUsePoster}
                  android_ripple={{
                    color: "rgba(255, 255, 255, 0.25)",
                    borderless: false,
                    foreground: true,
                  }}
                  style={styles.useBtnInner}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={styles.useBtnText}>Use this Poster</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Generate Button */}
          <View style={styles.generateBtnWrap}>
            <Pressable
              onPress={handleGenerate}
              disabled={loading || !prompt.trim()}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.25)",
                borderless: false,
                foreground: true,
              }}
              style={[
                styles.generateBtnInner,
                (loading || !prompt.trim()) && styles.btnDisabled,
              ]}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.generateBtnText}>
                    Crafting AI Poster... (takes ~10s)
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#ffffff" />
                  <Text style={styles.generateBtnText}>
                    {generatedImage ? "Generate Another Variation" : "Generate Poster with AI"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sparkleBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  scrollInner: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: "top",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  colorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  colorName: {
    fontSize: 13,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 13,
    flex: 1,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    height: 340,
    marginBottom: 12,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  useBtnWrap: {
    borderRadius: 9999,
    overflow: "hidden",
    backgroundColor: PRIMARY,
    elevation: 3,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  useBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  useBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  generateBtnWrap: {
    borderRadius: 9999,
    overflow: "hidden",
    backgroundColor: PRIMARY,
    marginTop: 8,
    elevation: 2,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  generateBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  generateBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
