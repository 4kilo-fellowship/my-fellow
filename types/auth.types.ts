import { ReactNode } from "react";

export type AuthState = {
  token: string | null;
  authenticated: boolean | null;
};

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  role?: string;
  profileImage?: string | null;
  team?: string;
  department?: string;
  yearOfStudy?: string;
  telegramUserName?: string;
  pastTeam?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T extends { user: infer U } ? U : User;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type LoginResponse = AuthResponse;

export interface SignUpData {
  fullName: string;
  phoneNumber: string;
  password?: string;
  confirmPassword?: string;
  team?: string;
  department?: string;
  yearOfStudy?: string;
  telegramUserName?: string;
  pastTeam?: string;
  profileImage?: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
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

export interface AuthContextType {
  authState: AuthState;
  login: (phoneNumber: string, password: string) => Promise<LoginResponse>;
  signup: (data: SignUpData) => Promise<SignUpResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
  updateProfile: (data: Partial<SignUpData>) => Promise<User>;
  changePassword: (data: ChangePasswordData) => Promise<ApiResponse<void>>;
  updatePhone: (data: UpdatePhoneData) => Promise<UpdatePhoneResponse>;
}

export type AuthProviderProps = {
  children: ReactNode;
};
