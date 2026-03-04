export enum EventCtaType {
  REGISTER = "REGISTER",
  NOTIFY = "NOTIFY",
  DONATE = "DONATE",
  URL = "URL",
  UNKNOWN = "UNKNOWN",
}

export interface EventMetadata {
  url?: string;
  cta_url?: string;
  [key: string]: unknown;
}

export interface AppEvent {
  _id: string;
  id?: string;
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  image?: string;
  buttonText?: string;
  location?: string;
  cta_url?: string;
  metadata?: EventMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventSummary extends AppEvent {
  id: string;
}

export type EventDetail = AppEvent;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface EventRegistration {
  _id: string;
  userId: string;
  eventId: string;
}

export interface EventRegistrationData {
  eventId: string;
}
