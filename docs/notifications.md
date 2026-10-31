# Local Notifications Architecture (Expo SDK 58)

Offline-first, deterministic, multi-offset local reminder system for 4 Kilo Fellowship events and programs.

---

## 1. Architecture Overview

```
                      [ User Taps "Notify Me" ]
                                  │
                                  ▼
                    [ Check / Request Permission ]
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
           [ Permitted ]                    [ Denied / Blocked ]
                 │                                 │
                 ▼                                 ▼
       [ Schedule Reminders ]              [ Prompt Alert / Settings ]
         - Skip past offsets
         - Deterministic IDs: `rem_${eventId}_${offset}`
         - DATE triggers (Absolute Date)
         - Check 64-notification iOS budget
                 │
                 ├─────────────────────────────────┐
                 ▼                                 ▼
      [ Local Storage Save ]            [ Immediate Confirmation ]
     AsyncStorage `@my_fellow_reminders_v2`      (trigger: null banner)
                 │
                 ▼
       [ In-App Toast & State ]
        Button flips to "Reminder on"
```

### Module Structure

```
my-fellow/notifications/
├── types.ts                     # ReminderTarget, ReminderRecord, PermState
├── config.ts                    # Channel ("reminders"), Category ("reminder"), IDs, Actions
├── pure.ts                      # Pure logic: filterValidOffsets, calculateBudgetAssignments, findOrphanNotificationIds
├── copy.ts                      # Localized copy generator & offset label formatting
├── storage.ts                   # AsyncStorage persistence with pub-sub listeners
├── permissions.ts               # ensurePermission & openNotificationSettings
├── setup.ts                     # Foreground handler, Android channels, Notification categories, Background task
├── scheduler.ts                 # Offline scheduling, confirmation, cancellation, rescheduling, reconciliation
├── responses.ts                 # Tap deep-linking router push & background action handlers (Snooze, Mute)
├── useReminder.ts               # Component hook managing status, haptics, permission flows, and sheet state
├── useNotificationObserver.ts   # Root observer mounted in _layout.tsx (cold start, AppState active, reconciliation)
└── index.ts                     # Unified public barrel exports
```

---

## 2. Why & How It Works 100% Offline

1. **Zero Network Calls:** At tap time, fire time, snooze time, and dismissal time, zero network requests are made. Everything operates strictly through the device's native notification scheduler (`expo-notifications` backed by Android `AlarmManager` / iOS `UNUserNotificationCenter`).
2. **Absolute Date Triggers:** Triggers use `SchedulableTriggerInputTypes.DATE` with UTC target timestamps:
   ```ts
   trigger: {
     type: Notifications.SchedulableTriggerInputTypes.DATE,
     date: new Date(fireAt),
     channelId: "reminders",
   }
   ```
   This eliminates clock skew, timer drifting, and DST calculation issues associated with relative second delays.
3. **Persisted by the OS:**
   - On **Android**: `expo-notifications` registers `RECEIVE_BOOT_COMPLETED` and automatically restores scheduled alarms after device restarts.
   - On **iOS**: `UNUserNotificationCenter` natively persists pending notifications across reboots.
   - On app startup or foreground transition, our `reconcile()` routine purges orphaned notifications and tops up deferred reminders.

---

## 3. Deterministic Notification Identifiers

Each reminder scheduled by the system uses a strictly deterministic ID:

```ts
notifId(eventId, offsetMin) => `rem_${eventId}_${offsetMin}`
```

### Why Deterministic IDs Matter:
1. **True Idempotence:** Tapping "Notify me" repeatedly or rapidly never schedules duplicate notifications. The OS replaces the existing notification with the same ID.
2. **Targeted Offsets:** If a user unchecks "5 min before" in the `ReminderSheet`, the system calls `cancelScheduledNotificationAsync('rem_123_5')` without disturbing the "30 min before" or "At start" reminders.
3. **No ID Mapping Tables Required:** We don't need to generate and map random UUIDs for every schedule. The event ID and offset minute define the identity.

