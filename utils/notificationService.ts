import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { REMINDER_CHANNEL_ID } from "@/notifications/config";

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Push notification token registration for remote server pushes.
 * Only requested when network connectivity and EAS credentials are present.
 */
export const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
        name: "Event Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
      });
    }

    if (isExpoGo) return;

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) return;

    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e) {
    console.warn("[notificationService] Push token registration skipped or offline:", e);
  }
};

/**
 * Ensures local notification permissions without requiring network or push tokens.
 */
export const ensureLocalNotificationPermissionAsync = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (e) {
    console.warn("[notificationService] Local permission check failed:", e);
    return false;
  }
};

/**
 * Schedules a local notification for reminders, habits, or programs.
 * Operates 100% offline using native device alarms.
 */
export const scheduleNotification = async (
  title: string,
  body: string,
  date: Date,
  id?: string,
  repeats?: "daily" | "weekly" | "none",
): Promise<void> => {
  const hasPermission = await ensureLocalNotificationPermissionAsync();
  if (!hasPermission) return;

  const SchedulableTriggerInputTypes =
    Notifications.SchedulableTriggerInputTypes;

  let trigger: Notifications.NotificationTriggerInput;
  const scheduledDate = new Date(date);

  if (repeats === "daily") {
    trigger = {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: scheduledDate.getHours(),
      minute: scheduledDate.getMinutes(),
      channelId: Platform.OS === "android" ? REMINDER_CHANNEL_ID : undefined,
    };
  } else if (repeats === "weekly") {
    const jsDay = scheduledDate.getDay();
    const expoWeekday = jsDay + 1; // Expo expects 1-7 (Sunday=1)

    trigger = {
      type: SchedulableTriggerInputTypes.WEEKLY,
      weekday: expoWeekday,
      hour: scheduledDate.getHours(),
      minute: scheduledDate.getMinutes(),
      channelId: Platform.OS === "android" ? REMINDER_CHANNEL_ID : undefined,
    };
  } else {
    if (scheduledDate.getTime() <= Date.now()) {
      return;
    }

    trigger = {
      type: SchedulableTriggerInputTypes.DATE,
      date: scheduledDate,
      channelId: Platform.OS === "android" ? REMINDER_CHANNEL_ID : undefined,
    };
  }

  try {
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    }

    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body,
        sound: "default",
        data: { id },
        categoryIdentifier: "reminder",
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
  } catch (e) {
    console.error("[notificationService] Failed to schedule notification:", e);
  }
};

/**
 * Sends an immediate in-app local notification banner.
 */
export const sendImmediateNotification = async (
  title: string,
  body: string,
  id?: string,
): Promise<void> => {
  const hasPermission = await ensureLocalNotificationPermissionAsync();
  if (!hasPermission) return;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body,
        sound: "default",
        data: { id },
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  } catch (e) {
    console.error("[notificationService] Failed to send immediate notification:", e);
  }
};

/**
 * Cancels a scheduled local notification by ID.
 */
export const cancelNotification = async (id: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {}
};
