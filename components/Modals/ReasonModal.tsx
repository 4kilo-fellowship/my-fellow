import AppButton from "@/components/AppButton";
import { AppBottomSheet } from "@/components/AppBottomSheet";
import { PRIMARY } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ReasonModalProps {
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
  const [reason, setReason] = useState<string>("Gift");
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      setReason("Gift");
      setIsFocused(true);
      const t1 = setTimeout(() => inputRef.current?.focus(), 150);
      const t2 = setTimeout(() => inputRef.current?.focus(), 400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setKeyboardHeight(0);
    }
  }, [visible]);

  const handleSubmit = () => {
    Keyboard.dismiss();
    const trimmed = reason.trim();
    onSubmit(trimmed || "Gift");
  };

  const cardBg = isDark ? "#27272A" : "#F4F4F5";
  const textColor = isDark ? "#FFFFFF" : "#09090B";
  const subTextColor = isDark ? "#A1A1AA" : "#71717A";
  const borderColor = isDark ? "#3F3F46" : "#E4E4E7";

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      snapPoints={["full"]}
    >
      <View
        style={[
          styles.sheetContainer,
          {
            paddingBottom:
              keyboardHeight > 0
                ? keyboardHeight + 12
                : Platform.OS === "ios"
                  ? 36
                  : 24,
          },
        ]}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: textColor }]}>
              Provide a Reason
            </Text>
            <Text style={[styles.subtitle, { color: subTextColor }]}>
              What is this payment or contribution for?
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: cardBg }]}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color={subTextColor} />
          </TouchableOpacity>
        </View>

        {/* Input Box - styled like Auth input */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: cardBg,
              borderColor: isFocused ? PRIMARY : borderColor,
              borderWidth: isFocused ? 2 : 1,
            },
          ]}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={isFocused ? PRIMARY : subTextColor}
            style={{ marginRight: 10 }}
          />
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: textColor }]}
            placeholder="e.g. Gift, Tithe, Offering..."
            placeholderTextColor={isDark ? "#71717A" : "#A1A1AA"}
            value={reason}
            onChangeText={setReason}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            selectionColor={PRIMARY}
            autoFocus={true}
          />
          {reason.length > 0 && (
            <TouchableOpacity
              onPress={() => setReason("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={subTextColor}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Auth-styled Primary CTA Button */}
        <View style={styles.actionSection}>
          <AppButton
            title="Continue to Payment"
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {},
                );
              }
              handleSubmit();
            }}
            variant="primary"
            size="lg"
            icon="arrow-forward"
            iconPosition="right"
            fullWidth={true}
            isDark={isDark}
          />
        </View>
      </View>
    </AppBottomSheet>
  );
};

export default ReasonModal;

const styles = StyleSheet.create({
  sheetContainer: {
    width: "100%",
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 0,
  },
  actionSection: {
    width: "100%",
    marginTop: 2,
  },
});
