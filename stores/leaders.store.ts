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
  createLeader: (data: FormData | any) => Promise<Leader>;
  updateLeader: (id: string, data: FormData | any) => Promise<Leader>;
  deleteLeader: (id: string) => Promise<boolean>;
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

      createLeader: async (data: FormData | any) => {
        const newLeader = await leaderService.createLeader(data);
        const normalized = {
          ...newLeader,
          id: (newLeader as any).id || (newLeader as any)._id,
        };
        set((state) => ({
          leaders: [normalized, ...state.leaders],
        }));
        return normalized;
      },

      updateLeader: async (id: string, data: FormData | any) => {
        const updated = await leaderService.updateLeader(id, data);
        const normalized = {
          ...updated,
          id: (updated as any).id || (updated as any)._id || id,
        };
        set((state) => ({
          leaders: state.leaders.map((l) =>
            l.id === id || (l as any)._id === id ? normalized : l,
          ),
        }));
        return normalized;
      },

      deleteLeader: async (id: string) => {
        const success = await leaderService.deleteLeader(id);
        if (success) {
          set((state) => ({
            leaders: state.leaders.filter(
              (l) => l.id !== id && (l as any)._id !== id,
            ),
          }));
        }
        return success;
      },
    }),
    {
      name: "leaders-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
