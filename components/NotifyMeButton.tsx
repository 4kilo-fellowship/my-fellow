import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { ReminderTarget, useReminder } from "@/notifications";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { ReminderSheet } from "./ReminderSheet";

export interface NotifyMeButtonProps {
  target: ReminderTarget | null;
  size?: "sm" | "md" | "lg";
  variant?: "pill" | "iconOnly" | "fullWidth";
  style?: StyleProp<ViewStyle>;
}

export function NotifyMeButton({
  target,
  size = "md",
  variant = "pill",
  style,
}: NotifyMeButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    status,
    offsets,
    isSheetOpen,
    enable,
    disable,
    toggleOffset,
    openSheet,
    closeSheet,
    openNotificationSettings,
  } = useReminder(target);

  // Bell ring & scale animation on activation
  const bellScale = useRef(new Animated.Value(1)).current;
  const bellRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === "active") {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(bellScale, {
            toValue: 1.25,
            useNativeDriver: true,
            speed: 20,
            bounciness: 12,
          }),
          Animated.sequence([
            Animated.timing(bellRotate, {
              toValue: 1,
              duration: 80,
              useNativeDriver: true,
            }),
            Animated.timing(bellRotate, {
              toValue: -1,
              duration: 80,
              useNativeDriver: true,
            }),
            Animated.timing(bellRotate, {
              toValue: 0.5,
              duration: 80,
              useNativeDriver: true,
            }),
            Animated.timing(bellRotate, {
              toValue: 0,
              duration: 80,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.spring(bellScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 15,
        }),
      ]).start();
    }
  }, [status, bellRotate, bellScale]);

  const spin = bellRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-16deg", "0deg", "16deg"],
  });

  const handlePress = () => {
    if (status === "active") {
      openSheet();
    } else if (status === "permission") {
      openNotificationSettings();
    } else if (status === "default") {
      enable();
    }
  };

  const getLabel = () => {
    switch (status) {
      case "active":
        return "Reminder on";
      case "loading":
        return "Setting...";
      case "permission":
        return "Enable alerts";
      case "unavailable":
        return "Event past";
      case "default":
      default:
        return "Notify me";
    }
  };

  const isIconOnly = variant === "iconOnly";
  const isFullWidth = variant === "fullWidth";

  const btnHeight = size === "sm" ? 38 : size === "lg" ? 52 : 44;
  const iconSize = size === "sm" ? 17 : size === "lg" ? 20 : 18;

  const activeBg = isDark ? "rgba(255, 103, 25, 0.18)" : "#fff7ed";
  const activeBorder = PRIMARY;
  const defaultBg = isDark ? "#27272a" : "#f4f4f5";
  const defaultBorder = isDark ? "#3f3f46" : "#e4e4e7";

  return (
    <>
      <View
        style={[
          styles.container,
          {
            height: btnHeight,
            minHeight: 44, // Minimum 44x44 pt touch target per guidelines
            borderRadius: btnHeight / 2,
            backgroundColor: status === "active" ? activeBg : defaultBg,
            borderColor: status === "active" ? activeBorder : defaultBorder,
          },
          isIconOnly && { width: btnHeight, minWidth: 44 },
          isFullWidth && { width: "100%" },
          status === "unavailable" && { opacity: 0.5 },
          style,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            selected: status === "active",
            disabled: status === "unavailable",
            busy: status === "loading",
          }}
          accessibilityLabel={
            target
              ? status === "active"
                ? `Manage reminders for ${target.title}`
                : `Turn on reminders for ${target.title}`
              : "Event reminder"
          }
          disabled={status === "unavailable"}
          onPress={handlePress}
          android_ripple={{
            color: "rgba(255, 103, 25, 0.25)",
            borderless: false,
          }}
          style={({ pressed }) => [
            styles.pressableInner,
            pressed && Platform.OS === "ios" && { opacity: 0.75 },
          ]}
        >
          {status === "loading" ? (
            <ActivityIndicator
              size="small"
              color={PRIMARY}
            />
          ) : (
            <Animated.View
              style={{
                transform: [{ scale: bellScale }, { rotate: spin }],
              }}
            >
              <Ionicons
                name={
                  status === "active"
                    ? "notifications"
                    : status === "permission"
                    ? "notifications-off-outline"
                    : "notifications-outline"
                }
                size={iconSize}
                color={
                  status === "active"
                    ? PRIMARY
                    : status === "permission"
                    ? "#ef4444"
                    : isDark
                    ? "#e4e4e7"
                    : "#3f3f46"
                }
              />
            </Animated.View>
          )}

          {!isIconOnly && (
            <Text
              style={[
                styles.labelText,
                {
                  fontSize: size === "sm" ? 13 : size === "lg" ? 16 : 14.5,
                  color:
                    status === "active"
                      ? PRIMARY
                      : isDark
                      ? "#ffffff"
                      : "#09090b",
                },
              ]}
              numberOfLines={1}
            >
              {getLabel()}
            </Text>
          )}
        </Pressable>
      </View>

      {target && (
        <ReminderSheet
          visible={isSheetOpen}
          target={target}
          activeOffsets={offsets}
          onToggleOffset={toggleOffset}
          onDisableAll={disable}
          onClose={closeSheet}
          isDark={isDark}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  pressableInner: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    gap: 8,
  },
  labelText: {
    fontWeight: "700",
    letterSpacing: -0.2,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
