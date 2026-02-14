import { programService } from "@/services/programService";
import { Program } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ProgramsState {
  programs: Program[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadPrograms: (forceRefresh?: boolean) => Promise<void>;
  setPrograms: (programs: Program[]) => void;
}

export const useProgramsStore = create<ProgramsState>()(
  persist(
    (set, get) => ({
      programs: [],
      loading: false,
      refreshing: false,
      error: null,

      setPrograms: (programs) => set({ programs }),

      loadPrograms: async (forceRefresh = false) => {
        const hasData = get().programs.length > 0;

        if (forceRefresh) {
          set({ refreshing: true, error: null });
        } else if (!hasData) {
          // Only show loading indicator if we don't have cached data
          set({ loading: true, error: null });
        }

        try {
          const data = await programService.fetchPrograms();

          // Sort the data here to ensure consistency
          const sortedData = data.sort((a: Program, b: Program) => {
            if (a.title === "Monday Service") return -1;
            if (b.title === "Monday Service") return 1;
            return 0;
          });

          set({ programs: sortedData, error: null });
        } catch (error: any) {
          console.error("Failed to sync programs:", error);
          // If we don't have any data show error, otherwise keep showing cached data
          if (!hasData) {
            set({ error: error.message || "Failed to fetch programs" });
          }
        } finally {
          set({ loading: false, refreshing: false });
        }
      },
    }),
    {
      name: "programs-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