---

## 4. Action Buttons & Category Configuration

Reminders register the `"reminder"` category with two quick action buttons:

| Action | Identifier | Behavior |
| :--- | :--- | :--- |
| **Open** | `default` | Opens the app and deep-links to `data.url` (e.g. `events/64a...`). |
| **Snooze 10 min** | `snooze_10` | Schedules a one-off notification 10 minutes into the future without foregrounding the app. |
| **Turn off** | `mute` | Cancels all remaining reminders for this event without foregrounding the app (`isDestructive: true`). |

### Platform Differences (Android vs iOS):
- **Android:** Background actions invoke the background task registered via `TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK)` even when the app is killed or backgrounded.
- **iOS:** Background execution for terminated apps is restricted by iOS. If action taps require immediate guaranteed UI transition, `opensAppToForeground: true` is configured where appropriate.
- **Category ID convention:** Expo SDK specifies that Notification Category IDs should **not** contain hyphens or colons (hence `REMINDER_CATEGORY_ID = "reminder"`).

---

## 5. iOS 64-Notification Budget & Reconciliation

iOS enforces a hard limit of **64 scheduled local notifications** per app. Exceeding this limit causes iOS to silently drop notifications.

### Budget Management:
- We cap pending active reminders at `MAX_PENDING = 60` to leave headroom for one-off system alerts.
- When reminders are scheduled, `calculateBudgetAssignments` verifies the current count. Any notifications exceeding the limit are saved in storage as `deferred: true`.
- During `reconcile()` (run on app startup and whenever the app returns to the foreground via `AppState`):
  1. Past events are pruned from local storage.
  2. Orphaned notification IDs (found in OS schedule but deleted from storage) are cancelled.
  3. Pending deferred reminders are promoted to active OS schedules as slots free up.

---

## 6. How to Add a New Reminder Target Type

To add reminders for a new feature (e.g., Daily Devotion, Fellowship Dues, Prayer Request):

1. **Construct a `ReminderTarget`:**
   ```ts
   const target: ReminderTarget = {
     eventId: `devotion_${devotion.id}`,
     title: devotion.title,
     startsAt: new Date(devotion.publishedAt).getTime(),
     url: `devotion/${devotion.id}`,
     shortDescription: devotion.verse,
   };
   ```

2. **Render the `<NotifyMeButton>`:**
   ```tsx
   import { NotifyMeButton } from "@/components";

   <NotifyMeButton target={target} size="md" variant="pill" />
   ```

3. **Or wire programmatically with `useReminder`:**
   ```tsx
   import { useReminder } from "@/notifications";

   const reminder = useReminder(target);
   // Access reminder.status ("active" | "default" | "loading" | "permission" | "unavailable")
   // Call reminder.enable(), reminder.disable(), reminder.openSheet()
   ```

---

## 7. How to Test Locally

### 1. Foreground Notification Banner
- Schedule a reminder for an event starting in 35 minutes.
- Tap "Notify me": You should immediately see the in-app success toast and the immediate local banner *"Reminder set 🔔. We'll remind you 30 min before, 5 min before, At start"*.

### 2. Background Delivery
- Send the app to the background (Home button / swipe up).
- Wait for the scheduled offset: The notification appears in the device system tray with high priority and sound.

### 3. Terminated / Killed State
- Force-quit the app from the app switcher.
- Wait for the scheduled offset: Notification still fires reliably.
- Tap the notification banner: The app cold-launches directly to the event deep link URL (`events/[id]`).

### 4. Device Reboot Test (Android)
- Schedule a reminder.
- Reboot the device.
- The notification fires at the scheduled time thanks to `RECEIVE_BOOT_COMPLETED`.

### 5. Offline Test
- Turn on Airplane Mode.
- Open the app, tap "Notify me" on an upcoming event.
- Everything succeeds immediately without error, schedules locally, and displays the confirmation banner.
