export interface ReminderTarget {
  eventId: string;
  title: string;
  startsAt: number; // UTC timestamp in milliseconds
  url: string; // Deep link URL (e.g. "/events/123")
  shortDescription?: string;
}

export interface ReminderRecord extends ReminderTarget {
  offsets: number[]; // Scheduled offsets in minutes (e.g. [30, 5, 0])
  createdAt: number;
  deferred?: boolean;
}

export type PermState = "granted" | "denied" | "blocked";
