import { devotionsService } from "@/services/devotionsService";
import { Devotion } from "@/types/devotion.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DevotionsStore {
  devotionsList: Devotion[];
  savedDevotions: Devotion[];
  readDevotions: string[];
  cachedDevotions: Record<string, Devotion>;
  setDevotionsList: (devotions: Devotion[]) => void;
  saveDevotion: (devotion: Devotion) => void;
  unsaveDevotion: (id: string) => void;
  isDevotionSaved: (id: string) => boolean;
  markAsRead: (id: string) => void;
  isDevotionRead: (id: string) => boolean;
  cacheDevotion: (devotion: Devotion) => void;
  getCachedDevotion: (id: string) => Devotion | undefined;
  createDevotion: (data: FormData | any) => Promise<Devotion>;
  updateDevotion: (id: string, data: FormData | any) => Promise<Devotion>;
  deleteDevotion: (id: string) => Promise<boolean>;
}

export const useDevotionsStore = create<DevotionsStore>()(
  persist(
    (set, get) => ({
      devotionsList: [],
      savedDevotions: [],
      readDevotions: [],
      cachedDevotions: {},
      setDevotionsList: (devotions) => set({ devotionsList: devotions }),
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
      markAsRead: (id) => {
        const { readDevotions } = get();
        if (!readDevotions.includes(id)) {
          set({
            readDevotions: [...readDevotions, id],
          });
        }
      },
      isDevotionRead: (id) => {
        const { readDevotions } = get();
        return readDevotions.includes(id);
      },
      cacheDevotion: (devotion) => {
        set((state) => ({
          cachedDevotions: {
            ...state.cachedDevotions,
            [devotion._id]: devotion,
          },
        }));
      },
      getCachedDevotion: (id) => {
        return get().cachedDevotions[id];
      },

      createDevotion: async (data: FormData | any) => {
        const newDevotion = await devotionsService.createDevotion(data);
        set((state) => ({
          devotionsList: [newDevotion, ...state.devotionsList],
        }));
        return newDevotion;
      },

      updateDevotion: async (id: string, data: FormData | any) => {
        const updated = await devotionsService.updateDevotion(id, data);
        set((state) => ({
          devotionsList: state.devotionsList.map((d) =>
            d._id === id ? updated : d,
          ),
          cachedDevotions: {
            ...state.cachedDevotions,
            [id]: updated,
          },
        }));
        return updated;
      },

      deleteDevotion: async (id: string) => {
        const success = await devotionsService.deleteDevotion(id);
        if (success) {
          set((state) => ({
            devotionsList: state.devotionsList.filter((d) => d._id !== id),
            savedDevotions: state.savedDevotions.filter((d) => d._id !== id),
          }));
        }
        return success;
      },
    }),
    {
      name: "devotions-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedDevotions: state.savedDevotions,
        readDevotions: state.readDevotions,
      }),
    },
  ),
);
