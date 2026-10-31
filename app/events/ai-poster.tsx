import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { ScreenHeader } from "@/components/ScreenHeader";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { eventsService } from "@/services/eventsService";
import { useEventsStore } from "@/stores/events.store";

// Physics-based spring configuration per Expo / Reanimated guidelines
const TAB_SPRING_CONFIG = {
  damping: 24,
  stiffness: 260,
  mass: 0.6,
  overshootClamping: false,
};

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

const MOODS = [
  "Uplifting & Radiant",
  "Deep & Contemplative",
  "Energetic & Bold",
  "Clean & Elegant",
];

const ORGANIZERS = [
  "AAU 4 Kilo Fellowship",
  "Worship Team",
  "Prayer Ministry",
  "Freshman Ministry",
  "Bible Study Team",
];

const COLOR_PRESETS = [
  { name: "Fellowship Green", primary: "#55B752", secondary: "#0F172A" },
  { name: "Royal Purple", primary: "#7C3AED", secondary: "#1E1B4B" },
  { name: "Ocean Blue", primary: "#0284C7", secondary: "#082F49" },
  { name: "Sunset Orange", primary: "#F97316", secondary: "#431407" },
  { name: "Midnight Noir", primary: "#18181B", secondary: "#55B752" },
];

const INSPIRATION_CHIPS = [
  "🔥 Youth Revival Night",
  "⛪ Sunday Fellowship Service",
  "🙏 Campus Prayer & Fasting",
  "🌱 Freshman Welcome & Mentorship",
  "🎵 Acoustic Worship Evening",
];

