import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { TabView, TabBar, Route } from "react-native-tab-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";

import { ScreenHeader } from "@/components/ScreenHeader";
import { AppBottomSheet } from "@/components/AppBottomSheet";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { eventsService } from "@/services/eventsService";
import { useEventsStore } from "@/stores/events.store";

// Curated presets for styling and mood
const COLOR_PRESETS = [
  { name: "Fellowship Green", primary: "#55B752", secondary: "#0F172A" },
  { name: "Royal Purple", primary: "#7C3AED", secondary: "#1E1B4B" },
  { name: "Ocean Blue", primary: "#0284C7", secondary: "#082F49" },
  { name: "Sunset Orange", primary: "#F97316", secondary: "#431407" },
  { name: "Midnight Noir", primary: "#18181B", secondary: "#55B752" },
];

const STYLES = ["Minimal", "Modern", "Cinematic", "Vintage", "Bold", "Abstract"];

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

export default function AIPosterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();
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

  // Tab View state (Approach B: react-native-tab-view + native pager-view)
  const [tabIndex, setTabIndex] = useState<number>(0);
  const routes = useMemo(
    () => [
      { key: "create", title: "Create Poster" },
      { key: "history", title: `History (${aiPostersHistory?.length || 0})` },
    ],
    [aiPostersHistory?.length],
  );

  // Form states
  const [prompt, setPrompt] = useState(
    params.initialTitle
      ? `${params.initialTitle}. ${
          params.initialDescription ||
          "Joyful community, modern lighting, and an uplifting fellowship atmosphere."
        }`
      : "",
  );

  // References: up to 2 images
  const [referenceUris, setReferenceUris] = useState<string[]>([]);

  // Customization states (configured via the bottom sheet)
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState("Modern");
  const [selectedMood, setSelectedMood] = useState("Uplifting & Radiant");
  const [selectedOrganizer, setSelectedOrganizer] = useState(
    "AAU 4 Kilo Fellowship",
  );
  const [eventDateText, setEventDateText] = useState("");

  // Output states
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Color tokens
  const bgColor = isDark ? "#0A0A0A" : "#FFFFFF";
  const cardBg = isDark ? "#141416" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#0F172A";
  const subTextColor = isDark ? "#A1A1AA" : "#64748B";
  const borderColor = isDark ? "#27272A" : "#E2E8F0";
  const inputBg = isDark ? "#121214" : "#F8FAFC";
  const activeTabColor = isDark ? "#FFFFFF" : "#000000";

  const nativeRipple = {
    color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
    borderless: false,
    foreground: true,
  };

  // Image picker for reference designs (max 2)
  const handlePickReference = async () => {
    if (referenceUris.length >= 2) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const remainingSlots = 2 - referenceUris.length;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const picked = result.assets.map((a) => a.uri).slice(0, remainingSlots);
        setReferenceUris((prev) => [...prev, ...picked].slice(0, 2));
      }
    } catch (err) {
      console.warn("[ai-poster] Could not pick reference:", err);
    }
  };

  const handleRemoveReference = (indexToRemove: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setReferenceUris((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Poster Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Please enter a theme or prompt for the poster.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setLoading(true);
    setErrorMsg(null);
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      const combinedPrompt = `${prompt.trim()}. Style: ${selectedStyle}. Atmosphere: ${selectedMood}. Organized by ${selectedOrganizer}.${
        eventDateText.trim() ? ` Event Time: ${eventDateText.trim()}.` : ""
      }`;

      formData.append("prompt", combinedPrompt);
      formData.append("style", selectedStyle);

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
          title: params.initialTitle || selectedOrganizer,
          description: prompt.trim(),
          organizer: selectedOrganizer,
          dateTime: eventDateText.trim() || undefined,
        }),
      );

      // Attach reference images if present
      if (referenceUris.length > 0) {
        const first = referenceUris[0];
        const filename1 = first.split("/").pop() || "reference_1.jpg";
        const match1 = /\.(\w+)$/.exec(filename1);
        formData.append("image", {
          uri: first,
          name: filename1,
          type: match1 ? `image/${match1[1]}` : "image/jpeg",
        } as any);

        if (referenceUris.length > 1) {
          const second = referenceUris[1];
          const filename2 = second.split("/").pop() || "reference_2.jpg";
          const match2 = /\.(\w+)$/.exec(filename2);
          formData.append("reference2", {
            uri: second,
            name: filename2,
            type: match2 ? `image/${match2[1]}` : "image/jpeg",
          } as any);
        }
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
          "Could not generate poster. Please check your connection and try again.",
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

  const handleSharePoster = async (url: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(url);
      }
    } catch {}
  };

  // Render Scene: "create"
  const renderCreateScene = () => {
    const currentColor = COLOR_PRESETS[selectedColorIdx];

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 32, 56) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Reference Upload (Max 2 images) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeaderTitle, { color: textColor }]}>
              Reference Designs
            </Text>
            <Text style={[styles.sectionHeaderBadge, { color: subTextColor }]}>
              {referenceUris.length}/2 Uploaded
            </Text>
          </View>

          <View style={styles.referenceGridRow}>
            {referenceUris.map((uri, idx) => (
              <View
                key={uri + idx}
                style={[
                  styles.referenceThumbBox,
                  { borderColor: borderColor, backgroundColor: cardBg },
                ]}
              >
                <ExpoImage
                  source={{ uri }}
                  style={styles.referenceThumbImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
                <Pressable
                  onPress={() => handleRemoveReference(idx)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.removeReferenceBadge}
                  accessibilityLabel="Remove reference"
                >
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </Pressable>
                <View style={styles.refIndexPill}>
                  <Text style={styles.refIndexText}>Ref {idx + 1}</Text>
                </View>
              </View>
            ))}

            {referenceUris.length < 2 && (
              <Pressable
                onPress={handlePickReference}
                android_ripple={nativeRipple}
                style={[
                  styles.addReferenceSlot,
                  {
                    backgroundColor: inputBg,
                    borderColor: borderColor,
                    flex: referenceUris.length === 0 ? 1 : undefined,
                    width: referenceUris.length === 0 ? "100%" : 120,
                  },
                ]}
              >
                <View style={styles.addReferenceInner}>
                  <View
                    style={[
                      styles.addIconCircle,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.04)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="image-outline"
                      size={20}
                      color={textColor}
                    />
                  </View>
                  <Text style={[styles.addSlotTitle, { color: textColor }]}>
                    {referenceUris.length === 0
                      ? "Add Reference Design"
                      : "Add 2nd Reference"}
                  </Text>
                  <Text
                    style={[styles.addSlotSubtitle, { color: subTextColor }]}
                  >
                    Optional layout / palette guidance
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* 2. Prompt Box */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeaderTitle, { color: textColor }]}>
              Poster Prompt & Theme
            </Text>
            {prompt.length > 0 && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {},
                  );
                  setPrompt("");
                }}
              >
                <Text style={styles.clearTextBtn}>Clear</Text>
              </Pressable>
            )}
          </View>

          <View
            style={[
              styles.promptBoxWrapper,
              {
                backgroundColor: inputBg,
                borderColor: borderColor,
              },
            ]}
          >
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
              placeholder="Describe your poster..."
              placeholderTextColor={subTextColor}
              style={[
                styles.promptInput,
                {
                  color: textColor,
                },
              ]}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* 3. Detail Customizer Trigger Button (Opens Bottom Sheet) */}
        <View style={styles.sectionContainer}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              );
              setIsDetailsSheetOpen(true);
            }}
            android_ripple={nativeRipple}
            style={[
              styles.detailsTriggerCard,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
          >
            <View style={styles.detailsTriggerLeft}>
              <View
                style={[
                  styles.detailsIconWrap,
                  { backgroundColor: `${currentColor.primary}20` },
                ]}
              >
                <View
                  style={[
                    styles.detailsColorDot,
                    { backgroundColor: currentColor.primary },
                  ]}
                />
              </View>

              <View style={styles.detailsTextWrap}>
                <Text style={[styles.detailsTriggerTitle, { color: textColor }]}>
                  Event & Style Details
                </Text>
                <Text
                  style={[styles.detailsTriggerSummary, { color: subTextColor }]}
                  numberOfLines={1}
                >
                  {currentColor.name} · {selectedStyle} · {selectedOrganizer}
                </Text>
              </View>
            </View>

            <View style={styles.detailsTriggerRight}>
              <Text style={[styles.tuneText, { color: subTextColor }]}>Edit</Text>
              <Ionicons name="chevron-forward" size={16} color={subTextColor} />
            </View>
          </Pressable>
        </View>

        {/* Error Notification */}
        {errorMsg && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        )}

        {/* 4. Generated Poster Result */}
        {generatedImage && (
          <View
            style={[
              styles.resultCard,
              { backgroundColor: cardBg, borderColor: borderColor },
            ]}
          >
            <View style={styles.resultHeader}>
              <Text style={[styles.resultTitle, { color: textColor }]}>
                Generated Poster
              </Text>
              <Pressable
                onPress={() => handleSharePoster(generatedImage)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.shareIconBtn}
              >
                <Ionicons
                  name="share-outline"
                  size={19}
                  color={textColor}
                />
              </Pressable>
            </View>

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

            <Pressable
              onPress={() => handleApplyPoster(generatedImage)}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.25)",
                borderless: false,
                foreground: true,
              }}
              style={[styles.applyButton, { backgroundColor: PRIMARY }]}
            >
              <Ionicons name="checkmark-circle" size={19} color="#FFFFFF" />
              <Text style={styles.applyButtonText}>
                Use as Event Banner
              </Text>
            </Pressable>
          </View>
        )}

        {/* 5. Generate Poster Action Button */}
        <View style={styles.generateButtonWrap}>
          <Pressable
            onPress={handleGenerate}
            disabled={loading || !prompt.trim()}
            android_ripple={{
              color: "rgba(255, 255, 255, 0.25)",
              borderless: false,
              foreground: true,
            }}
            style={[
              styles.generateMainButton,
              { backgroundColor: PRIMARY },
              (loading || !prompt.trim()) && styles.generateDisabled,
            ]}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.generateButtonText}>
                  Designing Poster (~10s)...
                </Text>
              </View>
            ) : (
              <View style={styles.generateBtnContent}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>
                  {generatedImage ? "Generate Variation" : "Generate Poster"}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  // Render Scene: "history"
  const renderHistoryScene = () => {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: bgColor }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 32, 56) },
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

                <View style={styles.historyCardBody}>
                  <Text
                    numberOfLines={2}
                    style={[styles.historyPromptText, { color: textColor }]}
                  >
                    {item.prompt}
                  </Text>
                  <Pressable
                    onPress={() => handleApplyPoster(item.url)}
                    android_ripple={nativeRipple}
                    style={[styles.historyUseButton, { borderColor: PRIMARY }]}
                  >
                    <Text style={[styles.historyUseText, { color: PRIMARY }]}>
                      Use Poster
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconCircle,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.04)",
                },
              ]}
            >
              <Ionicons
                name="images-outline"
                size={40}
                color={subTextColor}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              No Generated Posters Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: subTextColor }]}>
              Posters you generate will automatically be saved here so you can
              re-use or apply them anytime.
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderScene = useCallback(
    ({ route }: { route: Route }) => {
      switch (route.key) {
        case "create":
          return renderCreateScene();
        case "history":
          return renderHistoryScene();
        default:
          return null;
      }
    },
    [
      bgColor,
      cardBg,
      textColor,
      subTextColor,
      borderColor,
      inputBg,
      prompt,
      referenceUris,
      selectedColorIdx,
      selectedStyle,
      selectedOrganizer,
      loading,
      generatedImage,
      errorMsg,
      aiPostersHistory,
    ],
  );

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader
        title="AI Poster Studio"
        containerStyle={{
          backgroundColor: isDark ? "#0A0A0A" : "#FFFFFF",
          borderBottomColor: borderColor,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: bgColor }}
      >
        {/* Native Finger-Tracking TabView per Expo SDK 58 Guide */}
        <TabView
          navigationState={{ index: tabIndex, routes }}
          onIndexChange={(newIndex) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {},
            );
            setTabIndex(newIndex);
          }}
          renderScene={renderScene}
          initialLayout={{ width: layout.width }}
          lazy
          lazyPreloadDistance={1}
          commonOptions={{
            labelStyle: {
              fontSize: 14,
              fontWeight: "700",
              textTransform: "none",
            },
          }}
          renderTabBar={(tabBarProps) => (
            <TabBar
              {...tabBarProps}
              indicatorStyle={{
                backgroundColor: activeTabColor,
                height: 2.5,
              }}
              style={{
                backgroundColor: isDark ? "#0A0A0A" : "#FFFFFF",
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: borderColor,
                elevation: 0,
                shadowOpacity: 0,
              }}
              activeColor={activeTabColor}
              inactiveColor={subTextColor}
              pressColor={
                isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)"
              }
            />
          )}
        />
      </KeyboardAvoidingView>

      {/* Expo UI Bottom Sheet for Event & Style Details */}
      <AppBottomSheet
        visible={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
        isDark={isDark}
        snapPoints={["half", "full"]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Header */}
          <View style={styles.sheetHeaderRow}>
            <Text style={[styles.sheetTitle, { color: textColor }]}>
              Poster Customization
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {},
                );
                setIsDetailsSheetOpen(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.sheetDoneText, { color: PRIMARY }]}>Done</Text>
            </Pressable>
          </View>

          {/* Primary Color Swatches */}
          <View style={styles.sheetSection}>
            <Text style={[styles.sheetSectionLabel, { color: subTextColor }]}>
              PRIMARY ACCENT COLOR
            </Text>
            <View style={styles.colorPaletteGrid}>
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
                    style={[
                      styles.colorCircleItem,
                      isSelected && {
                        borderColor: textColor,
                        borderWidth: 2,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.colorSwatchCircle,
                        { backgroundColor: c.primary },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.colorSwatchName,
                        {
                          color: isSelected ? textColor : subTextColor,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Style Pills */}
          <View style={styles.sheetSection}>
            <Text style={[styles.sheetSectionLabel, { color: subTextColor }]}>
              ARTISTIC STYLE
            </Text>
            <View style={styles.pillsWrapRow}>
              {STYLES.map((s) => {
                const isSelected = selectedStyle === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setSelectedStyle(s);
                    }}
                    style={[
                      styles.sheetPill,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? "#FFFFFF"
                            : "#000000"
                          : isDark
                          ? "#1E1E22"
                          : "#F1F5F9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sheetPillText,
                        {
                          color: isSelected
                            ? isDark
                              ? "#000000"
                              : "#FFFFFF"
                            : textColor,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Atmosphere & Mood */}
          <View style={styles.sheetSection}>
            <Text style={[styles.sheetSectionLabel, { color: subTextColor }]}>
              ATMOSPHERE & MOOD
            </Text>
            <View style={styles.pillsWrapRow}>
              {MOODS.map((m) => {
                const isSelected = selectedMood === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setSelectedMood(m);
                    }}
                    style={[
                      styles.sheetPill,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? "#FFFFFF"
                            : "#000000"
                          : isDark
                          ? "#1E1E22"
                          : "#F1F5F9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sheetPillText,
                        {
                          color: isSelected
                            ? isDark
                              ? "#000000"
                              : "#FFFFFF"
                            : textColor,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Ministry / Organizer */}
          <View style={styles.sheetSection}>
            <Text style={[styles.sheetSectionLabel, { color: subTextColor }]}>
              MINISTRY TEAM / ORGANIZER
            </Text>
            <View style={styles.pillsWrapRow}>
              {ORGANIZERS.map((o) => {
                const isSelected = selectedOrganizer === o;
                return (
                  <Pressable
                    key={o}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                      ).catch(() => {});
                      setSelectedOrganizer(o);
                    }}
                    style={[
                      styles.sheetPill,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? "#FFFFFF"
                            : "#000000"
                          : isDark
                          ? "#1E1E22"
                          : "#F1F5F9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sheetPillText,
                        {
                          color: isSelected
                            ? isDark
                              ? "#000000"
                              : "#FFFFFF"
                            : textColor,
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {o}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Optional Date / Time text */}
          <View style={styles.sheetSection}>
            <Text style={[styles.sheetSectionLabel, { color: subTextColor }]}>
              EVENT TIME / SCHEDULE (OPTIONAL)
            </Text>
            <View
              style={[
                styles.sheetInputWrap,
                {
                  backgroundColor: isDark ? "#141416" : "#F8FAFC",
                  borderColor: borderColor,
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={17}
                color={subTextColor}
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={eventDateText}
                onChangeText={setEventDateText}
                placeholder="e.g. Sunday · 9:00 AM"
                placeholderTextColor={subTextColor}
                style={[styles.sheetTextInput, { color: textColor }]}
              />
            </View>
          </View>

          {/* Save / Apply Button */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
                () => {},
              );
              setIsDetailsSheetOpen(false);
            }}
            android_ripple={{
              color: "rgba(255, 255, 255, 0.25)",
              borderless: false,
              foreground: true,
            }}
            style={[styles.sheetApplyBtn, { backgroundColor: PRIMARY }]}
          >
            <Text style={styles.sheetApplyBtnText}>Apply Details</Text>
          </Pressable>
        </ScrollView>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sectionHeaderBadge: {
    fontSize: 12,
    fontWeight: "500",
  },
  clearTextBtn: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  // Reference images
  referenceGridRow: {
    flexDirection: "row",
    gap: 12,
  },
  referenceThumbBox: {
    width: 110,
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  referenceThumbImage: {
    width: "100%",
    height: "100%",
  },
  removeReferenceBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  refIndexPill: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  refIndexText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addReferenceSlot: {
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  addReferenceInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  addSlotTitle: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  addSlotSubtitle: {
    fontSize: 11,
    fontWeight: "400",
    marginTop: 2,
    textAlign: "center",
  },
  // Prompt Input
  promptBoxWrapper: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  promptInput: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    minHeight: 88,
  },
  // Details trigger card
  detailsTriggerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  detailsTriggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  detailsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  detailsTextWrap: {
    flex: 1,
  },
  detailsTriggerTitle: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  detailsTriggerSummary: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 2,
  },
  detailsTriggerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tuneText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Error Banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "#EF4444",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    color: "#EF4444",
    flex: 1,
    fontWeight: "500",
  },
  // Result card
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  shareIconBtn: {
    padding: 4,
  },
  resultImageWrapper: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#18181B",
    marginBottom: 14,
  },
  resultImage: {
    width: "100%",
    height: "100%",
  },
  applyButton: {
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Generate Main Button
  generateButtonWrap: {
    marginTop: 8,
  },
  generateMainButton: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6719",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  generateDisabled: {
    opacity: 0.5,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  generateBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  // History Grid
  historyGrid: {
    gap: 16,
  },
  historyCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  historyImageWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#18181B",
  },
  historyImage: {
    width: "100%",
    height: "100%",
  },
  historyCardBody: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  historyPromptText: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    flex: 1,
  },
  historyUseButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  historyUseText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  // Sheet Styles
  sheetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  sheetDoneText: {
    fontSize: 15,
    fontWeight: "700",
  },
  sheetSection: {
    marginBottom: 20,
  },
  sheetSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  colorPaletteGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  colorCircleItem: {
    alignItems: "center",
    padding: 4,
    borderRadius: 12,
  },
  colorSwatchCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  colorSwatchName: {
    fontSize: 10,
    maxWidth: 60,
    textAlign: "center",
  },
  pillsWrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sheetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sheetPillText: {
    fontSize: 13,
  },
  sheetInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  sheetTextInput: {
    flex: 1,
    fontSize: 14,
    height: "100%",
  },
  sheetApplyBtn: {
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  sheetApplyBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
