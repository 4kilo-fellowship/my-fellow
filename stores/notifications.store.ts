import { socialApi } from "@/services/socialApi";
import { AppNotification } from "@/types/notification.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface NotificationsState {
  notifications: AppNotification[];
  serverUnreadCount: number | null;
  /** IDs of events / products the user has already been notified about */
  seenEventIds: string[];
  seenProductIds: string[];
  seenDevotionIds: string[];
  lastCheckedAt: string | null;

  addNotification: (notification: AppNotification) => void;
  addNotifications: (notifications: AppNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
  setServerUnreadCount: (count: number) => void;
  syncServerUnreadCount: () => Promise<void>;

  /** Track which items have been notified */
  addSeenEventIds: (ids: string[]) => void;
  addSeenProductIds: (ids: string[]) => void;
  addSeenDevotionIds: (ids: string[]) => void;
  setLastCheckedAt: (date: string) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      serverUnreadCount: null,
      seenEventIds: [],
      seenProductIds: [],
      seenDevotionIds: [],
      lastCheckedAt: null,

      addNotification: (notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      addNotifications: (newNotifications) => {
        if (newNotifications.length === 0) return;
        set((state) => ({
          notifications: [...newNotifications, ...state.notifications],
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
          serverUnreadCount:
            state.serverUnreadCount !== null
              ? Math.max(0, state.serverUnreadCount - 1)
              : null,
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
          serverUnreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => set({ notifications: [], serverUnreadCount: 0 }),

      getUnreadCount: () =>
        get().serverUnreadCount ??
        get().notifications.filter((n) => !n.read).length,

      setServerUnreadCount: (count) => set({ serverUnreadCount: count }),

      syncServerUnreadCount: async () => {
        try {
          const res = await socialApi.getUnreadNotificationsCount();
          if (res && typeof res.count === "number") {
            set({ serverUnreadCount: res.count });
          }
        } catch {
          // Keep offline state
        }
      },

      addSeenEventIds: (ids) => {
        set((state) => ({
          seenEventIds: [...new Set([...state.seenEventIds, ...ids])],
        }));
      },

      addSeenProductIds: (ids) => {
        set((state) => ({
          seenProductIds: [...new Set([...state.seenProductIds, ...ids])],
        }));
      },

      addSeenDevotionIds: (ids) => {
        set((state) => ({
          seenDevotionIds: [...new Set([...state.seenDevotionIds, ...ids])],
        }));
      },

      setLastCheckedAt: (date) => set({ lastCheckedAt: date }),
    }),
    {
      name: "notifications-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50), // Keep latest 50
        seenEventIds: state.seenEventIds,
        seenProductIds: state.seenProductIds,
        seenDevotionIds: state.seenDevotionIds,
        lastCheckedAt: state.lastCheckedAt,
      }),
    },
  ),
);
