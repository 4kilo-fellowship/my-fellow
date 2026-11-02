import { socialApi } from "@/services/socialApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  activeDates: string[]; // YYYY-MM-DD of recorded devotions/prayers
  totalDevotionsCompleted: number;

  // Actions
  recordDevotionRead: () => Promise<{ streakUpdated: boolean; newStreak: number }>;
  checkInStreak: () => Promise<{ current: number; longest: number; checkedInToday: boolean }>;
  checkStreak: () => void;
  isCompletedToday: () => boolean;
  syncServerStreak: () => Promise<void>;
  setServerStreak: (data: {
    currentStreak?: number;
    current?: number;
    bestStreak?: number;
    longest?: number;
    lastActiveDate?: string | null;
    lastLocalDate?: string | null;
    activeDates?: string[];
    totalDevotionsCompleted?: number;
  }) => void;
}

const getLocalDateString = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 1, // Start with 1 to encourage user on first launch
      bestStreak: 1,
      lastActiveDate: null,
      activeDates: [],
      totalDevotionsCompleted: 0,

      isCompletedToday: () => {
        const { lastActiveDate } = get();
        return lastActiveDate === getLocalDateString();
      },

      checkStreak: () => {
        const { lastActiveDate, currentStreak } = get();
        if (!lastActiveDate) return;

        const today = getLocalDateString();
        const yesterday = getYesterdayDateString();

        // If last active was neither today nor yesterday, the streak lapsed
        if (lastActiveDate !== today && lastActiveDate !== yesterday) {
          if (currentStreak > 0) {
            set({ currentStreak: 0 });
          }
        }
      },

      recordDevotionRead: async () => {
        const {
          currentStreak,
          bestStreak,
          lastActiveDate,
          activeDates,
          totalDevotionsCompleted,
        } = get();
        const today = getLocalDateString();
        const yesterday = getYesterdayDateString();

        // Already counted today locally
        if (lastActiveDate === today) {
          // Still ensure server is synced asynchronously
          socialApi.checkInStreak().catch(() => {});
          return { streakUpdated: false, newStreak: currentStreak };
        }

        let newStreak = 1;
        if (lastActiveDate === yesterday) {
          newStreak = currentStreak + 1;
        } else {
          newStreak = 1;
        }

        const newBestStreak = Math.max(bestStreak, newStreak);
        const updatedDates = activeDates.includes(today)
          ? activeDates
          : [...activeDates.slice(-60), today];

        set({
          currentStreak: newStreak,
          bestStreak: newBestStreak,
          lastActiveDate: today,
          activeDates: updatedDates,
          totalDevotionsCompleted: totalDevotionsCompleted + 1,
        });

        // Sync with backend API
        try {
          const serverResult = await socialApi.checkInStreak();
          if (serverResult) {
            get().setServerStreak(serverResult);
            return {
              streakUpdated: true,
              newStreak: serverResult.currentStreak ?? serverResult.current ?? newStreak,
            };
          }
        } catch {
          // Server offline or unavailable: keep local optimistic progress
        }

        return { streakUpdated: true, newStreak };
      },

      checkInStreak: async () => {
        try {
          const serverResult = await socialApi.checkInStreak();
          if (serverResult) {
            get().setServerStreak(serverResult);
            return {
              current: serverResult.currentStreak ?? serverResult.current ?? 1,
              longest: serverResult.bestStreak ?? serverResult.longest ?? 1,
              checkedInToday: true,
            };
          }
        } catch {
          // Fallback to local checkin
          const res = await get().recordDevotionRead();
          return {
            current: res.newStreak,
            longest: get().bestStreak,
            checkedInToday: true,
          };
        }
        return {
          current: get().currentStreak,
          longest: get().bestStreak,
          checkedInToday: get().isCompletedToday(),
        };
      },

      setServerStreak: (data) => {
        const current = data.currentStreak ?? data.current;
        const longest = data.bestStreak ?? data.longest;
        const lastDate = data.lastActiveDate ?? data.lastLocalDate;

        set((state) => {
          const resolvedCurrent = typeof current === "number" ? current : state.currentStreak;
          const resolvedBest = typeof longest === "number" ? Math.max(state.bestStreak, longest) : state.bestStreak;
          const resolvedLastDate = lastDate ?? state.lastActiveDate;
          const resolvedDates = Array.isArray(data.activeDates) && data.activeDates.length > 0
            ? data.activeDates
            : resolvedLastDate && !state.activeDates.includes(resolvedLastDate)
              ? [...state.activeDates.slice(-60), resolvedLastDate]
              : state.activeDates;

          return {
            currentStreak: resolvedCurrent,
            bestStreak: resolvedBest,
            lastActiveDate: resolvedLastDate,
            activeDates: resolvedDates,
            totalDevotionsCompleted: data.totalDevotionsCompleted ?? state.totalDevotionsCompleted,
          };
        });
      },

      syncServerStreak: async () => {
        try {
          const data = await socialApi.getStreakMe();
          if (data) {
            get().setServerStreak(data);
          }
        } catch {
          // Keep offline state
        }
      },
    }),
    {
      name: "fellowship-streak-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
