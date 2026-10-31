import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { ACTIONS, REMINDER_CATEGORY_ID, REMINDER_CHANNEL_ID } from "./config";
import { handleNotificationResponse } from "./responses";

export const REMINDER_NOTIFICATION_TASK = "REMINDER_NOTIFICATION_TASK";

// Configure how notifications appear while the application is in the FOREGROUND
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Module-level background task definition (required by Expo TaskManager)
try {
  if (!TaskManager.isTaskDefined(REMINDER_NOTIFICATION_TASK)) {
    TaskManager.defineTask(
      REMINDER_NOTIFICATION_TASK,
      async ({ data, error }) => {
        if (error) {
          console.warn("[reminders task] Background task error:", error);
          return;
        }
        if (data && typeof data === "object" && "actionIdentifier" in data) {
          await handleNotificationResponse(
            data as Notifications.NotificationResponse,
          );
        }
      },
    );
  }
} catch (e) {
  console.warn("[reminders task] Failed to define background task:", e);
}

export async function setupNotifications(): Promise<void> {
  try {
    if (Platform.OS === "android") {
      // Must be created BEFORE requesting permissions on Android 13+
      await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
        name: "Event Reminders",
        description: "Timely reminders for upcoming fellowship events and services",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
      });
    }

    // Register actionable notification categories
    await Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY_ID, [
      {
        identifier: ACTIONS.SNOOZE,
        buttonTitle: "Snooze 10m",
        options: {
          opensAppToForeground: Platform.OS === "ios",
        },
      },
      {
        identifier: ACTIONS.MUTE,
        buttonTitle: "Turn off",
        options: {
          opensAppToForeground: false,
          isDestructive: true,
        },
      },
    ]);

    // Register background task with Notifications API
    await Notifications.registerTaskAsync(REMINDER_NOTIFICATION_TASK);
  } catch (err) {
    console.warn("[notifications setup] Setup failed gracefully:", err);
  }
}
