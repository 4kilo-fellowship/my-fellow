import { registerForEventApi } from "@/services/events.api";
import { EventRegistrationData } from "@/types/events.types";
import { create } from "zustand";

type EventsState = {
  registering: boolean;
  error?: string | null;
  registerForEvent: (data: EventRegistrationData) => Promise<void>;
  setError: (error: string | null) => void;
};

export const useEventsStore = create<EventsState>((set, get) => ({
  registering: false,
  error: null,

  registerForEvent: async (data: EventRegistrationData) => {
    set({ registering: true, error: null });
    try {
      await registerForEventApi(data);
      set({ registering: false });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong.";
      set({ error: message, registering: false });
      throw err;
    }
  },

  setError: (error) => set({ error }),
}));
