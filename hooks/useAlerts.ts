import { useEffect } from "react";
import { AlertItem, useAlertsStore } from "../stores/alerts.store";

export { AlertItem };

export const useAlerts = () => {
  const {
    alerts,
    loading,
    loadAlerts,
    addAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
  } = useAlertsStore();

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return { alerts, loading, addAlert, updateAlert, deleteAlert, toggleAlert };
};
