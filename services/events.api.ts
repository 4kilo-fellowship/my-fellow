import { EventDetail, EventSummary } from "@/types/events.types";
import api from "./api";

// Fetch all events
export const fetchEventsApi = async (): Promise<EventSummary[]> => {
  const res = await api.get<EventSummary[]>("/events");
  return Array.isArray(res.data) ? res.data : [];
};

// Fetch event by ID
export const fetchEventByIdApi = async (id: string): Promise<EventDetail> => {
  const res = await api.get<EventDetail>(`/events/${id}`);
  return res.data;
};
