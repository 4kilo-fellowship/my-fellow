import { ALL_OFFSETS_PRESETS, formatOffsetLabel, ReminderTarget } from "@/notifications";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ReminderSheetProps {
  visible: boolean;
  target: ReminderTarget;
  activeOffsets: number[];
  onToggleOffset: (offsetMin: number) => void;
  onDisableAll: () => void;
  onClose: () => void;
  isDark?: boolean;
}

export function ReminderSheet({
  visible,
  target,
  activeOffsets,
  onToggleOffset,
  onDisableAll,
  onClose,
  isDark = false,
}: ReminderSheetProps) {
  const insets = useSafeAreaInsets();
  const now = Date.now();

  const bg = isDark ? "#18181b" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#09090b";
  const subTextColor = isDark ? "#a1a1aa" : "#71717a";
  const borderColor = isDark ? "#27272a" : "#f1f5f9";
  const rowBorder = isDark ? "#27272a" : "#f4f4f5";

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Tap outside to dismiss */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: bg,
              paddingBottom: Math.max(insets.bottom + 12, 24),
            },
          ]}
        >
          {/* Top Grab Handle */}
          <View style={styles.handleWrap}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? "#3f3f46" : "#e4e4e7" },
              ]}
            />
          </View>

          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetTitle, { color: textColor }]} numberOfLines={1}>
                Reminders
              </Text>
              <Text style={[styles.sheetSubtitle, { color: subTextColor }]} numberOfLines={1}>
                {target.title}
              </Text>
            </View>

            <Pressable
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Ionicons
                name="close"
                size={22}
                color={isDark ? "#d4d4d8" : "#52525b"}
              />
            </Pressable>
          </View>

          {/* Offsets Switch List */}
          <ScrollView style={styles.offsetsList} showsVerticalScrollIndicator={false}>
            {ALL_OFFSETS_PRESETS.map((offset) => {
              const fireAt = target.startsAt - offset * 60_000;
              const isPast = fireAt <= now + 5_000;
              const isEnabled = activeOffsets.includes(offset) && !isPast;

              return (
                <View
                  key={offset}
                  style={[
                    styles.offsetRow,
                    { borderBottomColor: rowBorder },
                    isPast && { opacity: 0.4 },
                  ]}
                >
                  <View style={styles.offsetLabelCol}>
                    <Text
                      style={[
                        styles.offsetTitle,
                        { color: isPast ? subTextColor : textColor },
                      ]}
                    >
                      {formatOffsetLabel(offset)}
                    </Text>
                    {isPast ? (
                      <Text style={[styles.offsetStatusText, { color: subTextColor }]}>
                        Already past
                      </Text>
                    ) : (
                      <Text style={[styles.offsetStatusText, { color: subTextColor }]}>
                        {new Date(fireAt).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          weekday: "short",
                        })}
                      </Text>
                    )}
                  </View>

                  <Switch
                    value={isEnabled}
                    disabled={isPast}
                    onValueChange={() => onToggleOffset(offset)}
                    trackColor={{
                      false: isDark ? "#3f3f46" : "#e4e4e7",
                      true: "#ff6719",
                    }}
                    thumbColor={
                      Platform.OS === "android"
                        ? isEnabled
                          ? "#ffffff"
                          : "#f4f4f5"
                        : undefined
                    }
                  />
                </View>
              );
            })}
          </ScrollView>

          {/* Footer: Turn Off All Reminders */}
          <View style={styles.footerWrap}>
            <Pressable
              onPress={() => {
                onDisableAll();
                onClose();
              }}
              android_ripple={{ color: "rgba(239, 68, 68, 0.2)" }}
              style={({ pressed }) => [
                styles.turnOffBtn,
                pressed && Platform.OS === "ios" && { opacity: 0.7 },
              ]}
            >
              <Ionicons
                name="notifications-off-outline"
                size={18}
                color="#ef4444"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.turnOffText}>Turn off all reminders</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  offsetsList: {
    marginVertical: 6,
  },
  offsetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  offsetLabelCol: {
    flex: 1,
    paddingRight: 12,
  },
  offsetTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  offsetStatusText: {
    fontSize: 12,
    marginTop: 2,
  },
  footerWrap: {
    paddingTop: 14,
    alignItems: "center",
  },
  turnOffBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  turnOffText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "600",
  },
});
