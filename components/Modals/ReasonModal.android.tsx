import { PRIMARY } from "@/constants/colors";
import {
  Column,
  Host,
  ModalBottomSheet,
  RNHostView,
  type ModalBottomSheetRef,
} from "@expo/ui/jetpack-compose";
import { height } from "@expo/ui/jetpack-compose/modifiers";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isDark?: boolean;
}

export const ReasonModal = ({
  visible,
  onClose,
  onSubmit,
  isDark = false,
}: ReasonModalProps) => {
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState("");

  const containerBg = isDark ? "#18181B" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#09090B";
  const subTextColor = isDark ? "#A1A1AA" : "#888888";
  const inputBg = isDark ? "#27272A" : "#F2F2F2";

  const close = async () => {
    Keyboard.dismiss();
    try {
      await sheetRef.current?.hide();
    } catch {}
    onClose();
  };

  const handleContinue = async () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    try {
      await sheetRef.current?.hide();
    } catch {}
    onSubmit(trimmed);
  };

  const isEnabled = reason.trim().length > 0;

  return (
    <Host style={{ position: "absolute", width: "100%" }} pointerEvents="box-none">
      {visible && (
        <ModalBottomSheet
          ref={sheetRef}
          onDismissRequest={close}
          skipPartiallyExpanded
          containerColor={containerBg}
          scrimColor={isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)"}
        >
          {/* give RN content an explicit height so the sheet fits it */}
          <Column modifiers={[height(230 + insets.bottom)]}>
            <RNHostView>
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: 20,
                  paddingBottom: insets.bottom + 16,
                  backgroundColor: containerBg,
                }}
              >
                <Text style={[styles.title, { color: textColor }]}>
                  Provide a Reason
                </Text>
                <Text
                  style={{
                    color: subTextColor,
                    marginTop: 4,
                    marginBottom: 16,
                    fontSize: 13,
                  }}
                >
                  What is this payment or contribution for?
                </Text>

                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="e.g. Gift, Tithe, Offering"
                  placeholderTextColor={isDark ? "#71717A" : "#A1A1AA"}
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      color: textColor,
                    },
                  ]}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  selectionColor={PRIMARY}
                />

                <View style={{ flex: 1 }} />
                <Pressable
                  disabled={!isEnabled}
                  onPress={handleContinue}
                  android_ripple={
                    isEnabled
                      ? {
                          color: "rgba(255, 255, 255, 0.28)",
                          borderless: false,
                          foreground: true,
                        }
                      : undefined
                  }
                  style={[
                    styles.button,
                    {
                      backgroundColor: isEnabled
                        ? PRIMARY
                        : isDark
                          ? "#3F3F46"
                          : "#FFC9A8",
                    },
                  ]}
                >
                  <Text style={styles.buttonText}>Continue to Payment →</Text>
                </Pressable>
              </View>
            </RNHostView>
          </Column>
        </ModalBottomSheet>
      )}
    </Host>
  );
};

export default ReasonModal;

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
