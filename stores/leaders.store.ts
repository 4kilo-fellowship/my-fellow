import { leaderService } from "@/services/leaderService";
import { Leader } from "@/types/leader.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LeadersState {
  leaders: Leader[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadLeaders: (forceRefresh?: boolean) => Promise<void>;
  setLeaders: (leaders: Leader[]) => void;
}

export const useLeadersStore = create<LeadersState>()(
  persist(
    (set, get) => ({
      leaders: [],
      loading: false,
      refreshing: false,
      error: null,

      setLeaders: (leaders) => set({ leaders }),

      loadLeaders: async (forceRefresh = false) => {
        const hasData = get().leaders.length > 0;

        if (forceRefresh) {
          set({ refreshing: true, error: null });
        } else if (!hasData) {
          set({ loading: true, error: null });
        }

        try {
          const data = await leaderService.fetchLeaders();
          set({ leaders: data, error: null });
        } catch (error: any) {
          console.error("Failed to sync leaders:", error);
          if (!hasData) {
            set({ error: error.message || "Failed to fetch leaders" });
          }
        } finally {
          set({ loading: false, refreshing: false });
        }
      },
    }),
    {
      name: "leaders-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
