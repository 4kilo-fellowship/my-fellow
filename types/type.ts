import { ReactNode } from "react";

export type AuthState = {
  token: string | null;
  authenticated: boolean | null;
};

export type LoginResponse = {
  token: string;
  user?: unknown;
};

export type AuthContextType = {
  authState: AuthState;
  login: (phoneNumber: number, password: string) => Promise<LoginResponse>;
  logout: Promise<void>;
};

export type authProviderContext = {
  children: ReactNode;
};
