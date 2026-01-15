import { LoginResponse, SignUpData, SignUpResponse } from "@/types/types";
import api from "./api";

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
    // Convert year string (e.g., "1st Year", "2nd Year") to number for yearOfStudy
    const parseYearOfStudy = (yearStr?: string): number | null => {
      if (!yearStr) return null;
      // Extract number from strings like "1st Year", "2nd Year", etc.
      const match = yearStr.match(/^(\d+)/);
      if (match) {
        const yearNum = parseInt(match[1], 10);
        return yearNum > 0 ? yearNum : null;
      }
      // Handle "GC" case - return null or a special value
      return null;
    };

    // Prepare registration data as JSON
    // Map frontend field names to backend field names
    const registrationData = {
      fullName: data.fullName,
      phoneNumber: data.phone, // Backend expects phoneNumber, not phone
      password: data.password,
      ...(data.team && { team: data.team }),
      ...(data.department && { department: data.department }),
      ...(data.year && { yearOfStudy: parseYearOfStudy(data.year) }), // Backend expects yearOfStudy as number
      ...(data.telegram && { telegramUserName: data.telegram }), // Backend expects telegramUserName, not telegram
    };

    // Send as JSON
    const response = await api.post<SignUpResponse>(
      "/auth/signup",
      registrationData
    );

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
