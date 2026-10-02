import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SignupStep = "signup-step-1" | "otp-verify" | "signup-step-2";

interface SignupState {
  step: SignupStep | null;
  fullName: string;
  phoneNumber: string;
  password: string;
  verificationToken?: string | null;
  start: (data: {
    fullName: string;
    phoneNumber: string;
    password: string;
    verificationToken?: string | null;
  }) => void;
  setVerificationToken: (token: string) => void;
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
      verificationToken: null,
      start: (data) =>
        set({
          ...data,
          step: "otp-verify",
        }),
      setVerificationToken: (verificationToken) => set({ verificationToken }),
      setStep: (step) => set({ step }),
      clear: () =>
        set({
          step: null,
          fullName: "",
          phoneNumber: "",
          password: "",
          verificationToken: null,
        }),
    }),

    {
      name: "signup-storage",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
