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
  createProgram: (data: FormData | any) => Promise<Program>;
  updateProgram: (id: string, data: FormData | any) => Promise<Program>;
  deleteProgram: (id: string) => Promise<boolean>;
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
          set({ loading: true, error: null });
        }

        try {
          const data = await programService.fetchPrograms();

          const sortedData = data.sort((a: Program, b: Program) => {
            if (a.title === "Monday Service") return -1;
            if (b.title === "Monday Service") return 1;
            return 0;
          });

          set({ programs: sortedData, error: null });
        } catch (error: any) {
          console.error("Failed to sync programs:", error);
          if (!hasData) {
            set({ error: error.message || "Failed to fetch programs" });
          }
        } finally {
          set({ loading: false, refreshing: false });
        }
      },

      createProgram: async (data: FormData | any) => {
        const newProgram = await programService.createProgram(data);
        const normalized = {
          ...newProgram,
          id: (newProgram as any).id || (newProgram as any)._id,
        };
        set((state) => ({
          programs: [normalized, ...state.programs],
        }));
        return normalized;
      },

      updateProgram: async (id: string, data: FormData | any) => {
        const updated = await programService.updateProgram(id, data);
        const normalized = {
          ...updated,
          id: (updated as any).id || (updated as any)._id || id,
        };
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === id || (p as any)._id === id ? normalized : p,
          ),
        }));
        return normalized;
      },

      deleteProgram: async (id: string) => {
        const success = await programService.deleteProgram(id);
        if (success) {
          set((state) => ({
            programs: state.programs.filter(
              (p) => p.id !== id && (p as any)._id !== id,
            ),
          }));
        }
        return success;
      },
    }),
    {
      name: "programs-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
