import { LoginResponse, SignUpData, SignUpResponse, User } from "@/types/types";
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
    password: string
  ): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/signin", {
      phoneNumber,
      password,
    });
    return response.data;
  },

  /**
   * Sign up with user data
   * POST /api/auth/signup
   * Content-Type: multipart/form-data
   */
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
    const response = await api.post<SignUpResponse>("/auth/signup", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Get current authenticated user
   * GET /api/auth/me
   * Requires Authorization: Bearer <token>
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
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
