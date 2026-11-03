import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";
import { PermState } from "./types";

export async function ensurePermission(): Promise<PermState> {
  try {
    let p = await Notifications.getPermissionsAsync();
    const ok = (x: typeof p) =>
      x.granted ||
      x.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (ok(p)) return "granted";

    if (p.canAskAgain) {
      p = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: false },
      });
      if (ok(p)) return "granted";
    }

    return p.canAskAgain ? "denied" : "blocked";
  } catch (err) {
    console.warn("[permissions] Failed checking notification permission", err);
    return "denied";
  }
}

/**
 * Android 12+ exact alarms: without this permission the OS may delay
 * scheduled notifications. Android 14+ denies it by default for new
 * installs, so we check and, when possible, send the user to the system
 * screen to grant it. Never blocks scheduling — reminders simply become
 * approximate if denied.
 */
export async function ensureExactAlarmPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  try {
    const current = await Notifications.getExactAlarmPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;

    const result = await Notifications.requestExactAlarmPermissionsAsync();
    return result.granted;
  } catch (err) {
    // Older Android versions or unsupported builds: exact alarms are allowed.
    console.warn("[permissions] Exact alarm check unavailable:", err);
    return true;
  }
}

export const openNotificationSettings = (): Promise<void> =>
  Linking.openSettings();
