import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { ACTIONS } from "./config";
import { cancelReminders, scheduleSnooze } from "./scheduler";

function navigateToUrl(url: unknown): void {
  if (typeof url !== "string" || url.length === 0) return;

  try {
    const path = url.startsWith("/") ? url : `/${url}`;
    router.push(path as any);
  } catch (routerErr) {
    console.warn(
      "[notification response] Navigation failed or app in background:",
      routerErr,
    );
  }
}

export async function handleNotificationResponse(
  res: Notifications.NotificationResponse,
): Promise<void> {
  try {
    const data = (res.notification.request.content.data || {}) as {
      eventId?: string;
      url?: string;
      title?: string;
    };

    switch (res.actionIdentifier) {
      case ACTIONS.SNOOZE:
        if (data.eventId) {
          await scheduleSnooze(res.notification.request.content, 10);
        }
        break;

      case ACTIONS.MUTE:
        if (data.eventId) {
          await cancelReminders(data.eventId);
        }
        break;

      case ACTIONS.VIEW:
        navigateToUrl(data.url);
        break;

      case Notifications.DEFAULT_ACTION_IDENTIFIER:
      default:
        navigateToUrl(data.url);
        break;
    }

    try {
      await Notifications.clearLastNotificationResponseAsync();
    } catch {
      // Ignored if unsupported
    }
  } catch (err) {
    console.warn("[notification response] Failed handling response:", err);
  }
}
