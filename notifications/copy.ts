import { ReminderTarget } from "./types";

export function formatOffsetLabel(offsetMin: number): string {
  if (offsetMin === 0) return "At start";
  if (offsetMin < 60) return `${offsetMin} min before`;
  const hours = Math.floor(offsetMin / 60);
  if (hours === 24) return "1 day before";
  return `${hours} hour${hours > 1 ? "s" : ""} before`;
}

export function buildCopy(target: ReminderTarget, offsetMin: number) {
  const truncatedTitle =
    target.title.length > 40
      ? `${target.title.slice(0, 37)}...`
      : target.title;

  let body = "";
  if (offsetMin === 0) {
    body = "It's time. Tap to join.";
  } else if (offsetMin === 5) {
    body = "Starts in 5 min. Get ready!";
  } else if (offsetMin === 30) {
    const timeStr = new Date(target.startsAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    body = `Starts in 30 min · ${timeStr}`;
  } else {
    body = `Starting in ${formatOffsetLabel(offsetMin)}. Tap to view event.`;
  }

  return {
    title: truncatedTitle,
    body,
  };
}

export function buildConfirmationCopy(scheduledOffsets: number[]) {
  if (!scheduledOffsets || scheduledOffsets.length === 0) {
    return {
      title: "Reminder Notice",
      body: "This event is starting soon or is already underway.",
    };
  }

  const offsetLabels = scheduledOffsets.map(formatOffsetLabel).join(", ");
  return {
    title: "Reminder set 🔔",
    body: `We'll remind you ${offsetLabels}.`,
  };
}
