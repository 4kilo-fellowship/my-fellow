import { ApiResponse } from "./api.types";
export { ApiResponse };

export interface AppEvent {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  buttonText: string;
  registrationLimit?: number | null;
  registrationsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventSummary extends AppEvent {
  id: string;
}

export type EventDetail = AppEvent;

export interface EventRegistration {
  _id: string;
  userId: string;
  eventId: string;
}

export interface EventRegistrationData {
  eventId: string;
}
