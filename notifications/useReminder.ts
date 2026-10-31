import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { DEFAULT_OFFSETS_MIN } from "./config";
import { formatOffsetLabel } from "./copy";
import { ensurePermission, openNotificationSettings } from "./permissions";
import {
  cancelReminders,
  rescheduleReminders,
  scheduleReminders,
  sendConfirmationNotification,
} from "./scheduler";
import { getByEventId, subscribeToReminders } from "./storage";
import { PermState, ReminderTarget } from "./types";

export type ReminderStatus =
  | "default"
  | "loading"
  | "active"
  | "permission"
  | "unavailable";

export function useReminder(target: ReminderTarget | null) {
  const [status, setStatus] = useState<ReminderStatus>("loading");
  const [offsets, setOffsets] = useState<number[]>([...DEFAULT_OFFSETS_MIN]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<PermState>("granted");

  const syncState = useCallback(async () => {
    if (!target || !target.eventId) {
      setStatus("unavailable");
      return;
    }

    const now = Date.now();
    if (target.startsAt <= now + 5_000) {
      setStatus("unavailable");
      return;
    }

    const record = await getByEventId(target.eventId);
    if (record && record.offsets && record.offsets.length > 0) {
      setStatus("active");
      setOffsets(record.offsets);
    } else {
      setStatus("default");
      setOffsets([...DEFAULT_OFFSETS_MIN]);
    }
  }, [target]);

  useEffect(() => {
    syncState();
    const unsubscribe = subscribeToReminders(() => {
      syncState();
    });
    return unsubscribe;
  }, [syncState]);

  const enable = async () => {
    if (!target) return;
    const now = Date.now();
    if (target.startsAt <= now + 5_000) {
      setStatus("unavailable");
      Toast.show({
        type: "info",
        text1: "Event Unavailable",
        text2: "This event is already underway or past.",
      });
      return;
    }

    setStatus("loading");

    try {
      const perm = await ensurePermission();
      setPermissionState(perm);

      if (perm !== "granted") {
        setStatus("permission");
        Toast.show({
          type: "warning",
          text1: "Notifications Off",
          text2: "Enable notifications in settings to receive event reminders.",
        });
        return;
      }

      const scheduled = await scheduleReminders(target, offsets);

      if (scheduled.length === 0) {
        setStatus("unavailable");
        Toast.show({
          type: "info",
          text1: "Notice",
          text2: "Event is starting momentarily.",
        });
        return;
      }

      await sendConfirmationNotification(target, scheduled);

      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } catch {}

      setStatus("active");
      setOffsets(scheduled);

      const chipsText = scheduled.map(formatOffsetLabel).join(" · ");
      Toast.show({
        type: "success",
        text1: "Reminders Set 🔔",
        text2: chipsText,
      });
    } catch (err) {
      console.warn("[useReminder] Error enabling reminder:", err);
      setStatus("default");
      Toast.show({
        type: "error",
        text1: "Reminder Error",
        text2: "Could not schedule local reminder. Please try again.",
      });
    }
  };

  const disable = async () => {
    if (!target) return;
    setStatus("loading");
    try {
      await cancelReminders(target.eventId);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      setStatus("default");
      setOffsets([...DEFAULT_OFFSETS_MIN]);
      setIsSheetOpen(false);

      Toast.show({
        type: "info",
        text1: "Reminders Turned Off",
        text2: "All local notifications for this event have been cancelled.",
      });
    } catch (err) {
      console.warn("[useReminder] Error cancelling reminder:", err);
      setStatus("active");
    }
  };

  const toggleOffset = async (offsetMin: number) => {
    if (!target) return;
    const isCurrentlySet = offsets.includes(offsetMin);
    const newOffsets = isCurrentlySet
      ? offsets.filter((o) => o !== offsetMin)
      : [...offsets, offsetMin].sort((a, b) => b - a);

    if (newOffsets.length === 0) {
      await disable();
      return;
    }

    try {
      const scheduled = await rescheduleReminders(target, newOffsets);
      setOffsets(scheduled);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    } catch (err) {
      console.warn("[useReminder] Failed toggling offset:", err);
    }
  };

  const openSheet = () => setIsSheetOpen(true);
  const closeSheet = () => setIsSheetOpen(false);

  return {
    status,
    offsets,
    isSheetOpen,
    permissionState,
    enable,
    disable,
    toggleOffset,
    openSheet,
    closeSheet,
    openNotificationSettings,
  };
}
