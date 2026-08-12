import { OtpPurpose } from "@/types";
import { create } from "zustand";

interface OtpState {
  phoneNumber: string | null;
  purpose: OtpPurpose | null;
  otpToken: string | null;
  password: string | null;
  setSession: (
    phoneNumber: string,
    purpose: OtpPurpose,
    password?: string,
  ) => void;
  setToken: (otpToken: string) => void;
  clear: () => void;
}

export const useOtpStore = create<OtpState>((set) => ({
  phoneNumber: null,
  purpose: null,
  otpToken: null,
  password: null,
  setSession: (phoneNumber, purpose, password) =>
    set({ phoneNumber, purpose, password: password ?? null }),
  setToken: (otpToken) => set({ otpToken }),
  clear: () =>
    set({ phoneNumber: null, purpose: null, otpToken: null, password: null }),
}));
