import api from "@/services/api";
import create from "zustand";

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
      set({ events: res.data, loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to fetch events", loading: false });
    }
  },
  fetchEventById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<EventDetail>(`/events/${id}`);
      set({ selectedEvent: res.data, loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to fetch event", loading: false });
    }
  },
  clearSelected: () => set({ selectedEvent: null }),
}));
