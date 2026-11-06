import React from "react";
import { Host, BottomSheet, RNHostView } from "@expo/ui";
import {
  View,
  StyleSheet,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isDark?: boolean;
  snapPoints?: ("half" | "full")[];
  contentStyle?: StyleProp<ViewStyle>;
}

export const AppBottomSheet: React.FC<AppBottomSheetProps> = ({
  visible,
  onClose,
  children,
  isDark = false,
  snapPoints = ["half", "full"],
  contentStyle,
}) => {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const containerBg = isDark ? "#18181B" : "#FFFFFF";
  const isFullScreen = snapPoints.length === 1 && snapPoints[0] === "full";
  const bottomInset = Math.max(insets.bottom, 16) + 16;
  const minHalfHeight = isFullScreen ? undefined : windowHeight * 0.52;

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
          <RNHostView
            matchContents={isFullScreen ? false : { vertical: true, horizontal: true }}
          >
            <View
              style={[
                styles.sheetContentBase,
                isFullScreen ? styles.sheetContentFull : styles.sheetContentAuto,
                {
                  backgroundColor: containerBg,
                  paddingBottom: bottomInset,
                  minHeight: minHalfHeight,
                },
                contentStyle,
              ]}
            >
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
          <View
            style={[
              styles.sheetContentBase,
              styles.sheetContentAuto,
              { backgroundColor: containerBg, paddingBottom: bottomInset },
              contentStyle,
            ]}
          >
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetContentBase: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sheetContentAuto: {},
  sheetContentFull: {
    flex: 1,
    justifyContent: "flex-end",
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
