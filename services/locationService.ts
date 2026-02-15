import { fetchLocationsApi } from "./location.api";

export const locationService = {
  fetchLocations: async (): Promise<any[]> => {
    try {
      const locations = await fetchLocationsApi();
      return locations.map((loc: any) => ({
        ...loc,
        id: loc.id || loc._id || Math.random().toString(),
      }));
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  },
};
