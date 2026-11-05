import {
  fetchEventsApi,
  fetchEventByIdApi,
  registerForEventApi,
  unregisterFromEventApi,
  checkRegistrationStatusApi,
  createEventApi,
  updateEventApi,
  togglePublishEventApi,
  deleteEventApi,
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
  unregistering: boolean;
  registeredEvents: Record<string, boolean>;
  checkingRegistration: Record<string, boolean>;
  likedEvents: Record<string, boolean>;
  aiPostersHistory: { url: string; prompt: string; createdAt: string }[];
  pendingGeneratedPoster: string | null;
  error?: string | null;

  fetchEvents: (
    optionsOrSort?:
      | "asc"
      | "desc"
      | { sort?: "asc" | "desc"; scope?: string; status?: string },
  ) => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  registerForEvent: (data: EventRegistrationData) => Promise<void>;
  unregisterFromEvent: (data: { eventId: string }) => Promise<void>;
  checkRegistrationStatus: (eventId: string) => Promise<void>;
  toggleLikeEvent: (eventId: string) => void;
  createEvent: (data: FormData | any) => Promise<AppEvent | null>;
  updateEvent: (id: string, data: FormData | any) => Promise<AppEvent | null>;
  togglePublishEvent: (id: string, isPublished?: boolean) => Promise<AppEvent | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  setEventsList: (events: AppEvent[]) => void;
  setError: (error: string | null) => void;
  addAIPosterToHistory: (poster: { url: string; prompt: string }) => void;
  setPendingGeneratedPoster: (url: string | null) => void;
};

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      eventsList: [],
      currentEvent: null,
      loading: false,
      registering: false,
      unregistering: false,
      registeredEvents: {},
      checkingRegistration: {},
      likedEvents: {},
      aiPostersHistory: [],
      pendingGeneratedPoster: null,
      error: null,

      addAIPosterToHistory: (poster) => {
        set((state) => ({
          aiPostersHistory: [
            {
              ...poster,
              createdAt: new Date().toISOString(),
            },
            ...(state.aiPostersHistory || []).filter((p) => p.url !== poster.url),
          ].slice(0, 20),
        }));
      },

      setPendingGeneratedPoster: (url) => {
        set({ pendingGeneratedPoster: url });
      },

      toggleLikeEvent: (eventId: string) => {
        set((state) => ({
          likedEvents: {
            ...state.likedEvents,
            [eventId]: !state.likedEvents[eventId],
          },
        }));
      },

      fetchEvents: async (optionsOrSort = "asc") => {
        set({ loading: true, error: null });
        try {
          const response = await fetchEventsApi(optionsOrSort as any);
          if (response.success) {
            const isScopeAdmin =
              typeof optionsOrSort === "object" &&
              optionsOrSort?.scope === "admin";
            const data = response.data || [];
            const now = new Date();
            const filteredData = isScopeAdmin
              ? data
              : data.filter((e) => {
                  if (!e || e.isPublished === false) return false;
                  if (e.endDate) {
                    const end = new Date(e.endDate);
                    if (!isNaN(end.getTime()) && end < now) {
                      return false;
                    }
                  }
                  return true;
                });
            set({ eventsList: filteredData, loading: false });
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

      setEventsList: (events) => {
        const now = new Date();
        const upcomingOnly = (events || []).filter((e) => {
          if (!e || e.isPublished === false) return false;
          if (e.endDate) {
            const end = new Date(e.endDate);
            if (!isNaN(end.getTime()) && end < now) return false;
          }
          return true;
        });
        set({ eventsList: upcomingOnly });
      },

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

      unregisterFromEvent: async (data: { eventId: string }) => {
        set({ unregistering: true, error: null });
        try {
          const response = await unregisterFromEventApi(data);
          if (response.success) {
            set((state) => ({
              unregistering: false,
              registeredEvents: {
                ...state.registeredEvents,
                [data.eventId]: false,
              },
            }));
          } else {
            set({
              error: response.message || "Unregistration failed",
              unregistering: false,
            });
            throw new Error(response.message || "Unregistration failed");
          }
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong during unregistration.";
          set({ error: message, unregistering: false });
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

      createEvent: async (data: FormData | any) => {
        set({ loading: true, error: null });
        try {
          const res = await createEventApi(data);
          if (res.success && res.data) {
            const newEvent = res.data;
            set((state) => ({
              eventsList: [newEvent, ...state.eventsList],
              loading: false,
            }));
            return newEvent;
          }
          set({ loading: false, error: res.message || "Failed to create event" });
          return null;
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || "Error creating event";
          set({ loading: false, error: msg });
          return null;
        }
      },

      updateEvent: async (id: string, data: FormData | any) => {
        set({ loading: true, error: null });
        try {
          const res = await updateEventApi(id, data);
          if (res.success && res.data) {
            const updatedEvent = res.data;
            set((state) => ({
              eventsList: state.eventsList.map((e) =>
                (e._id === id || (e as any).id === id) ? updatedEvent : e
              ),
              currentEvent: updatedEvent,
              loading: false,
            }));
            return updatedEvent;
          }
          set({ loading: false, error: res.message || "Failed to update event" });
          return null;
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || "Error updating event";
          set({ loading: false, error: msg });
          return null;
        }
      },

      togglePublishEvent: async (id: string, isPublished?: boolean) => {
        set({ loading: true, error: null });
        try {
          const res = await togglePublishEventApi(id, isPublished);
          if (res.success && res.data) {
            const updatedEvent = res.data;
            set((state) => ({
              eventsList: state.eventsList.map((e) =>
                (e._id === id || (e as any).id === id) ? updatedEvent : e
              ),
              currentEvent: updatedEvent,
              loading: false,
            }));
            return updatedEvent;
          }
          set({ loading: false, error: res.message || "Failed to toggle event visibility" });
          return null;
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || "Error toggling event publish status";
          set({ loading: false, error: msg });
          return null;
        }
      },

      deleteEvent: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const res = await deleteEventApi(id);
          if (res.success) {
            set((state) => ({
              eventsList: state.eventsList.filter((e) => e._id !== id && (e as any).id !== id),
              loading: false,
            }));
            return true;
          }
          set({ loading: false, error: res.message || "Failed to delete event" });
          return false;
        } catch (err: any) {
          const msg = err?.response?.data?.message || err?.message || "Error deleting event";
          set({ loading: false, error: msg });
          return false;
        }
      },
    }),
    {
      name: "events-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        eventsList: (state.eventsList || []).filter((e) => {
          if (!e || e.isPublished === false) return false;
          if (e.endDate) {
            const end = new Date(e.endDate);
            if (!isNaN(end.getTime()) && end < new Date()) return false;
          }
          return true;
        }),
        registeredEvents: state.registeredEvents,
      }),
    },
  ),
);
