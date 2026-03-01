import { EventDetail, EventSummary } from "@/types/events.types";
import { cache } from "@/utils/cache";
import { fetchEventByIdApi, fetchEventsApi } from "./events.api";

const CACHE_KEYS = {
  EVENTS_LIST: "events_list",
  EVENT_DETAIL: (id: string) => `event_detail_${id}`,
};

export const eventsService = {
  fetchEvents: async (): Promise<EventSummary[]> => {
    try {
      const response = await fetchEventsApi();
      const events = response.data || [];

      if (!Array.isArray(events)) {
        console.error("fetchEvents expected an array but got:", typeof events);
        return [];
      }

      const mappedEvents = events.map((event: any) => ({
        ...event,
        id: event.id || event._id || "unknown",
      })) as EventSummary[];

      await cache.set(CACHE_KEYS.EVENTS_LIST, mappedEvents);
      return mappedEvents;
    } catch (error) {
      console.error("Error fetching events, trying cache:", error);

      const cachedEvents = await cache.get<EventSummary[]>(
        CACHE_KEYS.EVENTS_LIST,
      );
      if (cachedEvents) {
        return cachedEvents;
      }

      throw error;
    }
  },

  fetchEventById: async (id: string): Promise<EventDetail> => {
    try {
      const response = await fetchEventByIdApi(id);
      const event = response.data;

      if (!event) {
        throw new Error("Event not found");
      }

      await cache.set(CACHE_KEYS.EVENT_DETAIL(id), event);
      return event;
    } catch (error) {
      console.error(`Error fetching event ${id}, trying cache:`, error);

      const cachedEvent = await cache.get<EventDetail>(
        CACHE_KEYS.EVENT_DETAIL(id),
      );
      if (cachedEvent) {
        return cachedEvent;
      }

      throw error;
    }
  },
};
