import { Video } from "@/constants/videos";
import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

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
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [speedIndex, setSpeedIndex] = useState(1); // default 1.0x
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);
  const progressBarWidth = useRef(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Initialize expo-video player
  const player = useVideoPlayer(video?.videoUrl ?? "", (p) => {
    p.loop = false;
    p.playbackRate = SPEED_OPTIONS[speedIndex];
    if (visible && video?.videoUrl) {
      p.play();
    }
  });

  // Track player events reactively
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player?.playing ?? false,
  });

  const { status, error } = useEvent(player, "statusChange", {
    status: player?.status ?? "idle",
    error: null as any,
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

  // Update source when active video changes
  useEffect(() => {
    if (visible && video?.videoUrl && player) {
      try {
        player.replace(video.videoUrl);
        player.playbackRate = SPEED_OPTIONS[speedIndex];
        player.play();
      } catch (err) {
        console.warn("Error replacing video source:", err);
      }
    }
  }, [video?.videoUrl, visible]);

  // Controls auto-hiding logic
  const resetControlsTimer = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => {
        hideControls();
      }, 3500);
    }
  };

  const showControls = () => {
    setControlsVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
    resetControlsTimer();
  };

  const hideControls = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setControlsVisible(false);
    });
  };

  const toggleControls = () => {
    if (controlsVisible) {
      hideControls();
    } else {
      showControls();
    }
  };

  const handlePlayPause = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (!player) return;
    if (isPlaying) {
      player.pause();
      showControls();
    } else {
      player.play();
      resetControlsTimer();
    }
  };

  const handleSeek = (secondsDelta: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (!player) return;
    const target = Math.max(0, Math.min(player.duration || 0, player.currentTime + secondsDelta));
    player.currentTime = target;
    showControls();
  };

  const cyclePlaybackSpeed = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    const nextIndex = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(nextIndex);
    const newSpeed = SPEED_OPTIONS[nextIndex];
    if (player) {
      player.playbackRate = newSpeed;
    }
    showControls();
  };

  const handleClose = () => {
    if (player) {
      player.pause();
    }
    deactivateKeepAwake("video_player").catch(() => {});
    onClose();
  };

  // Progress calculations
  const duration = player?.duration ?? 0;
  const currentTime = isScrubbing ? scrubPosition : (player?.currentTime ?? 0);
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  const handleProgressBarPress = (evt: any) => {
    if (!player || duration <= 0 || progressBarWidth.current <= 0) return;
    const clickX = evt.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, clickX / progressBarWidth.current));
    const targetTime = ratio * duration;
    player.currentTime = targetTime;
    showControls();
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  if (!video) return null;

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

        {/* Video Player Container (Strict 16:9 Presentation) */}
        <View style={[styles.videoContainer, { marginTop: insets.top }]}>
          <Pressable style={styles.videoSurface} onPress={toggleControls}>
            <VideoView
              ref={videoViewRef}
              player={player}
              style={styles.videoView}
              contentFit="contain"
              nativeControls={false}
              allowsPictureInPicture
            />

            {/* Buffering Indicator */}
            {status === "loading" && (
              <View style={styles.centerOverlay}>
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

            {/* Reusable Production Controls Overlay */}
            {controlsVisible && (
              <Animated.View style={[styles.controlsOverlay, { opacity: fadeAnim }]}>
                {/* Top Action Bar */}
                <View style={styles.topBar}>
                  <Pressable
                    hitSlop={10}
                    onPress={handleClose}
                    android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true, radius: 20 }}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="chevron-down" size={26} color="#FFFFFF" />
                  </Pressable>

                  <Text numberOfLines={1} style={styles.topBarTitle}>
                    {video.title}
                  </Text>

                  <Pressable
                    hitSlop={10}
                    onPress={cyclePlaybackSpeed}
                    android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: false }}
                    style={styles.speedBadge}
                  >
                    <Text style={styles.speedBadgeText}>{SPEED_OPTIONS[speedIndex]}x</Text>
                  </Pressable>
                </View>

                {/* Center Transport Controls (Rewind 10s, Play/Pause, Forward 10s) */}
                <View style={styles.centerControls}>
                  <Pressable
                    hitSlop={12}
                    onPress={() => handleSeek(-10)}
                    android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true, radius: 24 }}
                    style={styles.seekBtn}
                  >
                    <Ionicons name="arrow-undo" size={24} color="#FFFFFF" />
                    <Text style={styles.seekBtnLabel}>10</Text>
                  </Pressable>

                  <Pressable
                    hitSlop={16}
                    onPress={handlePlayPause}
                    android_ripple={{ color: "rgba(255,255,255,0.25)", borderless: true, radius: 36 }}
                    style={styles.playPauseBtn}
                  >
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={36}
                      color="#FFFFFF"
                      style={{ marginLeft: isPlaying ? 0 : 3 }}
                    />
                  </Pressable>

                  <Pressable
                    hitSlop={12}
                    onPress={() => handleSeek(10)}
                    android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: true, radius: 24 }}
                    style={styles.seekBtn}
                  >
                    <Ionicons name="arrow-redo" size={24} color="#FFFFFF" />
                    <Text style={styles.seekBtnLabel}>10</Text>
                  </Pressable>
                </View>

                {/* Bottom Timeline & Duration Controls */}
                <View style={styles.bottomBar}>
                  <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>

                  {/* Interactive Scrub Bar */}
                  <Pressable
                    style={styles.progressTrack}
                    onPress={handleProgressBarPress}
                    onLayout={(e) => {
                      progressBarWidth.current = e.nativeEvent.layout.width;
                    }}
                  >
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
                    </View>
                    <View
                      style={[
                        styles.progressThumb,
                        { left: `${Math.max(0, Math.min(97, progressRatio * 100))}%` },
                      ]}
                    />
                  </Pressable>

                  <Text style={styles.timeLabel}>{formatTime(duration)}</Text>

                  {/* Fullscreen Button */}
                  <Pressable
                    hitSlop={8}
                    onPress={() => {
                      if (videoViewRef.current) {
                        videoViewRef.current.enterFullscreen();
                      }
                    }}
                    style={styles.fullscreenBtn}
                  >
                    <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                  </Pressable>
                </View>
              </Animated.View>
            )}
          </Pressable>
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
            {video.title}
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
            {video.desc}
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
                    {item.title}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.playlistItemDesc,
                      { color: isDark ? "#94a3b8" : "#64748b" },
                    ]}
                  >
                    {item.desc}
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

const { width } = Dimensions.get("window");
const VIDEO_HEIGHT = (width * 9) / 16;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  videoContainer: {
    width: "100%",
    height: VIDEO_HEIGHT,
    backgroundColor: "#000000",
  },
  videoSurface: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  videoView: {
    width: "100%",
    height: "100%",
  },
  centerOverlay: {
    ...StyleSheet.absoluteFill as any,
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
  controlsOverlay: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: "rgba(0,0,0,0.48)",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  speedBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  speedBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  centerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 36,
  },
  seekBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  seekBtnLabel: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
  playPauseBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 103, 25, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timeLabel: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  progressTrack: {
    flex: 1,
    height: 24,
    justifyContent: "center",
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ff6719",
  },
  progressThumb: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ffffff",
    top: 6,
  },
  fullscreenBtn: {
    padding: 4,
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
    gap: 8,
    marginBottom: 12,
  },
  speakerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  speakerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff6719",
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
    width: "100%",
    marginBottom: 18,
  },
  playlistHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  playlistThumbWrap: {
    width: 80,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  playlistThumbDuration: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  playingBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ff6719",
    borderRadius: 4,
    padding: 2,
  },
  playlistItemText: {
    flex: 1,
  },
  playlistItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  playlistItemDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
