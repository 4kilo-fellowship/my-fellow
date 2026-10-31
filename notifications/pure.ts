import { DEFAULT_OFFSETS_MIN, ID_PREFIX, MAX_PENDING } from "./config";

/**
 * Pure helper: filters and sorts offsets so only future triggers are scheduled.
 * Minimum threshold is now + 5000ms.
 */
export function filterValidOffsets(
  startsAt: number,
  offsets: readonly number[] = DEFAULT_OFFSETS_MIN,
  now: number = Date.now(),
): number[] {
  const uniqueOffsets = [...new Set(offsets)].sort((a, b) => b - a);
  return uniqueOffsets.filter((offset) => {
    const fireAt = startsAt - offset * 60_000;
    return fireAt > now + 5_000;
  });
}

/**
 * Pure helper: calculates how many notifications can be scheduled within the budget limit.
 */
export function calculateBudgetAssignments(
  currentScheduledCount: number,
  requestedCount: number,
  maxPending: number = MAX_PENDING,
): { allowCount: number; deferredCount: number } {
  const availableSlots = Math.max(0, maxPending - currentScheduledCount);
  const allowCount = Math.min(requestedCount, availableSlots);
  const deferredCount = requestedCount - allowCount;
  return { allowCount, deferredCount };
}

/**
 * Pure helper: finds scheduled notification identifiers starting with ID_PREFIX
 * that do not exist in the valid set of stored identifiers.
 */
export function findOrphanNotificationIds(
  scheduledNotificationIds: string[],
  validIdentifierSet: Set<string>,
): string[] {
  return scheduledNotificationIds.filter(
    (id) => id.startsWith(ID_PREFIX) && !validIdentifierSet.has(id),
  );
}
