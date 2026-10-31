import { Platform } from "react-native";

/**
 * Platform navigation transition configuration.
 * Kept false for standard, crisp default native stack push across platforms.
 */
export const USE_APPLE_ZOOM = false;

/**
 * Android shared-element transition is EXPERIMENTAL.
 * Keep false for clean native stack slide unless verified on target devices.
 */
export const ANDROID_SHARED_TRANSITION = false;

export const useAndroidSharedTag = (id: string, kind: "avatar" = "avatar") =>
  Platform.OS === "android" && ANDROID_SHARED_TRANSITION ? `${kind}-${id}` : undefined;
