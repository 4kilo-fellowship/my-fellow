import * as Notifications from "expo-notifications";
import { Linking } from "react-native";
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

export const openNotificationSettings = (): Promise<void> =>
  Linking.openSettings();
