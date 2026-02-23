import { registerForEventApi } from "@/services/events.api";
import { EventRegistrationData, EventSummary } from "@/types/events.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type EventsState = {
  eventsList: EventSummary[];
  registering: boolean;
  error?: string | null;
  setEventsList: (events: EventSummary[]) => void;
  registerForEvent: (data: EventRegistrationData) => Promise<void>;
  setError: (error: string | null) => void;
};

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      eventsList: [],
      registering: false,
      error: null,

      setEventsList: (events) => set({ eventsList: events }),

      registerForEvent: async (data: EventRegistrationData) => {
        set({ registering: true, error: null });
        try {
          await registerForEventApi(data);
          set({ registering: false });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong.";
          set({ error: message, registering: false });
          throw err;
        }
      },

      setError: (error) => set({ error }),
    }),
    {
      name: "events-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
