import { Devotion } from "@/types/devotion.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DevotionsStore {
  savedDevotions: Devotion[];
  saveDevotion: (devotion: Devotion) => void;
  unsaveDevotion: (id: string) => void;
  isDevotionSaved: (id: string) => boolean;
}

export const useDevotionsStore = create<DevotionsStore>()(
  persist(
    (set, get) => ({
      savedDevotions: [],
      saveDevotion: (devotion) => {
        const { savedDevotions } = get();
        if (!savedDevotions.find((d) => d._id === devotion._id)) {
          set({
            savedDevotions: [...savedDevotions, { ...devotion, isSaved: true }],
          });
        }
      },
      unsaveDevotion: (id) => {
        const { savedDevotions } = get();
        set({
          savedDevotions: savedDevotions.filter((d) => d._id !== id),
        });
      },
      isDevotionSaved: (id) => {
        const { savedDevotions } = get();
        return savedDevotions.some((d) => d._id === id);
      },
    }),
    {
      name: "devotions-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
