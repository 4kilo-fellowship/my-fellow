import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { setupNotifications } from "./setup";
import { reconcile } from "./scheduler";
import { handleNotificationResponse } from "./responses";

/**
 * Hook to be mounted once at root navigation level.
 * Handles:
 * 1. Startup notification configuration (channels, category, foreground handler, background task)
 * 2. Startup & foreground reconciliation (past event cleanup, orphan purge, iOS budget top-up)
 * 3. Cold start notification tap handling
 * 4. Runtime notification tap/action handling
 */
export function useNotificationObserver(): void {
  const appState = useRef<AppStateStatus>(
    (AppState.currentState ?? "active") as AppStateStatus,
  );

  useEffect(() => {
    // 1. One-time setup: foreground handler, Android channel, categories, background task registration
    setupNotifications().catch((err) => {
      console.warn("[notifications] setupNotifications error:", err);
    });

    // 2. Initial startup reconciliation
    reconcile().catch((err) => {
      console.warn("[notifications] initial reconcile error:", err);
    });

    // 3. Handle cold-start notification response if opened from killed state
    Notifications.getLastNotificationResponseAsync()
      .then((res) => {
        if (res) {
          handleNotificationResponse(res);
        }
      })
      .catch((err) => {
        console.warn(
          "[notifications] getLastNotificationResponseAsync error:",
          err,
        );
      });

    // 4. Tap / Action listener when app is alive (foreground or background)
    const subscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationResponse(response);
      });

    // 5. AppState change listener: run reconcile whenever the app returns to foreground
    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        reconcile().catch((err) => {
          console.warn("[notifications] foreground reconcile error:", err);
        });
      }
      appState.current = nextState;
    });

    return () => {
      subscription.remove();
      appStateSub.remove();
    };
  }, []);
}
