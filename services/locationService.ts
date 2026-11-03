import {
  createLocationApi,
  deleteLocationApi,
  fetchLocationsApi,
  updateLocationApi,
} from "./location.api";

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

  createLocation: async (data: FormData | any): Promise<any> => {
    return await createLocationApi(data);
  },

  updateLocation: async (id: string, data: FormData | any): Promise<any> => {
    return await updateLocationApi(id, data);
  },

  deleteLocation: async (id: string): Promise<boolean> => {
    return await deleteLocationApi(id);
  },
};
