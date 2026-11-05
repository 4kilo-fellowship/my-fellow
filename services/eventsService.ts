import { EventDetail, EventSummary } from "@/types/events.types";
import { cache } from "@/utils/cache";
import { fetchEventByIdApi, fetchEventsApi, generatePosterApi } from "./events.api";

const CACHE_KEYS = {
  EVENTS_LIST: "events_list",
  EVENT_DETAIL: (id: string) => `event_detail_${id}`,
};

export const isEventUpcoming = (event: any): boolean => {
  if (!event) return false;
  if (event.isPublished === false) return false;
  if (event.endDate) {
    const end = new Date(event.endDate);
    if (!isNaN(end.getTime()) && end < new Date()) {
      return false;
    }
  }
  return true;
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

      // Filter out outdated/expired and unpublished events
      const activeEvents = events.filter(isEventUpcoming);

      const mappedEvents = activeEvents.map((event: any) => ({
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
        return cachedEvents.filter(isEventUpcoming);
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

  generatePoster: async (
    formData: FormData,
  ): Promise<{ success: boolean; imageUrl: string; message?: string }> => {
    return generatePosterApi(formData);
  },
};
