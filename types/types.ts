import { ReactNode } from "react";

export type AuthState = {
  token: string | null;
  authenticated: boolean | null;
};

export type LoginResponse = {
  token: string;
  user?: unknown;
};

export type SignUpData = {
  fullName: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  team?: string;
  department?: string;
  year?: string;
  telegram?: string;
  profileImage?: string | null;
};

export type SignUpResponse = {
  token: string;
  user?: unknown;
};

export type AuthContextType = {
  authState: AuthState;
  login: (phoneNumber: string, password: string) => Promise<LoginResponse>;
  signup: (data: SignUpData) => Promise<SignUpResponse>;
  logout: () => Promise<void>;
};

export type AuthProviderProps = {
  children: ReactNode;
};
