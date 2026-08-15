import { LoginResponse, SignUpData, SignUpResponse, User } from "@/types";
import { isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
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

      const data = response.data.data || response.data;
      return {
        token: data.token,
        user: data.user || data,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          `Login failed: ${error.response?.status || "network error"}`;
        throw new Error(message);
      }
      throw error;
    }
  },

  signup: async (data: SignUpData): Promise<SignUpResponse> => {
    const formData = new FormData();

    formData.append("fullName", data.fullName);
    formData.append("phoneNumber", data.phoneNumber);
    if (data.password) {
      formData.append("password", data.password);
    }

    if (data.otpToken) {
      formData.append("otpToken", data.otpToken);
    }

    if (data.team) {
      formData.append("team", data.team);
    }
    if (data.department) {
      formData.append("department", data.department);
    }
    if (data.yearOfStudy) {
      formData.append("yearOfStudy", data.yearOfStudy);
    }
    if (data.telegramUserName) {
      formData.append("telegramUserName", data.telegramUserName);
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
        let message = `Registration failed: ${res.status}`;
        try {
          const json = await res.json();
          message = json.message || json.error || message;
        } catch (e) {
          // If not JSON, use status
        }
        throw new Error(message);
      }

      const json = await res.json();
      const result = json.data || json;

      return {
        token: result.token,
        user: result.user || result,
      };
    } catch (error: any) {
      let message = error.message || "Registration failed";

      // Handle MongoDB duplicate key errors (E11000)
      if (message.includes("E11000") && message.includes("phoneNumber")) {
        message = "This phone number is already registered.";
      } else if (message.includes("E11000")) {
        message = "A record with this information already exists.";
      }

      throw new Error(message);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<any>("/auth/me");
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

  changePassword: async (data: any): Promise<any> => {
    try {
      const response = await api.post("/auth/change-password", data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Password update failed";
        throw new Error(message);
      }
      throw error;
    }
  },

  updatePhone: async (data: any): Promise<any> => {
    try {
      const response = await api.post("/auth/update-phone", data);
      const result = response.data.data || response.data;

      if (result.token) {
        api.defaults.headers.common.Authorization = `Bearer ${result.token}`;
        await SecureStore.setItemAsync("userToken", result.token);
      }

      return result;
    } catch (error) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Phone number update failed";
        throw new Error(message);
      }
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    delete api.defaults.headers.common.Authorization;
  },
};
