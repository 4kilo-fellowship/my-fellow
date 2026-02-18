import { fetchTeams } from "@/services/teamService";
import { Team } from "@/types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TeamsState {
  teams: Team[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadTeams: (forceRefresh?: boolean) => Promise<void>;
  setTeams: (teams: Team[]) => void;
}

export const useTeamsStore = create<TeamsState>()(
  persist(
    (set, get) => ({
      teams: [],
      loading: false,
      refreshing: false,
      error: null,

      setTeams: (teams) => set({ teams }),

      loadTeams: async (forceRefresh = false) => {
        const hasData = get().teams.length > 0;

        // Show UI loaders only if necessary
        if (forceRefresh) {
          set({ refreshing: true, error: null });
        } else if (!hasData) {
          set({ loading: true, error: null });
        }

        try {
          // Always fetch fresh data to sync the cache,
          // but we use the result to update the store.
          // Passing 'true' to fetchTeams ensures it hits the API.
          const data = await fetchTeams(true);
          set({ teams: data, error: null });
        } catch (error: any) {
          console.error("Failed to sync teams:", error);
          if (!hasData) {
            set({ error: error.message || "Failed to fetch teams" });
          }
        } finally {
          set({ loading: false, refreshing: false });
        }
      },
    }),
    {
      name: "teams-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
