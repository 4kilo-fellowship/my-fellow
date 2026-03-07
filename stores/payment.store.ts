import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface GivingRecord {
  _id: string;
  userId: string;
  tx_ref: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentState {
  txRef: string | null;
  setTxRef: (ref: string | null) => void;
  myGivings: GivingRecord[];
  totalGivingsAmount: number;
  isLoadingGivings: boolean;
  fetchMyGivings: () => Promise<void>;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      txRef: null,
      setTxRef: (ref) => set({ txRef: ref }),
      myGivings: [],
      totalGivingsAmount: 0,
      isLoadingGivings: false,
      fetchMyGivings: async () => {
        set({ isLoadingGivings: true });
        try {
          const response = await api.get("/payments/my-givings");
          if (response.data.success) {
            const givings: GivingRecord[] = response.data.data || [];
            // Calculate total of successful givings
            const total = givings
              .filter((g) => g.status === "success" || g.status === "completed")
              .reduce((sum, g) => sum + (g.amount || 0), 0);

            set({ myGivings: givings, totalGivingsAmount: total });
          }
        } catch (error) {
          console.error("Failed to fetch givings", error);
        } finally {
          set({ isLoadingGivings: false });
        }
      },
    }),
    {
      name: "payment-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
