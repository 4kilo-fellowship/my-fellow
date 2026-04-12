import api from "./api";

export interface JoinRequest {
  _id: string;
  user?: string;
  userId?: string;
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string;
  department?: string;
  year?: string;
  telegramHandle?: string;
  team?: string;
  teamId?:
    | string
    | {
        _id: string;
        name: string;
        icon: string;
        color: string;
      };
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJoinRequestData {
  teamId: string;
  fullName: string;
  phoneNumber: string;
  department?: string;
  year?: string;
  telegramHandle?: string;
  profileImage?: string | null;
  message?: string;
}

export const joinRequestService = {
  createJoinRequest: async (data: CreateJoinRequestData) => {
    const response = await api.post("/join-requests", data);
    return response.data;
  },

  getMyRequests: async (): Promise<JoinRequest[]> => {
    const response = await api.get("/join-requests/my");
    return response.data.data;
  },
};
