import { ALL_OFFSETS_PRESETS, formatOffsetLabel, ReminderTarget } from "@/notifications";
import { AppBottomSheet } from "./AppBottomSheet";
import { Host, Switch } from "@expo/ui";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  if (!visible) return null;

  const now = Date.now();
  const textColor = isDark ? "#ffffff" : "#09090b";
  const subTextColor = isDark ? "#a1a1aa" : "#71717a";
  const borderColor = isDark ? "#27272a" : "#f1f5f9";
  const rowBorder = isDark ? "#27272a" : "#f4f4f5";

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      snapPoints={["half", "full"]}
    >
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

      {/* Offsets Switch List with Native @expo/ui Switch */}
      <ScrollView
        style={styles.offsetsList}
        showsVerticalScrollIndicator={false}
      >
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

              <Host matchContents style={styles.switchHost}>
                <Switch
                  value={isEnabled}
                  disabled={isPast}
                  onValueChange={() => onToggleOffset(offset)}
                />
              </Host>
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
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
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
    maxHeight: 280,
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
  switchHost: {
    minWidth: 48,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
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
