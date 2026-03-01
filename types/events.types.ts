export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AppEvent {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  buttonText: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventRegistration {
  _id: string;
  userId: string;
  eventId: string;
}

export interface PopulatedRegistration {
  _id: string;
  userId: {
    _id: string;
    [key: string]: any;
  };
  eventId: AppEvent;
}

export interface EventRegistrationData {
  eventId: string;
}
