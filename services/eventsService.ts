import { EventSummary } from "@/types/events.types";
import { fetchEventsApi } from "./events.api";

export const eventsService = {
  fetchEvents: async (): Promise<EventSummary[]> => {
    try {
      const events = await fetchEventsApi();
      return events.map((event: any) => ({
        ...event,
        id: event.id || event._id || "unknown",
      })) as EventSummary[];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },
};
