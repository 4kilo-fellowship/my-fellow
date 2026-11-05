import {
  ApiResponse,
  AppEvent,
  EventRegistration,
  EventRegistrationData,
} from "@/types/events.types";
import api from "./api";

export interface FetchEventsOptions {
  sort?: "asc" | "desc";
  scope?: string;
  status?: string;
}

export const fetchEventsApi = async (
  optionsOrSort: "asc" | "desc" | FetchEventsOptions = "asc",
): Promise<ApiResponse<AppEvent[]>> => {
  const params: Record<string, string> = {};
  if (typeof optionsOrSort === "string") {
    params.sort = optionsOrSort;
  } else if (optionsOrSort) {
    if (optionsOrSort.sort) params.sort = optionsOrSort.sort;
    if (optionsOrSort.scope) params.scope = optionsOrSort.scope;
    if (optionsOrSort.status) params.status = optionsOrSort.status;
  }
  const res = await api.get<ApiResponse<AppEvent[]>>("/events", {
    params,
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

export const unregisterFromEventApi = async (data: {
  eventId: string;
}): Promise<{ success: boolean; message: string }> => {
  const res = await api.post<{ success: boolean; message: string }>(
    "/events/unregister",
    data,
  );
  return res.data;
};

export const createEventApi = async (
  data: FormData | any,
): Promise<ApiResponse<AppEvent>> => {
  const res = await api.post<ApiResponse<AppEvent>>("/events", data);
  return res.data;
};

export const updateEventApi = async (
  id: string,
  data: FormData | any,
): Promise<ApiResponse<AppEvent>> => {
  const res = await api.put<ApiResponse<AppEvent>>(`/events/${id}`, data);
  return res.data;
};

export const deleteEventApi = async (
  id: string,
): Promise<ApiResponse<{ message: string }>> => {
  const res = await api.delete<ApiResponse<{ message: string }>>(`/events/${id}`);
  return res.data;
};

export const togglePublishEventApi = async (
  id: string,
  isPublished?: boolean,
): Promise<ApiResponse<AppEvent>> => {
  const res = await api.patch<ApiResponse<AppEvent>>(`/events/${id}/publish`, {
    isPublished,
  });
  return res.data;
};

export const generatePosterApi = async (
  data: FormData,
): Promise<{ success: boolean; imageUrl: string; message?: string }> => {
  const res = await api.post<{ success: boolean; imageUrl: string; message?: string }>(
    "/events/generate-poster",
    data,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data;
};
