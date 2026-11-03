import api from "./api";

export interface WriterRequest {
  _id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  telegramHandle: string;
  department?: string;
  year?: string;
  sampleTopic: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWriterRequestData {
  fullName: string;
  phoneNumber: string;
  telegramHandle: string;
  department?: string;
  year?: string;
  sampleTopic: string;
  message?: string;
}

export const devotionWriterService = {
  submitApplication: async (data: CreateWriterRequestData): Promise<WriterRequest> => {
    const response = await api.post("/devotions/writer-requests", data);
    return response.data.data;
  },

  getMyApplication: async (): Promise<WriterRequest | null> => {
    try {
      const response = await api.get("/devotions/writer-requests/me");
      return response.data.data || null;
    } catch {
      return null;
    }
  },
};

export default devotionWriterService;
