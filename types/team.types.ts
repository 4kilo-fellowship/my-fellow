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
