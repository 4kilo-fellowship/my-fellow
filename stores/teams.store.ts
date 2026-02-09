import { fetchTeams } from "@/services/teamService";
import { Team } from "@/types/types";
import { create } from "zustand";

interface TeamsState {
  teams: Team[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchTeams: (refresh?: boolean) => Promise<void>;
}

export const useTeamsStore = create<TeamsState>((set) => ({
  teams: [],
  loading: false,
  refreshing: false,
  error: null,

  fetchTeams: async (refresh = false) => {
    if (refresh) {
      set({ refreshing: true, error: null });
    } else {
      set({ loading: true, error: null });
    }

    try {
      const data = await fetchTeams(refresh);
      set({ teams: data });
    } catch (error: any) {
      console.error("Failed to fetch teams:", error);
      set({ error: error.message || "Failed to fetch teams" });
    } finally {
      if (refresh) {
        set({ refreshing: false });
      } else {
        set({ loading: false });
      }
    }
  },
}));