export default function AIPosterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const params = useLocalSearchParams<{
    initialTitle?: string;
    initialDescription?: string;
  }>();

  const {
    aiPostersHistory,
    addAIPosterToHistory,
    setPendingGeneratedPoster,
  } = useEventsStore();

  const [activeTab, setActiveTab] = useState<"create" | "history">("create");

  // Form states
  const [prompt, setPrompt] = useState(
    params.initialTitle
      ? `A vibrant and inspiring campus fellowship event: ${params.initialTitle}. ${
          params.initialDescription ||
          "Joyful community, modern lighting, and an uplifting atmosphere."
        }`
      : "",
  );
  const [style, setStyle] = useState("Modern");
  const [mood, setMood] = useState("Uplifting & Radiant");
  const [organizer, setOrganizer] = useState("AAU 4 Kilo Fellowship");
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  // Reference image
  const [referenceUri, setReferenceUri] = useState<string | null>(null);

  // Output states
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeTabColor = isDark ? "#ffffff" : "#000000";

  const [tabBarWidth, setTabBarWidth] = useState(0);
  const tabProgress = useSharedValue(activeTab === "create" ? 0 : 1);

  useEffect(() => {
    tabProgress.value = withSpring(
      activeTab === "create" ? 0 : 1,
      TAB_SPRING_CONFIG,
    );
  }, [activeTab, tabProgress]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    const singleTabWidth = tabBarWidth > 0 ? tabBarWidth / 2 : 0;
    return {
      width: singleTabWidth,
      transform: [{ translateX: tabProgress.value * singleTabWidth }],
    };
  });

  const handleTabChange = (tab: "create" | "history") => {
    if (activeTab !== tab) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } catch {}
      setActiveTab(tab);
    }
  };

  const nativeRipple = {
    color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
    borderless: false,
    foreground: true,
  };

  const handlePickReference = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReferenceUri(result.assets[0].uri);
      }
    } catch {
      // Ignored
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Please provide a prompt or theme description.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setLoading(true);
    setErrorMsg(null);
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      formData.append(
        "prompt",
        `${prompt.trim()}. Atmosphere: ${mood}. Style: ${style}. Organized by ${organizer}.`,
      );
      formData.append("style", style);

      const color = COLOR_PRESETS[selectedColorIdx];
      formData.append(
        "colors",
        JSON.stringify({
          primary: color.primary,
          secondary: color.secondary,
        }),
      );

      formData.append(
        "eventDetails",
        JSON.stringify({
          title: params.initialTitle || organizer,
          description: prompt.trim(),
          organizer,
        }),
      );

      if (referenceUri) {
        const filename = referenceUri.split("/").pop() || "reference.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("image", {
          uri: referenceUri,
          name: filename,
          type,
        } as any);
      }

      const res = await eventsService.generatePoster(formData);

      if (res?.imageUrl) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        setGeneratedImage(res.imageUrl);
        addAIPosterToHistory({
          url: res.imageUrl,
          prompt: prompt.trim(),
        });
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
          "Could not generate poster. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPoster = (url: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    setPendingGeneratedPoster(url);
    router.back();
  };

  const bgColor = isDark ? "#0A0A0A" : "#ffffff";
  const cardBg = isDark ? "#141416" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#0f172a";
  const subTextColor = isDark ? "#a1a1aa" : "#64748b";
  const borderColor = isDark ? "#27272a" : "#e2e8f0";

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader
        title="AI Poster Studio"
        containerStyle={{
          backgroundColor: isDark ? "#0A0A0A" : "#ffffff",
          borderBottomColor: borderColor,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: bgColor }}
      >
        {/* Minimal Navigation Tabs */}
        <View
          style={[
            styles.tabBar,
            {
              backgroundColor: isDark ? "#0A0A0A" : "#ffffff",
              borderBottomColor: borderColor,
            },
          ]}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0) {
              setTabBarWidth(w);
            }
          }}
        >
          {/* Animated Smooth Sliding Bottom Indicator Line */}
          {tabBarWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.slidingIndicatorLine,
                {
                  backgroundColor: activeTabColor,
                },
                indicatorAnimatedStyle,
              ]}
            />
          )}

          <Pressable
            onPress={() => handleTabChange("create")}
            android_ripple={nativeRipple}
            style={styles.tabBtn}
          >
            {activeTab === "create" && (
              <Ionicons
                name="sparkles"
                size={16}
                color={activeTabColor}
              />
            )}
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === "create" ? activeTabColor : subTextColor },
                activeTab === "create" && styles.tabBtnActiveText,
              ]}
            >
              Create Poster
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleTabChange("history")}
            android_ripple={nativeRipple}
            style={styles.tabBtn}
          >
            {activeTab === "history" && (
              <Ionicons
                name="time"
                size={16}
                color={activeTabColor}
              />
            )}
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === "history" ? activeTabColor : subTextColor },
                activeTab === "history" && styles.tabBtnActiveText,
              ]}
            >
              History ({aiPostersHistory?.length || 0})
            </Text>
          </Pressable>
        </View>

        {activeTab === "create" ? (
          <ScrollView
            style={{ flex: 1, backgroundColor: bgColor }}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: Math.max(insets.bottom + 28, 48),
                backgroundColor: bgColor,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quick Inspiration Chips */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subTextColor }]}>
                QUICK INSPIRATION
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {INSPIRATION_CHIPS.map((chip) => (
                  <Pressable
                    key={chip}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setPrompt(
                        `${chip.replace(/^[^\w\s]+/, "").trim()} on campus with uplifting fellowship worship atmosphere.`,
                      );
                    }}
                    android_ripple={nativeRipple}
                    style={[
                      styles.inspirationChip,
                      {
                        backgroundColor: cardBg,
                        borderColor: borderColor,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.inspirationChipText, { color: textColor }]}
                    >
                      {chip}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Prompt Input */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subTextColor }]}>
                EVENT THEME & ATMOSPHERE
              </Text>
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={3}
                placeholder="e.g. A vibrant worship night with glowing green and dark stage lighting, passionate youth choir, and modern aesthetic..."
                placeholderTextColor={subTextColor}
                style={[
                  styles.textArea,
                  {
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                    color: textColor,
                  },
                ]}
              />
            </View>

            {/* In-depth Questions: Style & Mood */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subTextColor }]}>
                ARTISTIC STYLE
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
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light,
                        ).catch(() => {});
                        setStyle(s);
                      }}
                      android_ripple={nativeRipple}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? PRIMARY
                            : cardBg,
                          borderColor: isSelected ? PRIMARY : borderColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? "#ffffff" : textColor,
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

            {/* Atmosphere / Mood */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subTextColor }]}>
                ATMOSPHERE & MOOD
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {MOODS.map((m) => {
                  const isSelected = mood === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light,
                        ).catch(() => {});
                        setMood(m);
                      }}
                      android_ripple={nativeRipple}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? PRIMARY
                            : cardBg,
                          borderColor: isSelected ? PRIMARY : borderColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? "#ffffff" : textColor,
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Ministry / Organizer */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subTextColor }]}>
                MINISTRY TEAM / ORGANIZER
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {ORGANIZERS.map((o) => {
                  const isSelected = organizer === o;
                  return (
                    <Pressable
                      key={o}
                      onPress={() => {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light,
                        ).catch(() => {});
                        setOrganizer(o);
                      }}
                      android_ripple={nativeRipple}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? PRIMARY
                            : cardBg,
                          borderColor: isSelected ? PRIMARY : borderColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? "#ffffff" : textColor,
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {o}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Color Palette */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subTextColor }]}>
                COLOR PALETTE
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {COLOR_PRESETS.map((c, idx) => {
                  const isSelected = selectedColorIdx === idx;
                  return (
                    <Pressable
                      key={c.name}
                      onPress={() => {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light,
                        ).catch(() => {});
                        setSelectedColorIdx(idx);
                      }}
                      android_ripple={nativeRipple}
                      style={[
                        styles.colorChip,
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
                          styles.colorChipText,
                          {
                            color: isSelected ? PRIMARY : textColor,
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

            {/* Reference Image Option */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: subTextColor }]}>
                REFERENCE POSTER / IMAGE (OPTIONAL)
              </Text>
              {referenceUri ? (
                <View
                  style={[
                    styles.referencePreviewBox,
                    { backgroundColor: cardBg, borderColor: borderColor },
                  ]}
                >
                  <ExpoImage
                    source={{ uri: referenceUri }}
                    style={styles.referenceImage}
                    contentFit="cover"
                  />
                  <View style={styles.referenceInfo}>
                    <Text
                      style={[styles.referenceTitle, { color: textColor }]}
                    >
                      Reference attached
                    </Text>
                    <Text style={styles.referenceSubtitle}>
                      Provides layout & composition guidance for the AI.
                    </Text>
                    <Pressable
                      onPress={() => setReferenceUri(null)}
                      android_ripple={nativeRipple}
                      style={styles.removeReferenceBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#ef4444"
                      />
                      <Text style={styles.removeReferenceText}>
                        Remove Reference
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={handlePickReference}
                  android_ripple={nativeRipple}
                  style={[
                    styles.uploadReferenceBox,
                    { backgroundColor: cardBg, borderColor: borderColor },
                  ]}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={22}
                    color={PRIMARY}
                  />
                  <Text
                    style={[styles.uploadReferenceText, { color: textColor }]}
                  >
                    Select reference poster from gallery
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Error Message */}
            {errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Generated Poster Result */}
            {generatedImage && (
              <View
                style={[
                  styles.resultCard,
                  { backgroundColor: cardBg, borderColor: borderColor },
                ]}
              >
                <Text style={[styles.resultTitle, { color: textColor }]}>
                  Generated Poster Preview
                </Text>
                <View style={styles.resultImageWrapper}>
                  <ExpoImage
                    source={{ uri: generatedImage }}
                    style={styles.resultImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    priority="high"
                    transition={200}
                  />
                </View>

                <View style={styles.usePosterBtnWrap}>
                  <Pressable
                    onPress={() => handleApplyPoster(generatedImage)}
                    android_ripple={{
                      color: "rgba(255, 255, 255, 0.25)",
                      borderless: false,
                      foreground: true,
                    }}
                    style={styles.usePosterBtnInner}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#ffffff"
                    />
                    <Text style={styles.usePosterBtnText}>
                      Apply to Event Banner
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Generate Action Button */}
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
                      Generating with AI... (~10s)
                    </Text>
                  </>
                ) : (
                  <Text style={styles.generateBtnText}>
                    {generatedImage
                      ? "Generate Another Variation"
                      : "Generate Poster"}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          /* History Tab */
          <ScrollView
            style={{ flex: 1, backgroundColor: bgColor }}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: Math.max(insets.bottom + 28, 48),
                backgroundColor: bgColor,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {aiPostersHistory && aiPostersHistory.length > 0 ? (
              <View style={styles.historyGrid}>
                {aiPostersHistory.map((item, idx) => (
                  <View
                    key={item.url + idx}
                    style={[
                      styles.historyCard,
                      { backgroundColor: cardBg, borderColor: borderColor },
                    ]}
                  >
                    <Pressable
                      onPress={() => handleApplyPoster(item.url)}
                      android_ripple={nativeRipple}
                      style={styles.historyImageWrap}
                    >
                      <ExpoImage
                        source={{ uri: item.url }}
                        style={styles.historyImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    </Pressable>
                    <View style={styles.historyCardBottom}>
                      <Text
                        numberOfLines={2}
                        style={[styles.historyPromptText, { color: textColor }]}
                      >
                        {item.prompt}
                      </Text>
                      <Pressable
                        onPress={() => handleApplyPoster(item.url)}
                        android_ripple={nativeRipple}
                        style={[
                          styles.applyHistoryBtn,
                          { borderColor: PRIMARY },
                        ]}
                      >
                        <Text style={styles.applyHistoryBtnText}>
                          Use Poster
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyHistoryBox}>
                <Ionicons
                  name="images-outline"
                  size={52}
                  color={subTextColor}
                />
                <Text style={[styles.emptyHistoryTitle, { color: textColor }]}>
                  No posters generated yet
                </Text>
                <Text style={styles.emptyHistorySubtitle}>
                  Posters generated with AI will be saved here automatically so
                  you can re-use them anytime.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: "relative",
  },
  slidingIndicatorLine: {
    position: "absolute",
    bottom: -StyleSheet.hairlineWidth,
    left: 0,
    height: 2.5,
    zIndex: 2,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabBtnActiveText: {
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  inspirationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  inspirationChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  textArea: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    minHeight: 88,
    textAlignVertical: "top",
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
  colorChip: {
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
  colorChipText: {
    fontSize: 13,
  },
  uploadReferenceBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  uploadReferenceText: {
    fontSize: 13,
    fontWeight: "500",
  },
  referencePreviewBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  referenceImage: {
    width: 64,
    height: 80,
    borderRadius: 8,
  },
  referenceInfo: {
    flex: 1,
    justifyContent: "center",
  },
  referenceTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  referenceSubtitle: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    marginBottom: 6,
  },
  removeReferenceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  removeReferenceText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
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
  resultCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  resultImageWrapper: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
  },
  resultImage: {
    width: "100%",
    height: "100%",
  },
  usePosterBtnWrap: {
    borderRadius: 9999,
    overflow: "hidden",
    backgroundColor: PRIMARY,
    elevation: 3,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  usePosterBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  usePosterBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  generateBtnWrap: {
    borderRadius: 9999,
    overflow: "hidden",
    backgroundColor: PRIMARY,
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
    paddingVertical: 16,
  },
  generateBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  historyGrid: {
    gap: 16,
  },
  historyCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  historyImageWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  historyImage: {
    width: "100%",
    height: "100%",
  },
  historyCardBottom: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  historyPromptText: {
    fontSize: 13,
    flex: 1,
  },
  applyHistoryBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  applyHistoryBtnText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyHistoryBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyHistoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyHistorySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
