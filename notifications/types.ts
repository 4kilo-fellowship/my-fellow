export interface ReminderTarget {
  eventId: string;
  title: string;
  startsAt: number; // UTC timestamp in milliseconds
  url: string; // Deep link URL (e.g. "/events/123")
  shortDescription?: string;
  /** Optional notification category (controls the action buttons). */
  categoryId?: string;
}

export interface ReminderRecord extends ReminderTarget {
  offsets: number[]; // Scheduled offsets in minutes (e.g. [30, 5, 0])
  createdAt: number;
  deferred?: boolean;
  /** "weekly" keeps the reminder repeating every week at the same local time. */
  repeats?: "none" | "weekly";
}

export type PermState = "granted" | "denied" | "blocked";
