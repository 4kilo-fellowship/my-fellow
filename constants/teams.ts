import { Ionicons } from "@expo/vector-icons";

export type Team = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  members: string;
};

export const TEAMS: Team[] = [
  {
    id: "1",
    name: "Evangelism Team",
    icon: "megaphone",
    color: "#059669",
    members: "50",
  },
  {
    id: "2",
    name: "Bible Study Team",
    icon: "book",
    color: "#7c3aed",
    members: "35",
  },
  {
    id: "3",
    name: "Worship Team",
    icon: "musical-notes",
    color: "#0ea5e9",
    members: "45",
  },
  {
    id: "4",
    name: "I4U Team",
    icon: "heart",
    color: "#db2777",
    members: "28",
  },
  {
    id: "5",
    name: "Prayer Team",
    icon: "flame",
    color: "#dc2626",
    members: "40",
  },
  {
    id: "6",
    name: "Literature and Media Team",
    icon: "videocam",
    color: "#d97706",
    members: "22",
  },
  {
    id: "7",
    name: "Freshman",
    icon: "school",
    color: "#84cc16",
    members: "65",
  },
];

// Simple array of team names for dropdowns/forms
export const TEAM_NAMES = [
  "Evangelism Team",
  "Bible Study Team",
  "Worship Team",
  "I4U Team",
  "Prayer Team",
  "Literature and Media Team",
  "Freshman",
  "Other",
];
