import { AppNotification } from "@/types/notification.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface NotificationsState {
  notifications: AppNotification[];
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
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
        }));
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => set({ notifications: [] }),

      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

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
