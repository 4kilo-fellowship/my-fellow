import { ImageSourcePropType } from "react-native";

export type Leader = {
  id: string;
  name: string;
  role: string;
  bio: string;
  phoneNumber: string;
  telegram: string;
  isVerified: boolean;
  image: ImageSourcePropType;
  type: "Main" | "Team";
};

export const LEADERS: Leader[] = [
  {
    id: "1",
    name: "Edilu Bogale",
    role: "Main Leader",
    bio: "A dedicated 4th-year Statistics student with a strong analytical mindset and a passion for serving the church. Committed to applying data-driven thinking, discipline, and faith to guide the congregation toward spiritual growth and meaningful impact.",
    phoneNumber: "09976652663",
    telegram: "@Jesus_is_my_peace",
    isVerified: true,
    image: require("@/assets/images/leaders/image.png"), 
    type: "Main",
  },
  {
    id: "2",
    name: "Mahlet",
    role: "Worship Leader",
    bio: "Dedicated to creating an atmosphere of worship and praise.",
    phoneNumber: "+251922345678",
    telegram: "@mahlet",
    isVerified: true,
        image: require("@/assets/images/leaders/image.png"),

    type: "Main",
  },
  {
    id: "3",
    name: "Abel",
    role: "Youth Coordinator",
    bio: "Focused on empowering the youth to live for Christ.",
    phoneNumber: "+251933456789",
    telegram: "@abel",
    isVerified: false,
       image: require("@/assets/images/leaders/image.png"),

    type: "Team",
  },
  {
    id: "4",
    name: "Hana",
    role: "Prayer Team Lead",
    bio: "Believes in the power of prayer to change lives.",
    phoneNumber: "+251944567890",
    telegram: "@hana",
    isVerified: true,
    image: require("@/assets/images/leaders/image.png"),
    type: "Team",
  },
];
