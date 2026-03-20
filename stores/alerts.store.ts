import {
  cancelNotification,
  scheduleNotification,
} from "@/utils/notificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY = "@alerts_storage_key";

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  time: string;
  enabled: boolean;
  repeats: "daily" | "weekly" | "none";
  remindBefore: number;
}

type AlertsState = {
  alerts: AlertItem[];
  loading: boolean;
  loadAlerts: () => Promise<void>;
  addAlert: (alert: Omit<AlertItem, "id" | "enabled">) => Promise<void>;
  updateAlert: (alert: AlertItem) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  toggleAlert: (id: string) => Promise<void>;
};

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  loading: true,

  loadAlerts: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const alerts: AlertItem[] = JSON.parse(stored);
        set({ alerts, loading: false });
        for (const alert of alerts) {
          if (alert.enabled) {
            await syncNotification(alert);
          }
        }
      } else {
        set({ loading: false });
      }
    } catch (e) {
      console.error("Failed to load alerts", e);
      set({ loading: false });
    }
  },

  addAlert: async (alertData) => {
    const id = Date.now().toString();
    const newAlert: AlertItem = { ...alertData, id, enabled: true };
    const { alerts } = get();
    const updated = [...alerts, newAlert];

    set({ alerts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    await syncNotification(newAlert);
  },

  updateAlert: async (updatedAlert) => {
    const { alerts } = get();
    const updated = alerts.map((a) =>
      a.id === updatedAlert.id ? updatedAlert : a,
    );

    set({ alerts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (updatedAlert.enabled) {
      await syncNotification(updatedAlert);
    } else {
      await cancelNotification(updatedAlert.id);
    }
  },

  deleteAlert: async (id) => {
    const { alerts } = get();
    const updated = alerts.filter((a) => a.id !== id);

    set({ alerts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    await cancelNotification(id);
  },

  toggleAlert: async (id) => {
    const { alerts } = get();
    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      const updatedAlert = { ...alert, enabled: !alert.enabled };
      await get().updateAlert(updatedAlert);
    }
  },
}));

const syncNotification = async (alert: AlertItem) => {
  await cancelNotification(alert.id);

  if (!alert.enabled) return;

  const eventDate = new Date(alert.time);
  const notifyDate = new Date(eventDate.getTime() - alert.remindBefore * 60000);

  if (alert.repeats === "none" && notifyDate.getTime() <= Date.now()) {
    return;
  }

  const minuteLabel =
    alert.remindBefore >= 60
      ? `${Math.floor(alert.remindBefore / 60)} hour(s)`
      : `${alert.remindBefore} min`;

  await scheduleNotification(
    alert.title,
    `Starting in ${minuteLabel}`,
    notifyDate,
    alert.id,
    alert.repeats,
  );
};
