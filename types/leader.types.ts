import { ImageSourcePropType } from "react-native";

export type Leader = {
  id: string;
  name: string;
  role: string;
  bio: string;
  phoneNumber: string;
  telegram: string;
  isVerified: boolean;
  image: string | ImageSourcePropType;
  type: "Main" | "Team";
};
