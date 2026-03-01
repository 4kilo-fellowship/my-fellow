import {
  ApiResponse,
  AppEvent,
  EventRegistration,
  EventRegistrationData,
} from "@/types/events.types";
import api from "./api";

export const fetchEventsApi = async (
  sort: "asc" | "desc" = "asc",
): Promise<ApiResponse<AppEvent[]>> => {
  const res = await api.get<ApiResponse<AppEvent[]>>("/events", {
    params: { sort },
  });
  return res.data;
};

export const fetchEventByIdApi = async (
  id: string,
): Promise<ApiResponse<AppEvent>> => {
  const res = await api.get<ApiResponse<AppEvent>>(`/events/${id}`);
  return res.data;
};

export const registerForEventApi = async (
  data: EventRegistrationData,
): Promise<ApiResponse<EventRegistration>> => {
  const res = await api.post<ApiResponse<EventRegistration>>(
    "/events/register",
    data,
  );
  return res.data;
};

export const checkRegistrationStatusApi = async (
  eventId: string,
): Promise<{ success: boolean; isRegistered: boolean; data: any }> => {
  const res = await api.get(`/events/registration-status/${eventId}`);
  return res.data;
};
