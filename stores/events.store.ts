import {
  checkRegistrationStatusApi,
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
  registeredEvents: Record<string, boolean>;
  checkingRegistration: Record<string, boolean>;
  error?: string | null;

  fetchEvents: (sort?: "asc" | "desc") => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  registerForEvent: (data: EventRegistrationData) => Promise<void>;
  checkRegistrationStatus: (eventId: string) => Promise<void>;
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
      registeredEvents: {},
      checkingRegistration: {},
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
            set((state) => ({
              registering: false,
              registeredEvents: {
                ...state.registeredEvents,
                [data.eventId]: true,
              },
            }));
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

      checkRegistrationStatus: async (eventId: string) => {
        set((state) => ({
          checkingRegistration: {
            ...state.checkingRegistration,
            [eventId]: true,
          },
        }));
        try {
          const response = await checkRegistrationStatusApi(eventId);
          if (response.success) {
            set((state) => ({
              registeredEvents: {
                ...state.registeredEvents,
                [eventId]: response.isRegistered,
              },
              checkingRegistration: {
                ...state.checkingRegistration,
                [eventId]: false,
              },
            }));
          } else {
            set((state) => ({
              checkingRegistration: {
                ...state.checkingRegistration,
                [eventId]: false,
              },
            }));
          }
        } catch {
          set((state) => ({
            checkingRegistration: {
              ...state.checkingRegistration,
              [eventId]: false,
            },
          }));
        }
      },

      setError: (error) => set({ error }),
    }),
    {
      name: "events-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        eventsList: state.eventsList,
        registeredEvents: state.registeredEvents,
      }),
    },
  ),
);
