import api from "./api";
import { LoginResponse, SignUpData, SignUpResponse } from "@/types/types";

/**
 * Authentication Service
 * Modular service for handling authentication API calls
 */
export const authService = {
  /**
   * Sign in with phone number and password
   */
  login: async (
    phoneNumber: string,
    password: string
  ): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/login", {
      phoneNumber,
      password,
    });
    return response.data;
  },

  /**
   * Sign up with user data
   */
  signup: async (data: SignUpData): Promise<SignUpResponse> => {
    // Create FormData for file upload support
    const formData = new FormData();

    // Append text fields
    formData.append("fullName", data.fullName);
    formData.append("phone", data.phone);
    formData.append("password", data.password);
    
    if (data.team) formData.append("team", data.team);
    if (data.department) formData.append("department", data.department);
    if (data.year) formData.append("year", data.year);
    if (data.telegram) formData.append("telegram", data.telegram);

    // Append profile image if provided
    if (data.profileImage) {
      const filename = data.profileImage.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("profileImage", {
        uri: data.profileImage,
        name: filename,
        type,
      } as any);
    }

    // Note: For React Native FormData, don't set Content-Type header
    // axios will automatically set it with the correct boundary
    const response = await api.post<SignUpResponse>("/register", formData);

    return response.data;
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
