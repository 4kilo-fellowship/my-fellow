import { LoginResponse, SignUpData, SignUpResponse, User } from "@/types/types";
import { isAxiosError } from "axios";
import api from "./api";

export const authService = {
  login: async (
    phoneNumber: string,
    password: string,
  ): Promise<LoginResponse> => {
    try {
      const response = await api.post<any>("/auth/signin", {
        phoneNumber,
        phone: phoneNumber,
        password,
      });

      // Handle both wrapped and unwrapped responses
      const data = response.data.data || response.data;
      return {
        token: data.token,
        user: data.user || data,
      };
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
    if (data.pastTeam) {
      formData.append("pastTeam", data.pastTeam);
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

      const json = await res.json();
      const result = json.data || json;

      return {
        token: result.token,
        user: result.user || result,
      };
    } catch (e: any) {
      throw new Error(e.message || "Registration failed");
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<any>("/auth/me");
      // Backend usually returns { success: true, data: user } or just user
      return response.data.data || response.data.user || response.data;
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
  updateProfile: async (data: any): Promise<User> => {
    try {
      let payload: any = data;
      let headers = {};

      if (
        data.image ||
        (data.profileImage &&
          typeof data.profileImage === "string" &&
          (data.profileImage.startsWith("file://") ||
            data.profileImage.startsWith("content://")))
      ) {
        const formData = new FormData();
        const imageUri = data.image || data.profileImage;
        const filename = imageUri.split("/").pop() || "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("image", {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);

        Object.keys(data).forEach((key) => {
          if (
            key !== "image" &&
            key !== "profileImage" &&
            data[key] !== undefined &&
            data[key] !== null
          ) {
            formData.append(key, data[key]);
          }
        });
        payload = formData;
        headers = { "Content-Type": "multipart/form-data" };
      }

      const response = await api.patch<any>("/auth/profile", payload, {
        headers,
      });
      return response.data.data || response.data.user || response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Profile update failed";
        throw new Error(message);
      }
      throw error;
    }
  },
};
