import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PaymentState {
  txRef: string | null;
  setTxRef: (ref: string | null) => void;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      txRef: null,
      setTxRef: (ref) => set({ txRef: ref }),
    }),
    {
      name: "payment-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
