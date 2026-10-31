/// <reference types="bun-types" />
import { describe, expect, it } from "bun:test";
import {
  calculateBudgetAssignments,
  filterValidOffsets,
  findOrphanNotificationIds,
} from "../notifications/pure";
import {
  formatOffsetLabel,
  buildCopy,
  buildConfirmationCopy,
} from "../notifications/copy";
import { notifId, snoozeNotifId } from "../notifications/config";
import { ReminderTarget } from "../notifications/types";

describe("Notifications Pure Logic Tests", () => {
  describe("filterValidOffsets", () => {
    it("filters out offsets whose fire time is in the past or within 5 seconds", () => {
      const now = 1_000_000_000_000;
      // Event starts in 20 minutes (20 * 60 * 1000 = 1,200,000 ms)
      const startsAt = now + 20 * 60_000;

      // Offsets: 30 min before (fire: now - 10 min, past -> skip)
      // 5 min before (fire: now + 15 min, future -> keep)
      // 0 min before (fire: now + 20 min, future -> keep)
      const result = filterValidOffsets(startsAt, [30, 5, 0], now);
      expect(result).toEqual([5, 0]);
    });

    it("keeps all offsets when event is far in the future", () => {
      const now = 1_000_000_000_000;
      // Event starts in 2 hours
      const startsAt = now + 120 * 60_000;

      const result = filterValidOffsets(startsAt, [30, 5, 0], now);
      expect(result).toEqual([30, 5, 0]);
    });

    it("returns empty array if event has already started or starts within 5 seconds", () => {
      const now = 1_000_000_000_000;
      // Event starts in 4 seconds
      const startsAt = now + 4_000;

      const result = filterValidOffsets(startsAt, [30, 5, 0], now);
      expect(result).toEqual([]);
    });

    it("deduplicates and sorts offsets descending", () => {
      const now = 1_000_000_000_000;
      const startsAt = now + 120 * 60_000;

      const result = filterValidOffsets(startsAt, [5, 30, 5, 0, 30], now);
      expect(result).toEqual([30, 5, 0]);
    });
  });

  describe("calculateBudgetAssignments", () => {
    it("allocates all requested slots when under budget", () => {
      const { allowCount, deferredCount } = calculateBudgetAssignments(
        10,
        3,
        64,
      );
      expect(allowCount).toBe(3);
      expect(deferredCount).toBe(0);
    });

    it("caps allocation at budget limit and defers the remainder", () => {
      const { allowCount, deferredCount } = calculateBudgetAssignments(
        62,
        3,
        64,
      );
      expect(allowCount).toBe(2);
      expect(deferredCount).toBe(1);
    });

    it("defers all requested notifications if already at or above budget", () => {
      const { allowCount, deferredCount } = calculateBudgetAssignments(
        64,
        3,
        64,
      );
      expect(allowCount).toBe(0);
      expect(deferredCount).toBe(3);
    });
  });

  describe("findOrphanNotificationIds", () => {
    it("identifies scheduled reminder notifications that are no longer in storage", () => {
      const scheduledIds = [
        "rem_event1_30",
        "rem_event1_5",
        "rem_event2_30", // orphaned
        "custom_notif_99", // not a reminder, should be ignored
      ];
      const validSet = new Set(["rem_event1_30", "rem_event1_5"]);

      const orphans = findOrphanNotificationIds(scheduledIds, validSet);
      expect(orphans).toEqual(["rem_event2_30"]);
    });
  });

  describe("Deterministic IDs", () => {
    it("generates deterministic reminder IDs", () => {
      expect(notifId("event-123", 30)).toBe("rem_event-123_30");
      expect(notifId("event-123", 0)).toBe("rem_event-123_0");
    });

    it("generates deterministic snooze IDs", () => {
      expect(snoozeNotifId("event-123")).toMatch(/^rem_event-123_snooze_\d+$/);
    });
  });

  describe("Copy Formatting", () => {
    const target: ReminderTarget = {
      eventId: "evt-1",
      title: "Weekly Fellowship Service",
      startsAt: 1_700_000_000_000,
      url: "/events/evt-1",
    };

    it("formats offset labels correctly", () => {
      expect(formatOffsetLabel(0)).toBe("At start");
      expect(formatOffsetLabel(5)).toBe("5 min before");
      expect(formatOffsetLabel(30)).toBe("30 min before");
      expect(formatOffsetLabel(60)).toBe("1 hour before");
      expect(formatOffsetLabel(120)).toBe("2 hours before");
      expect(formatOffsetLabel(1440)).toBe("1 day before");
    });

    it("builds appropriate copy for different offsets", () => {
      const atStartCopy = buildCopy(target, 0);
      expect(atStartCopy.body).toBe("It's time. Tap to join.");

      const fiveMinCopy = buildCopy(target, 5);
      expect(fiveMinCopy.body).toBe("Starts in 5 min. Get ready!");

      const thirtyMinCopy = buildCopy(target, 30);
      expect(thirtyMinCopy.body).toContain("Starts in 30 min");
    });

    it("truncates long titles cleanly in copy", () => {
      const longTitleTarget: ReminderTarget = {
        eventId: "evt-2",
        title: "A Very Long Fellowship Event Title That Definitely Exceeds Forty Characters",
        startsAt: 1_700_000_000_000,
        url: "/events/evt-2",
      };
      const copy = buildCopy(longTitleTarget, 0);
      expect(copy.title.endsWith("...")).toBe(true);
      expect(copy.title.length).toBeLessThanOrEqual(40);
    });

    it("builds confirmation copy listing scheduled offsets", () => {
      const conf = buildConfirmationCopy([30, 5, 0]);
      expect(conf.title).toBe("Reminder set 🔔");
      expect(conf.body).toContain("30 min before, 5 min before, At start");
    });
  });
});
