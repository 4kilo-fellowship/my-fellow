// src/stores/events.store.ts
import { fetchEventByIdApi, fetchEventsApi } from "@/services/events.api";
import { EventDetail, EventSummary } from "@/types/events.types";
import { create } from "zustand";

type EventsState = {
  events: EventSummary[];
  selectedEvent: EventDetail | null;
  loading: boolean;
  error?: string | null;
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  clearSelected: () => void;
};

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await fetchEventsApi();
      set({ events, loading: false });
    } catch (err: any) {
      // try to pull message from axios error shapes
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to fetch events";
      set({ error: message, loading: false });
    }
  },

  fetchEventById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const selectedEvent = await fetchEventByIdApi(id);
      set({ selectedEvent, loading: false });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Failed to fetch event";
      set({ error: message, loading: false });
    }
  },

  clearSelected: () => set({ selectedEvent: null }),
}));
