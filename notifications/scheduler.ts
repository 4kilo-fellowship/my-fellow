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

/**
 * Schedules multi-offset local notifications for a given event target.
 */
export async function scheduleReminders(
  target: ReminderTarget,
  offsets: readonly number[] = DEFAULT_OFFSETS_MIN,
): Promise<number[]> {
  const now = Date.now();
  const validOffsets = filterValidOffsets(target.startsAt, offsets, now);

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
          categoryIdentifier: REMINDER_CATEGORY_ID,
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(fireAt),
          channelId: REMINDER_CHANNEL_ID,
        },
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
        categoryIdentifier: REMINDER_CATEGORY_ID,
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
): Promise<number[]> {
  await cancelReminders(target.eventId);
  return scheduleReminders(target, newOffsets);
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
        categoryIdentifier: REMINDER_CATEGORY_ID,
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
    if (record.startsAt <= now) {
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
    const validFutureOffsets = filterValidOffsets(record.startsAt, record.offsets, now);
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
              categoryIdentifier: REMINDER_CATEGORY_ID,
              sound: "default",
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(fireAt),
              channelId: REMINDER_CHANNEL_ID,
            },
          });
          reconciled++;
        } catch {}
      }
    }
  }

  return { removedPast, reconciled, prunedOrphans };
}
