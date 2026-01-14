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
   * Note: profileImage should be a Cloudinary URL string (uploaded via cloudinaryService)
   */
  signup: async (data: SignUpData): Promise<SignUpResponse> => {
    // Prepare registration data as JSON (since image is already uploaded to Cloudinary)
    const registrationData = {
      fullName: data.fullName,
      phone: data.phone,
      password: data.password,
      ...(data.team && { team: data.team }),
      ...(data.department && { department: data.department }),
      ...(data.year && { year: data.year }),
      ...(data.telegram && { telegram: data.telegram }),
      ...(data.profileImage && { profileImage: data.profileImage }),
    };

    // Send as JSON (image is already uploaded to Cloudinary as a URL)
    const response = await api.post<SignUpResponse>("/register", registrationData);

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
