import { Video } from "@/constants/videos";
import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface VideoPlayerModalProps {
  visible: boolean;
  video: Video | null;
  videos: Video[];
  onClose: () => void;
  onSelectVideo: (video: Video) => void;
  isDark?: boolean;
}

const { width } = Dimensions.get("window");
const VIDEO_HEIGHT = Math.round((width * 9) / 16);

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  video,
  videos,
  onClose,
  onSelectVideo,
  isDark = false,
}) => {
  const insets = useSafeAreaInsets();
  const videoViewRef = useRef<VideoView>(null);

  // Initialize expo-video player with official SDK 58 pattern
  const player = useVideoPlayer(video?.videoUrl ?? "", (p) => {
    p.loop = false;
    if (visible && video?.videoUrl) {
      p.play();
    }
  });

  // Track player events reactively
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player?.playing ?? false,
  });

  const { status } = useEvent(player, "statusChange", {
    status: player?.status ?? "idle",
  });

  // Keep screen awake during playback
  useEffect(() => {
    if (visible && isPlaying) {
      activateKeepAwakeAsync("video_player").catch(() => {});
    } else {
      deactivateKeepAwake("video_player").catch(() => {});
    }
    return () => {
      deactivateKeepAwake("video_player").catch(() => {});
    };
  }, [visible, isPlaying]);

  // Update source and play when active video changes
  useEffect(() => {
    if (visible && video?.videoUrl && player) {
      try {
        player.replace(video.videoUrl);
        player.play();
      } catch (err) {
        console.warn("Error replacing video source:", err);
      }
    }
  }, [video?.videoUrl, visible]);

  const handleClose = () => {
    if (player) {
      player.pause();
    }
    deactivateKeepAwake("video_player").catch(() => {});
    onClose();
  };

  if (!video) return null;

  // Clean title & description to ensure no "!!" or "‼️" appears
  const cleanTitle = (video.title || "")
    .replace(/‼️/g, "")
    .replace(/!!/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const cleanDesc = (video.desc || "")
    .replace(/‼️/g, "")
    .replace(/!!/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={[styles.root, { backgroundColor: isDark ? "#09090b" : "#000000" }]}>
        <StatusBar style="light" />

        {/* Modal Top Header Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            hitSlop={12}
            onPress={handleClose}
            android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true, radius: 20 }}
            style={styles.iconBtn}
            accessibilityLabel="Close video player"
          >
            <Ionicons name="chevron-down" size={26} color="#FFFFFF" />
          </Pressable>

          <Text numberOfLines={1} style={styles.topBarTitle}>
            {cleanTitle}
          </Text>

          <Pressable
            hitSlop={12}
            onPress={handleClose}
            android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true, radius: 20 }}
            style={styles.iconBtn}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Video Player Container using recommended expo-video native player */}
        <View style={styles.videoContainer}>
          <VideoView
            ref={videoViewRef}
            player={player}
            style={styles.videoView}
            nativeControls
            contentFit="contain"
            allowsPictureInPicture
            fullscreenOptions={{
              enable: true,
            }}
          />

          {/* Buffering Indicator */}
          {status === "loading" && (
            <View style={styles.centerOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color="#ff6719" />
              <Text style={styles.loadingText}>Buffering lesson...</Text>
            </View>
          )}

          {/* Error Overlay with Retry */}
          {status === "error" && (
            <View style={styles.centerOverlay}>
              <Ionicons name="alert-circle" size={42} color="#ef4444" />
              <Text style={styles.errorText}>Unable to load video stream</Text>
              <Pressable
                onPress={() => {
                  if (video?.videoUrl && player) {
                    player.replace(video.videoUrl);
                    player.play();
                  }
                }}
                style={styles.retryBtn}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Video Information & Next Lessons / Playlist Section */}
        <ScrollView
          style={[styles.scrollBody, { backgroundColor: isDark ? "#121214" : "#f8fafc" }]}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Lesson Header Info */}
          <Text
            style={[
              styles.infoTitle,
              { color: isDark ? "#ffffff" : "#0f172a" },
            ]}
          >
            {cleanTitle}
          </Text>

          <View style={styles.metaRow}>
            {video.speaker && (
              <View style={styles.speakerPill}>
                <Ionicons name="person-outline" size={13} color="#ff6719" />
                <Text style={styles.speakerText}>{video.speaker}</Text>
              </View>
            )}
            {video.views && (
              <Text style={[styles.metaText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                {video.views}
              </Text>
            )}
            {video.publishedAt && (
              <Text style={[styles.metaText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                • {video.publishedAt}
              </Text>
            )}
          </View>

          <Text style={[styles.infoDesc, { color: isDark ? "#cbd5e1" : "#475569" }]}>
            {cleanDesc}
          </Text>

          <View style={[styles.divider, { backgroundColor: isDark ? "#27272a" : "#e2e8f0" }]} />

          {/* Playlist / Next Lessons */}
          <View style={styles.playlistHeader}>
            <Text
              style={[
                styles.playlistTitle,
                { color: isDark ? "#ffffff" : "#0f172a" },
              ]}
            >
              More Messages & Lessons
            </Text>
            <Text style={{ fontSize: 13, color: "#ff6719", fontWeight: "700" }}>
              {videos.length} videos
            </Text>
          </View>

          {videos.map((item) => {
            const isCurrent = item.id === video.id;
            const itemCleanTitle = (item.title || "")
              .replace(/‼️/g, "")
              .replace(/!!/g, "")
              .replace(/\s{2,}/g, " ")
              .trim();
            const itemCleanDesc = (item.desc || "")
              .replace(/‼️/g, "")
              .replace(/!!/g, "")
              .replace(/\s{2,}/g, " ")
              .trim();

            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync().catch(() => {});
                  }
                  onSelectVideo(item);
                }}
                android_ripple={{
                  color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                  borderless: false,
                }}
                style={({ pressed }) => [
                  styles.playlistItem,
                  {
                    backgroundColor: isCurrent
                      ? isDark
                        ? "rgba(255, 103, 25, 0.15)"
                        : "rgba(255, 103, 25, 0.08)"
                      : isDark
                      ? "#1c1c20"
                      : "#ffffff",
                    borderColor: isCurrent
                      ? "#ff6719"
                      : isDark
                      ? "#27272a"
                      : "#e2e8f0",
                  },
                  Platform.OS === "ios" && pressed && { opacity: 0.75 },
                ]}
              >
                <View style={styles.playlistThumbWrap}>
                  <Text style={styles.playlistThumbDuration}>{item.duration}</Text>
                  {isCurrent && (
                    <View style={styles.playingBadge}>
                      <Ionicons name="volume-high" size={13} color="#ffffff" />
                    </View>
                  )}
                </View>

                <View style={styles.playlistItemText}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.playlistItemTitle,
                      { color: isCurrent ? "#ff6719" : isDark ? "#ffffff" : "#0f172a" },
                    ]}
                  >
                    {itemCleanTitle}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.playlistItemDesc,
                      { color: isDark ? "#94a3b8" : "#64748b" },
                    ]}
                  >
                    {itemCleanDesc}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#000000",
  },
  topBarTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginHorizontal: 12,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 9999,
  },
  videoContainer: {
    width: "100%",
    height: VIDEO_HEIGHT,
    backgroundColor: "#000000",
    position: "relative",
  },
  videoView: {
    width: "100%",
    height: "100%",
  },
  centerOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 8,
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "600",
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: "#ff6719",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  scrollBody: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 14,
    gap: 8,
  },
  speakerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 6,
  },
  speakerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff6719",
    marginLeft: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  infoDesc: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  playlistHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  playlistTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  playlistThumbWrap: {
    width: 68,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  playlistThumbDuration: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  playingBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ff6719",
    justifyContent: "center",
    alignItems: "center",
  },
  playlistItemText: {
    flex: 1,
    marginLeft: 12,
  },
  playlistItemTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  playlistItemDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default VideoPlayerModal;
