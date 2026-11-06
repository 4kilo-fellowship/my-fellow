import { Video } from "@/constants/videos";
import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
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
  videos?: Video[];
  onClose: () => void;
  onSelectVideo?: (video: Video) => void;
  isDark?: boolean;
}

const { width } = Dimensions.get("window");
const VIDEO_HEIGHT = Math.round((width * 9) / 16);

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  video,
  onClose,
  isDark = false,
}) => {
  const insets = useSafeAreaInsets();
  const videoViewRef = useRef<VideoView>(null);

  // Initialize expo-video player
  const player = useVideoPlayer(video?.videoUrl ?? "", (p) => {
    p.loop = false;
    if (visible && video?.videoUrl) {
      p.play();
    }
  });

  // Track player events
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

  // Clean, minimalist title: "Living Hope"
  let cleanTitle = (video.title || "")
    .replace(/‼️/g, "")
    .replace(/!!/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (video.id === "living-hope" || cleanTitle.toLowerCase().includes("living hope")) {
    cleanTitle = "Living Hope";
  }

  // Pure, rich scripture reflection description
  const cleanDesc =
    video.id === "living-hope"
      ? "Because of God’s great mercy, Jesus rose from the dead to give us a new life and a hope that never dies (1 Peter 1:3-4). A powerful Easter reflection on the living hope we have through Christ's resurrection."
      : (video.desc || "")
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

        {/* Minimalist Top Bar */}
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

        {/* Video Player Container */}
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

          {/* Minimalist Placeholder until video plays */}
          {!isPlaying && status !== "readyToPlay" && status !== "error" && video.thumbnail && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <ExpoImage
                source={{ uri: video.thumbnail }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              <View style={styles.placeholderDimmer}>
                <ActivityIndicator size="small" color="#ffffff" />
              </View>
            </View>
          )}

          {/* Error Overlay with Retry */}
          {status === "error" && (
            <View style={styles.centerOverlay}>
              <Ionicons name="alert-circle" size={38} color="#ef4444" />
              <Text style={styles.errorText}>Unable to load stream</Text>
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

        {/* Minimalist Details Section (Clean, Jargon-Free) */}
        <ScrollView
          style={[styles.scrollBody, { backgroundColor: isDark ? "#09090b" : "#ffffff" }]}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text
            style={[
              styles.infoTitle,
              { color: isDark ? "#ffffff" : "#0f172a" },
            ]}
          >
            {cleanTitle}
          </Text>

          {/* Description */}
          <Text
            style={[
              styles.infoDesc,
              { color: isDark ? "#a1a1aa" : "#475569" },
            ]}
          >
            {cleanDesc}
          </Text>
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
    fontSize: 15,
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
  placeholderContainer: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: "#000000",
  },
  placeholderDimmer: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  centerOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  infoDesc: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
  },
});

export default VideoPlayerModal;
