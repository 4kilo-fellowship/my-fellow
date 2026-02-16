import {
  DevotionResponse,
  SingleDevotionResponse,
} from "@/types/devotion.types";
import api from "./api";

export const devotionsService = {
  getDevotions: async (params?: {
    type?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<DevotionResponse>("/devotions", {
      params,
    });
    return response.data;
  },

  getDevotionById: async (id: string) => {
    const response = await api.get<SingleDevotionResponse>(`/devotions/${id}`);
    return response.data;
  },

  likeDevotion: async (id: string, action: "like" | "unlike" = "like") => {
    const response = await api.post<{
      success: boolean;
      data: { likes: number; likesFormatted: string };
    }>(`/devotions/${id}/like`, { action });
    return response.data;
  },

  trackView: async (id: string) => {
    const response = await api.post<{
      success: boolean;
      data: { views: number; viewsFormatted: string };
    }>(`/devotions/${id}/view`);
    return response.data;
  },
};
