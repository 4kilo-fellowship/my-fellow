export const REMINDER_CHANNEL_ID = "reminders";
// Category IDs must not contain ':' or '-' per Expo SDK documentation
export const REMINDER_CATEGORY_ID = "reminder";
export const DEFAULT_OFFSETS_MIN = [30, 5, 0] as const;
export const ALL_OFFSETS_PRESETS = [1440, 60, 30, 15, 10, 5, 0] as const;
export const MAX_PENDING = 60; // Stay safely under Apple iOS's 64 notification limit
export const ID_PREFIX = "rem_";

export const ACTIONS = {
  SNOOZE: "snooze_10",
  MUTE: "mute",
} as const;

export const notifId = (eventId: string, offsetMin: number): string =>
  `${ID_PREFIX}${eventId}_${offsetMin}`;

export const snoozeNotifId = (eventId: string): string =>
  `${ID_PREFIX}${eventId}_snooze_${Date.now()}`;
