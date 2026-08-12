import { SendOtpPayload, VerifyOtpPayload } from "@/types";
import { isAxiosError } from "axios";
import api from "./api";

export const otpService = {
  send: async (payload: SendOtpPayload): Promise<void> => {
    try {
      await api.post("/auth/otp/send", payload);
    } catch (error) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Failed to send verification code.";
        throw new Error(message);
      }
      throw error;
    }
  },

  verify: async (payload: VerifyOtpPayload): Promise<string> => {
    try {
      const response = await api.post("/auth/otp/verify", payload);
      return response.data.otpToken as string;
    } catch (error) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Verification failed.";
        throw new Error(message);
      }
      throw error;
    }
  },
};
