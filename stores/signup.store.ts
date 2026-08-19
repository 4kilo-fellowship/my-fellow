import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SignupStep = "signup-step-1" | "signup-step-2";

interface SignupState {
  step: SignupStep | null;
  fullName: string;
  phoneNumber: string;
  password: string;
  start: (data: {
    fullName: string;
    phoneNumber: string;
    password: string;
  }) => void;
  setStep: (step: SignupStep) => void;
  clear: () => void;
}

const secureStorage = {
  getItem: async (name: string) =>
    (await SecureStore.getItemAsync(name)) ?? null,
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useSignupStore = create<SignupState>()(
  persist(
    (set) => ({
      step: null,
      fullName: "",
      phoneNumber: "",
      password: "",
      start: (data) => set({ ...data, step: "signup-step-2" }),
      setStep: (step) => set({ step }),
      clear: () =>
        set({
          step: null,
          fullName: "",
          phoneNumber: "",
          password: "",
        }),
    }),
    {
      name: "signup-storage",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
