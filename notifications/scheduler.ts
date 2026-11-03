import * as Notifications from "expo-notifications";
import {
  DEFAULT_OFFSETS_MIN,
  ID_PREFIX,
  MAX_PENDING,
  REMINDER_CATEGORY_ID,
  REMINDER_CHANNEL_ID,
  notifId,
  snoozeNotifId,
} from "./config";
import { buildConfirmationCopy, buildCopy } from "./copy";
import { loadAll, remove, save } from "./storage";
import { ReminderRecord, ReminderTarget } from "./types";
import {
  filterValidOffsets,
  calculateBudgetAssignments,
  findOrphanNotificationIds,
} from "./pure";

export {
  filterValidOffsets,
  calculateBudgetAssignments,
  findOrphanNotificationIds,
};

type ReminderRepeats = "none" | "weekly";

interface ReminderScheduleOptions {
  /** "weekly" repeats every week at the same local weekday/time (default "none"). */
  repeats?: ReminderRepeats;
}

/**
 * Builds the native trigger for a reminder offset.
 * Weekly reminders use a WEEKLY trigger so one notification repeats forever
 * instead of flooding the iOS 64-pending-notification budget with one-offs.
 */
function buildReminderTrigger(
  fireAt: number,
  repeats: ReminderRepeats,
): Notifications.NotificationTriggerInput {
  if (repeats === "weekly") {
    const fireDate = new Date(fireAt);
    return {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: fireDate.getDay() + 1, // Expo expects 1-7 (Sunday = 1)
      hour: fireDate.getHours(),
      minute: fireDate.getMinutes(),
      channelId: REMINDER_CHANNEL_ID,
    };
  }

  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: new Date(fireAt),
    channelId: REMINDER_CHANNEL_ID,
  };
}

/**
 * Schedules multi-offset local notifications for a given event target.
 * Works fully offline — the OS owns delivery once scheduled.
 */
export async function scheduleReminders(
  target: ReminderTarget,
  offsets: readonly number[] = DEFAULT_OFFSETS_MIN,
  options: ReminderScheduleOptions = {},
): Promise<number[]> {
  const now = Date.now();
  const repeats: ReminderRepeats = options.repeats ?? "none";
  // Weekly reminders always have a valid "next occurrence" in the future.
  const validOffsets =
    repeats === "weekly"
      ? [...new Set(offsets)].sort((a, b) => b - a)
      : filterValidOffsets(target.startsAt, offsets, now);

  if (validOffsets.length === 0) {
    // Event is already in the past or starts within seconds
    return [];
  }

  // Check iOS 64-notification budget
  let allScheduled: Notifications.NotificationRequest[] = [];
  try {
    allScheduled = await Notifications.getAllScheduledNotificationsAsync();
  } catch (e) {
    console.warn("[reminders scheduler] Could not read scheduled notifications", e);
  }

  const existingRemindersCount = allScheduled.filter((n) =>
    n.identifier.startsWith(ID_PREFIX),
  ).length;

  const { allowCount } = calculateBudgetAssignments(
    existingRemindersCount,
    validOffsets.length,
    MAX_PENDING,
  );

  const offsetsToSchedule = validOffsets.slice(0, allowCount);
  const isDeferred = allowCount < validOffsets.length;

  const scheduledResults: number[] = [];

  for (const offset of offsetsToSchedule) {
    const fireAt = target.startsAt - offset * 60_000;
    const identifier = notifId(target.eventId, offset);
    const { title, body } = buildCopy(target, offset);

    try {
      // First cancel any existing one with identical deterministic ID
      await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title,
          body,
          data: {
            eventId: target.eventId,
            offset,
            url: target.url,
            startsAt: target.startsAt,
            title: target.title,
          },
          categoryIdentifier: target.categoryId ?? REMINDER_CATEGORY_ID,
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: buildReminderTrigger(fireAt, repeats),
      });

      scheduledResults.push(offset);
    } catch (schedErr) {
      console.warn(`[reminders scheduler] Failed scheduling offset ${offset}:`, schedErr);
    }
  }

  await save({
    ...target,
    offsets: scheduledResults,
    createdAt: now,
    deferred: isDeferred,
    repeats,
  });

  return scheduledResults;
}

/**
 * Fires an immediate confirmation notification (trigger: null) after scheduling succeeds.
 */
export async function sendConfirmationNotification(
  target: ReminderTarget,
  scheduledOffsets: number[],
): Promise<void> {
  if (scheduledOffsets.length === 0) return;

  const { title, body } = buildConfirmationCopy(scheduledOffsets);

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          eventId: target.eventId,
          url: target.url,
          title: target.title,
        },
        categoryIdentifier: target.categoryId ?? REMINDER_CATEGORY_ID,
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Immediate delivery
    });
  } catch (err) {
    console.warn("[reminders scheduler] Failed sending confirmation notification:", err);
  }
}

