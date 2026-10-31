/**
 * Format date/timestamp into human-readable relative time string.
 * Supports ISO-8601 strings, UNIX ms timestamps, Date instances,
 * or already relative strings ("2h ago", "Just now").
 */
export function formatRelativeTime(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return "Just now";
  if (typeof dateInput === "string" && (dateInput.includes("ago") || dateInput.includes("now"))) {
    return dateInput;
  }

  const date =
    typeof dateInput === "string" || typeof dateInput === "number"
      ? new Date(dateInput)
      : dateInput;

  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  if (diffMs < 0) return "Just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}mo ago`;
  return `${Math.floor(diffDay / 365)}y ago`;
}
