import api from "./api";

export interface JoinRequest {
  _id: string;
  user: string;
  team: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export const joinRequestService = {
  createJoinRequest: async (teamId: string, message?: string) => {
    const response = await api.post("/join-requests", { teamId, message });
    return response.data;
  },

  getMyRequests: async (): Promise<JoinRequest[]> => {
    const response = await api.get("/join-requests/my");
    return response.data.data;
  },
};