/**
 * Cancels all scheduled reminder notifications for an event and clears storage.
 */
export async function cancelReminders(eventId: string): Promise<void> {
  const records = await loadAll();
  const targetRecord = records.find((r) => r.eventId === eventId);
  const offsetsToCancel = targetRecord?.offsets || [...DEFAULT_OFFSETS_MIN];

  await Promise.all(
    offsetsToCancel.map(async (offset) => {
      const identifier = notifId(eventId, offset);
      try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      } catch {}
    }),
  );

  await remove(eventId);
}

/**
 * Reschedules reminders for an event when target dates or user offsets change.
 */
export async function rescheduleReminders(
  target: ReminderTarget,
  newOffsets: readonly number[] = DEFAULT_OFFSETS_MIN,
  options: ReminderScheduleOptions = {},
): Promise<number[]> {
  await cancelReminders(target.eventId);
  return scheduleReminders(target, newOffsets, options);
}

/**
 * Schedules a one-off 10-minute snooze reminder from action button tap.
 */
export async function scheduleSnooze(
  content: Notifications.NotificationContent,
  snoozeMinutes: number = 10,
): Promise<void> {
  const eventId = String(content.data?.eventId || "snooze");
  const identifier = snoozeNotifId(eventId);
  const snoozeFireAt = new Date(Date.now() + snoozeMinutes * 60_000);

  try {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        ...content,
        badge: (content as any).badge ?? undefined,
        subtitle: content.subtitle ?? undefined,
        title: content.title || "Event Reminder",
        body: content.body || `Snoozed for ${snoozeMinutes} minutes`,
        // Preserve the original category so the action buttons stay available
        categoryIdentifier: content.categoryIdentifier ?? REMINDER_CATEGORY_ID,
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
      } as Notifications.NotificationContentInput,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: snoozeFireAt,
        channelId: REMINDER_CHANNEL_ID,
      },
    });
  } catch (err) {
    console.warn("[reminders scheduler] Failed scheduling snooze:", err);
  }
}

/**
 * Self-healing reconciliation: runs on app start and foreground resume.
 */
export async function reconcile(): Promise<{
  removedPast: number;
  reconciled: number;
  prunedOrphans: number;
}> {
  const now = Date.now();
  const records = await loadAll();

  let removedPast = 0;
  let reconciled = 0;
  let prunedOrphans = 0;

  const validRecordMap = new Map<string, ReminderRecord>();

  for (const record of records) {
    // Weekly reminders repeat forever, so their first occurrence being in the
    // past does not make them stale — only one-off reminders expire.
    const isWeekly = record.repeats === "weekly";
    if (!isWeekly && record.startsAt <= now) {
      await cancelReminders(record.eventId);
      removedPast++;
    } else {
      validRecordMap.set(record.eventId, record);
    }
  }

  let scheduledList: Notifications.NotificationRequest[] = [];
  try {
    scheduledList = await Notifications.getAllScheduledNotificationsAsync();
  } catch (e) {
    console.warn("[reminders reconcile] Could not fetch scheduled list:", e);
    return { removedPast, reconciled, prunedOrphans };
  }

  const scheduledIdSet = new Set(scheduledList.map((n) => n.identifier));

  // Build full set of expected deterministic IDs
  const expectedIdentifiers = new Set<string>();
  for (const record of validRecordMap.values()) {
    for (const offset of record.offsets) {
      expectedIdentifiers.add(notifId(record.eventId, offset));
    }
  }

  // Prune orphan reminder notifications
  const orphanIds = findOrphanNotificationIds(
    Array.from(scheduledIdSet),
    expectedIdentifiers,
  );

  for (const orphanId of orphanIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(orphanId);
      prunedOrphans++;
    } catch {}
  }

  // Restore missing future offsets within budget
  for (const record of validRecordMap.values()) {
    const isWeekly = record.repeats === "weekly";
    const validFutureOffsets = isWeekly
      ? [...new Set(record.offsets)].sort((a, b) => b - a)
      : filterValidOffsets(record.startsAt, record.offsets, now);
    for (const offset of validFutureOffsets) {
      const id = notifId(record.eventId, offset);
      if (!scheduledIdSet.has(id)) {
        // Reschedule missing notification
        const fireAt = record.startsAt - offset * 60_000;
        const { title, body } = buildCopy(record, offset);
        try {
          await Notifications.scheduleNotificationAsync({
            identifier: id,
            content: {
              title,
              body,
              data: {
                eventId: record.eventId,
                offset,
                url: record.url,
                startsAt: record.startsAt,
                title: record.title,
              },
              categoryIdentifier: record.categoryId ?? REMINDER_CATEGORY_ID,
              sound: "default",
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: buildReminderTrigger(fireAt, isWeekly ? "weekly" : "none"),
          });
          reconciled++;
        } catch {}
      }
    }
  }

  return { removedPast, reconciled, prunedOrphans };
}
