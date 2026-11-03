import {
  Devotion,
  DevotionResponse,
  SingleDevotionResponse,
} from "@/types/devotion.types";
import { cache } from "@/utils/cache";
import api from "./api";

const CACHE_KEYS = {
  DEVOTIONS_LIST: (params?: any) =>
    `devotions_list_${JSON.stringify(params || {})}`,
  DEVOTION_DETAIL: (id: string) => `devotion_detail_${id}`,
};

export const devotionsService = {
  getDevotions: async (params?: {
    type?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const key = CACHE_KEYS.DEVOTIONS_LIST(params);
    try {
      const response = await api.get<DevotionResponse>("/devotions", {
        params,
      });
      await cache.set(key, response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching devotions, trying cache:", error);
      const cached = await cache.get<DevotionResponse>(key);
      if (cached) return cached;
      throw error;
    }
  },

  getDevotionById: async (id: string) => {
    const key = CACHE_KEYS.DEVOTION_DETAIL(id);
    try {
      const response = await api.get<SingleDevotionResponse>(
        `/devotions/${id}`,
      );
      await cache.set(key, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching devotion ${id}, trying cache:`, error);
      const cached = await cache.get<SingleDevotionResponse>(key);
      if (cached) return cached;
      throw error;
    }
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

  createDevotion: async (data: FormData | any): Promise<Devotion> => {
    const isFormData = data instanceof FormData;
    const res = await api.post<SingleDevotionResponse>("/devotions", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data.data;
  },

  updateDevotion: async (id: string, data: FormData | any): Promise<Devotion> => {
    const isFormData = data instanceof FormData;
    const res = await api.put<SingleDevotionResponse>(`/devotions/${id}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data.data;
  },

  deleteDevotion: async (id: string): Promise<boolean> => {
    const res = await api.delete(`/devotions/${id}`);
    return res.data?.success !== false;
  },
};
