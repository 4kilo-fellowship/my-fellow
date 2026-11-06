import React from "react";
import { Host, BottomSheet, RNHostView } from "@expo/ui";
import {
  View,
  StyleSheet,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

export interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isDark?: boolean;
  snapPoints?: ("half" | "full")[];
}

export const AppBottomSheet: React.FC<AppBottomSheetProps> = ({
  visible,
  onClose,
  children,
  isDark = false,
  snapPoints = ["half", "full"],
}) => {
  const containerBg = isDark ? "#18181B" : "#FFFFFF";

  if (Platform.OS !== "web") {
    if (!visible) return null;
    return (
      <Host
        colorScheme={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
      >
        <BottomSheet
          isPresented={visible}
          onDismiss={onClose}
          showDragIndicator={true}
          containerColor={containerBg}
          scrimColor={isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)"}
          contentPadding={0}
          snapPoints={snapPoints}
        >
          <RNHostView style={{ width: "100%" }}>
            <View style={[styles.sheetContent, { backgroundColor: containerBg }]}>
              {children}
            </View>
          </RNHostView>
        </BottomSheet>
      </Host>
    );
  }

  // Web fallback modal
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.webOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.webBackdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[styles.webSheetContainer, { backgroundColor: containerBg }]}
        >
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? "#3F3F46" : "#E2E8F0" },
              ]}
            />
          </View>
          <View style={[styles.sheetContent, { backgroundColor: containerBg }]}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetContent: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  webOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  webBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  webSheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    overflow: "hidden",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
});

export default AppBottomSheet;
