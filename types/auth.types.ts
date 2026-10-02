import { ReactNode } from "react";

export type AuthState = {
  token: string | null;
  authenticated: boolean | null;
};

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role?: string;
  profileImage?: string | null;
  team?: string;
  department?: string;
  yearOfStudy?: string;
  telegramUserName?: string;
  createdAt?: string;
}

import { ApiResponse } from "./api.types";
export { ApiResponse };

export interface AuthResponse {
  user: User;
  token: string;
}

export type LoginResponse = AuthResponse;

export interface SignUpData {
  fullName: string;
  phoneNumber: string;
  password?: string;
  team?: string;
  department?: string;
  yearOfStudy?: string;
  telegramUserName?: string;
  profileImage?: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePhoneData {
  phoneNumber: string;
  password: string;
}

export interface UpdatePhoneResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export type SignUpResponse = AuthResponse;

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  phoneNumber: string;
  expiresIn?: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  verificationToken: string;
  phoneNumber: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface AuthContextType {
  authState: AuthState;
  login: (phoneNumber: string, password: string) => Promise<LoginResponse>;
  signup: (data: SignUpData) => Promise<SignUpResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
  updateProfile: (data: Partial<SignUpData>) => Promise<User>;
  changePassword: (data: ChangePasswordData) => Promise<ApiResponse<void>>;
  updatePhone: (data: UpdatePhoneData) => Promise<UpdatePhoneResponse>;
  requestOtp: (
    phoneNumber: string,
    purpose?: "signup" | "reset-password"
  ) => Promise<RequestOtpResponse>;
  verifyOtp: (
    phoneNumber: string,
    code: string,
    purpose?: "signup" | "reset-password"
  ) => Promise<VerifyOtpResponse>;
  resetPasswordWithOtp: (
    phoneNumber: string,
    verificationToken: string,
    newPassword: string
  ) => Promise<ResetPasswordResponse>;
}

export type AuthProviderProps = {
  children: ReactNode;
};
