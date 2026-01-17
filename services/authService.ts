import { LoginResponse, SignUpData, SignUpResponse, User } from "@/types/types";
import { isAxiosError } from "axios";
import api from "./api";

/**
 * Authentication Service
 * Modular service for handling authentication API calls
 */
export const authService = {
  /**
   * Sign in with phone number and password
   * POST /api/auth/signin
   */
  login: async (
    phoneNumber: string,
    password: string,
  ): Promise<LoginResponse> => {
    try {
      // Note: headers must be passed as the 3rd arg to axios.post —
      // previously headers were accidentally included inside the body.
      // Send both `phoneNumber` and `phone` to be compatible with different API shapes
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
    // Create FormData for multipart/form-data
    const formData = new FormData();

    // Required fields
    formData.append("fullName", data.fullName);
    formData.append("phoneNumber", data.phone);
    formData.append("password", data.password);
    if (data.confirmPassword) {
      formData.append("confirmPassword", data.confirmPassword);
    }

    // Optional fields
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

    // Handle image upload if provided
    if (data.profileImage) {
      // For React Native, we need to create a file object
      // The image URI should be a local file path
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

    // Send as multipart/form-data
    // React Native + Expo sometimes has trouble with axios + FormData. Use fetch which handles FormData reliably.
    try {
      const base = (api.defaults.baseURL ?? "").replace(/\/$/, "");
      const url = `${base}/auth/signup`;

      const res = await fetch(url, {
        method: "POST",
        // Let fetch set the Content-Type with boundary automatically
        body: formData as any,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Registration failed: ${res.status} ${text}`);
      }

      const json = (await res.json()) as SignUpResponse;
      return json;
    } catch {
      // fetch/network errors will end up here
      throw new Error(
        "Registration failed: Network Error. Check API base URL and device/network reachability.",
      );
    }
  },

  /**
   * Get current authenticated user
   * GET /api/auth/me
   * Requires Authorization: Bearer <token>
   */
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

  /**
   * Verify token (optional - for token refresh)
   */
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
