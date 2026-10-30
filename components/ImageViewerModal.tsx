import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ImageViewerModalProps {
  visible: boolean;
  imageUri: string | any | null;
  caption?: string;
  authorName?: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  imageUri,
  caption,
  authorName,
  onClose,
}) => {
  if (!visible || !imageUri) return null;

  const imageSource =
    typeof imageUri === "string" ? { uri: imageUri } : imageUri;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <StatusBar style="light" />

        <SafeAreaView style={styles.safeHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={26} color="#ffffff" />
          </TouchableOpacity>

          {authorName && (
            <Text numberOfLines={1} style={styles.headerAuthor}>
              {authorName}
            </Text>
          )}

          <View style={{ width: 40 }} />
        </SafeAreaView>

        {/* Center Image */}
        <Pressable style={styles.imageContainer} onPress={onClose}>
          <ExpoImage
            source={imageSource}
            style={styles.fullscreenImage}
            contentFit="contain"
            transition={300}
          />
        </Pressable>

        {/* Optional Caption at Bottom */}
        {caption ? (
          <SafeAreaView style={styles.captionContainer}>
            <Text numberOfLines={3} style={styles.captionText}>
              {caption}
            </Text>
          </SafeAreaView>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "space-between",
  },
  safeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAuthor: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  captionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  captionText: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
