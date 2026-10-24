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
  recordDevotionRead: () => { streakUpdated: boolean; newStreak: number };
  checkStreak: () => void;
  isCompletedToday: () => boolean;
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

      recordDevotionRead: () => {
        const {
          currentStreak,
          bestStreak,
          lastActiveDate,
          activeDates,
          totalDevotionsCompleted,
        } = get();
        const today = getLocalDateString();
        const yesterday = getYesterdayDateString();

        // Already counted today
        if (lastActiveDate === today) {
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

        return { streakUpdated: true, newStreak };
      },
    }),
    {
      name: "fellowship-streak-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
