export type EventSummary = {
  id: string;
  title: string;
  shortDescription?: string;
  startDate?: string;
  image?: string;
};

export type EventDetail = EventSummary & {
  fullDescription?: string;
  endDate?: string;
  metadata?: Record<string, any>;
};

export type EventRegistrationData = {
  eventId: string;
};
