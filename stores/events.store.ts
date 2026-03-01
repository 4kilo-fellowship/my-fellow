import {
  fetchEventByIdApi,
  fetchEventsApi,
  registerForEventApi,
} from "@/services/events.api";
import { AppEvent, EventRegistrationData } from "@/types/events.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type EventsState = {
  eventsList: AppEvent[];
  currentEvent: AppEvent | null;
  loading: boolean;
  registering: boolean;
  error?: string | null;

  fetchEvents: (sort?: "asc" | "desc") => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  registerForEvent: (data: EventRegistrationData) => Promise<void>;
  setEventsList: (events: AppEvent[]) => void;
  setError: (error: string | null) => void;
};

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      eventsList: [],
      currentEvent: null,
      loading: false,
      registering: false,
      error: null,

      fetchEvents: async (sort = "asc") => {
        set({ loading: true, error: null });
        try {
          const response = await fetchEventsApi(sort);
          if (response.success) {
            set({ eventsList: response.data, loading: false });
          } else {
            set({
              error: response.message || "Failed to fetch events",
              loading: false,
            });
          }
        } catch (err: any) {
          set({
            error: err?.message || "Something went wrong fetching events.",
            loading: false,
          });
        }
      },

      fetchEventById: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await fetchEventByIdApi(id);
          if (response.success) {
            set({ currentEvent: response.data, loading: false });
          } else {
            set({
              error: response.message || "Failed to fetch event details",
              loading: false,
            });
          }
        } catch (err: any) {
          set({
            error:
              err?.message || "Something went wrong fetching event details.",
            loading: false,
          });
        }
      },

      setEventsList: (events) => set({ eventsList: events }),

      registerForEvent: async (data: EventRegistrationData) => {
        set({ registering: true, error: null });
        try {
          const response = await registerForEventApi(data);
          if (response.success) {
            set({ registering: false });
          } else {
            set({
              error: response.message || "Registration failed",
              registering: false,
            });
            throw new Error(response.message || "Registration failed");
          }
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong during registration.";
          set({ error: message, registering: false });
          throw err;
        }
      },

      setError: (error) => set({ error }),
    }),
    {
      name: "events-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        eventsList: state.eventsList,
      }),
    },
  ),
);
