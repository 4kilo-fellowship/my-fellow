// src/services/events.api.ts
import { EventDetail, EventSummary } from "@/types/events.types";
import api from "./api";

function unwrap<T>(res: any): T {
  // Handles both shapes:
  // 1) { success: true, data: <T> }
  // 2) <T>
  if (res && typeof res === "object" && "data" in res) return res.data;
  return res;
}

export const fetchEventsApi = async (): Promise<EventSummary[]> => {
  const res = await api.get("/events"); // ensure baseURL + path matches your server
  const payload = unwrap<any>(res.data ?? res);
  return Array.isArray(payload) ? payload : [];
};

export const fetchEventByIdApi = async (id: string): Promise<EventDetail> => {
  const res = await api.get(`/events/${id}`);
  const payload = unwrap<any>(res.data ?? res);
  return payload as EventDetail;
};
