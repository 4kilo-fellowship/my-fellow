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
  team?: string | null;
  pastTeam?: string | null;
  department?: string | null;
  yearOfStudy?: string | null;
  telegramUserName?: string | null;
  image?: string | null;
  profileImage?: string | null;
  createdAt?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  token: string;
  user?: User;
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

import { Ionicons } from "@expo/vector-icons";

export type TeamLeader = {
  name: string;
  role: string;
  imageUrl: string;
  telegram: string;
  phone: string;
};

export type Team = {
  id: string;
  _id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  members: number;
  description: string;
  about: string;
  meetingDay: string;
  time: string;
  category: string;
  location: string;
  coordinates: { lat: number; lng: number };
  imageUrl: string;
  leader: TeamLeader;
};

export const TEAMS: Team[] = [];
