import { locationService } from "@/services/locationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LocationsState {
  locations: any[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadLocations: (forceRefresh?: boolean) => Promise<void>;
}

export const useLocationsStore = create<LocationsState>()(
  persist(
    (set, get) => ({
      locations: [],
      loading: false,
      refreshing: false,
      error: null,

      loadLocations: async (forceRefresh = false) => {
        const hasData = get().locations.length > 0;

        if (forceRefresh) {
          set({ refreshing: true, error: null });
        } else if (!hasData) {
          set({ loading: true, error: null });
        }

        try {
          const data = await locationService.fetchLocations();
          set({ locations: data, error: null });
        } catch (error: any) {
          console.error("Failed to sync locations:", error);
          if (!hasData) {
            set({ error: error.message || "Failed to fetch locations" });
          }
        } finally {
          set({ loading: false, refreshing: false });
        }
      },
    }),
    {
      name: "locations-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
