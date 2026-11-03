import {
  createTeamApi,
  deleteTeamApi,
  fetchTeams,
  updateTeamApi,
} from "@/services/teamService";
import { Team } from "@/types";
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
  createTeam: (data: FormData | any) => Promise<Team>;
  updateTeam: (id: string, data: FormData | any) => Promise<Team>;
  deleteTeam: (id: string) => Promise<boolean>;
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

        if (forceRefresh) {
          set({ refreshing: true, error: null });
        } else if (!hasData) {
          set({ loading: true, error: null });
        }

        try {
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

      createTeam: async (data: FormData | any) => {
        const newTeam = await createTeamApi(data);
        const normalized = {
          ...newTeam,
          id: newTeam.id || newTeam._id,
        };
        set((state) => ({
          teams: [normalized, ...state.teams],
        }));
        return normalized;
      },

      updateTeam: async (id: string, data: FormData | any) => {
        const updated = await updateTeamApi(id, data);
        const normalized = {
          ...updated,
          id: updated.id || updated._id || id,
        };
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === id || t._id === id ? normalized : t,
          ),
        }));
        return normalized;
      },

      deleteTeam: async (id: string) => {
        const success = await deleteTeamApi(id);
        if (success) {
          set((state) => ({
            teams: state.teams.filter((t) => t.id !== id && t._id !== id),
          }));
        }
        return success;
      },
    }),
    {
      name: "teams-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
