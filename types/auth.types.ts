import { ReactNode } from "react";

export type AuthState = {
  token: string | null;
  authenticated: boolean | null;
};

export type User = {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  team: string;
  pastTeam: string;
  department: string;
  yearOfStudy: string;
  telegramUserName: string;
  image?: string;
  profileImage?: string | null;
  createdAt?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type SignUpData = {
  fullName: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  team?: string;
  pastTeam?: string;
  department?: string;
  year?: string;
  telegram?: string;
  profileImage?: string | null;
};

export type SignUpResponse = {
  token: string;
  user?: User;
};

export type AuthContextType = {
  authState: AuthState;
  login: (phoneNumber: string, password: string) => Promise<LoginResponse>;
  signup: (data: SignUpData) => Promise<SignUpResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
};

export type AuthProviderProps = {
  children: ReactNode;
};
