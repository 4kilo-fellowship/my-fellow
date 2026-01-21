import api from "@/services/api";
import { create } from "zustand";

export type EventSummary = {
  id: string;
  title: string;
  shortDescription?: string;
  startDate?: string;
  image?: string;
};

export type EventDetail = EventSummary & {
  fullDescription?: string;
  endDate?: string;
  metadata?: Record<string, any>;
};

type EventsState = {
  events: EventSummary[];
  selectedEvent: EventDetail | null;
  loading: boolean;
  error?: string | null;
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  clearSelected: () => void;
};

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<EventSummary[]>("/events");
      set({ events: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch (err: any) {
      console.error("[events store] fetchEvents error", err);
      set({ error: err?.message ?? "Failed to fetch events", loading: false });
    }
  },
  fetchEventById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      console.log("[events store] fetching event by id", id);
      const res = await api.get<EventDetail>(`/events/${id}`);
      console.log("[events store] fetched event", res.data?.id ?? null);
      set({ selectedEvent: res.data, loading: false });
    } catch (err: any) {
      console.error("[events store] fetchEventById error", err);
      set({ error: err?.message ?? "Failed to fetch event", loading: false });
    }
  },
  clearSelected: () => set({ selectedEvent: null }),
}));
