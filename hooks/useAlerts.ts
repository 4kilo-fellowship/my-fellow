import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  cancelNotification,
  scheduleNotification,
} from "../utils/notificationService";

const STORAGE_KEY = "@alerts_storage_key";

export interface AlertItem {
  id: string;
  title: string;
  time: string; // ISO String
  enabled: boolean;
  repeats: "daily" | "weekly" | "none";
  remindBefore: number; // minutes
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAlerts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load alerts", e);
    } finally {
      setLoading(false);
    }
  };

  const saveAlerts = async (updatedAlerts: AlertItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlerts));
      setAlerts(updatedAlerts);
    } catch (e) {
      console.error("Failed to save alerts", e);
    }
  };

  const addAlert = async (alert: Omit<AlertItem, "id" | "enabled">) => {
    const id = Date.now().toString();
    const newAlert: AlertItem = { ...alert, id, enabled: true };
    const updated = [...alerts, newAlert];
    await saveAlerts(updated);
    await syncNotification(newAlert);
  };

  const updateAlert = async (updatedAlert: AlertItem) => {
    const updated = alerts.map((a) =>
      a.id === updatedAlert.id ? updatedAlert : a,
    );
    await saveAlerts(updated);
    if (updatedAlert.enabled) {
      await syncNotification(updatedAlert);
    } else {
      await cancelNotification(updatedAlert.id);
    }
  };

  const deleteAlert = async (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    await saveAlerts(updated);
    await cancelNotification(id);
  };

  const toggleAlert = async (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      const updatedAlert = { ...alert, enabled: !alert.enabled };
      await updateAlert(updatedAlert);
    }
  };

  const syncNotification = async (alert: AlertItem) => {
    await cancelNotification(alert.id);
    if (alert.enabled) {
      const scheduledDate = new Date(alert.time);
      const dateToNotify = new Date(
        scheduledDate.getTime() - alert.remindBefore * 60000,
      );

      if (dateToNotify > new Date() || alert.repeats !== "none") {
        await scheduleNotification(
          alert.title,
          "", // description removed
          dateToNotify,
          alert.id,
          alert.repeats,
        );
      }
    }
  };

  return { alerts, loading, addAlert, updateAlert, deleteAlert, toggleAlert };
};
