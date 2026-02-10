import { fetchEventByIdApi, registerForEventApi } from "@/services/events.api";
import { eventsService } from "@/services/eventsService";
import { EventDetail, EventSummary } from "@/types/events.types";
import { create } from "zustand";

type EventsState = {
  events: EventSummary[];
  selectedEvent: EventDetail | null;
  loading: boolean;
  loadingDetail: boolean;
  registering: boolean;
  error?: string | null;
  initialize: () => Promise<void>;
  fetchEvents: (forceRefresh?: boolean) => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  registerForEvent: (data: any) => Promise<void>;
  clearSelected: () => void;
};

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  selectedEvent: null,
  loading: true,
  loadingDetail: false,
  registering: false,
  error: null,

  initialize: async () => {
    const cached = await eventsService.getCachedEvents();
    if (cached && cached.length > 0) {
      set({ events: cached, loading: false });
    }
  },

  fetchEvents: async (forceRefresh = false) => {
    const currentEvents = get().events;

    // Only show loading if we don't have events yet
    if (currentEvents.length === 0) {
      set({ loading: true, error: null });
    }

    try {
      const events = await eventsService.fetchAndCacheEvents();
      set({ events, loading: false, error: null });
    } catch (err: any) {
      if (currentEvents.length === 0) {
        set({ error: "Something went wrong.", loading: false });
      } else {
        set({ loading: false });
      }
    }
  },

  fetchEventById: async (id: string) => {
    set({ loadingDetail: true, error: null });
    try {
      const selectedEvent = await fetchEventByIdApi(id);
      set({ selectedEvent, loadingDetail: false });
    } catch (err: any) {
      set({ error: "Something went wrong.", loadingDetail: false });
    }
  },

  registerForEvent: async (data: any) => {
    set({ registering: true, error: null });
    try {
      await registerForEventApi(data);
      set({ registering: false });
    } catch (err: any) {
      set({ error: "Something went wrong.", registering: false });
    }
  },

  clearSelected: () => set({ selectedEvent: null }),
}));
