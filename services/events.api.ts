import {
  ApiResponse,
  AppEvent,
  EventRegistration,
  EventRegistrationData,
  PopulatedRegistration,
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

export const fetchAllRegistrationsApi = async (): Promise<
  ApiResponse<PopulatedRegistration[]>
> => {
  const res = await api.get<ApiResponse<PopulatedRegistration[]>>(
    "/events/registrations",
  );
  return res.data;
};

export const fetchRegistrationsByEventApi = async (
  eventId: string,
): Promise<ApiResponse<PopulatedRegistration[]>> => {
  const res = await api.get<ApiResponse<PopulatedRegistration[]>>(
    `/events/registrations/${eventId}`,
  );
  return res.data;
};
