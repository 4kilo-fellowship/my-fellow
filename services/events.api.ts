import {
  EventDetail,
  EventRegistrationData,
  EventSummary,
} from "@/types/events.types";
import api from "./api";

function unwrap<T>(res: any): T {
  // Try to find the useful payload in several common shapes:
  // - Array directly
  // - { data: ... }
  // - { events: [...] }
  // - { results: [...] }
  // - { items: [...] }
  if (res == null) return res;
  if (Array.isArray(res)) return res as any;
  if (typeof res === "object") {
    if ("data" in res) return unwrap(res.data);
    if ("events" in res && Array.isArray(res.events)) return res.events as any;
    if ("results" in res && Array.isArray(res.results))
      return res.results as any;
    if ("items" in res && Array.isArray(res.items)) return res.items as any;
  }
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

export const registerForEventApi = async (data: EventRegistrationData) => {
  const res = await api.post("/events/register", data);
  return res.data;
};
