import { LoginResponse, SignUpData, SignUpResponse, User } from "@/types/types";
import { isAxiosError } from "axios";
import api from "./api";

export const authService = {
  login: async (
    phoneNumber: string,
    password: string,
  ): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>("/auth/signin", {
        phoneNumber,
        phone: phoneNumber,
        password,
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          `Login failed: ${error.response?.status || "network error"}`,
        );
      }
      throw error;
    }
  },

  signup: async (data: SignUpData): Promise<SignUpResponse> => {
    const formData = new FormData();

    formData.append("fullName", data.fullName);
    formData.append("phoneNumber", data.phone);
    formData.append("password", data.password);
    if (data.confirmPassword) {
      formData.append("confirmPassword", data.confirmPassword);
    }

    if (data.team) {
      formData.append("team", data.team);
    }
    if (data.department) {
      formData.append("department", data.department);
    }
    if (data.year) {
      formData.append("yearOfStudy", data.year);
    }
    if (data.telegram) {
      formData.append("telegramUserName", data.telegram);
    }

    if (data.profileImage) {
      const imageUri = data.profileImage;
      const filename = imageUri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);
    }
    try {
      const base = (api.defaults.baseURL ?? "").replace(/\/$/, "");
      const url = `${base}/auth/signup`;

      const res = await fetch(url, {
        method: "POST",

        body: formData as any,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Registration failed: ${res.status} ${text}`);
      }

      const json = (await res.json()) as SignUpResponse;
      return json;
    } catch {
      throw new Error(
        "Registration failed: Network Error. Check API base URL and device/network reachability.",
      );
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>("/auth/me");
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(
          `getCurrentUser failed: ${error.response?.status || "network error"}`,
        );
      }
      throw error;
    }
  },

  verifyToken: async (token: string): Promise<boolean> => {
    try {
      await api.get("/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch {
      return false;
    }
  },
};
