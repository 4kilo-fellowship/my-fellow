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
  createLocation: (data: FormData | any) => Promise<any>;
  updateLocation: (id: string, data: FormData | any) => Promise<any>;
  deleteLocation: (id: string) => Promise<boolean>;
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

      createLocation: async (data: FormData | any) => {
        const newLocation = await locationService.createLocation(data);
        const normalized = {
          ...newLocation,
          id: newLocation.id || newLocation._id,
        };
        set((state) => ({
          locations: [normalized, ...state.locations],
        }));
        return normalized;
      },

      updateLocation: async (id: string, data: FormData | any) => {
        const updated = await locationService.updateLocation(id, data);
        const normalized = {
          ...updated,
          id: updated.id || updated._id || id,
        };
        set((state) => ({
          locations: state.locations.map((loc) =>
            loc.id === id || loc._id === id ? normalized : loc,
          ),
        }));
        return normalized;
      },

      deleteLocation: async (id: string) => {
        const success = await locationService.deleteLocation(id);
        if (success) {
          set((state) => ({
            locations: state.locations.filter(
              (loc) => loc.id !== id && loc._id !== id,
            ),
          }));
        }
        return success;
      },
    }),
    {
      name: "locations-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
