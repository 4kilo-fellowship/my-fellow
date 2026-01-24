
import { ImageSourcePropType } from "react-native";

export type Location = {
  id: string;
  name: string;
  address: string;
  image: ImageSourcePropType;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  serviceTimes: string[];
  googleMapsUrl?: string;
};

export const LOCATIONS: Location[] = [
  {
    id: "1",
    name: "Main Campus (4kilo)",
    address: "Arat Kilo, Addis Ababa",
    image: require("@/assets/images/header.png"), 
    coordinates: {
      latitude: 9.034,
      longitude: 38.762,
    },
    serviceTimes: ["Sundays: 9:00 AM - 12:00 PM", "Wednesdays: 5:30 PM - 7:30 PM"],
    googleMapsUrl: "https://maps.google.com/?q=joy+worship+chapel", 
  },
  {
    id: "2",
    name: "Hibret Amba",
    address: "Sidist Kilo, Addis Ababa",
    image: require("@/assets/images/header.png"), 
    coordinates: {
      latitude: 9.040,
      longitude: 38.765,
    },
    serviceTimes: ["Fridays: 5:30 PM - 7:30 PM"],
  },
  {
    id: "3",
    name: "Anglican",
    address: "Piasa, Addis Ababa",
    image: require("@/assets/images/header.png"), 
    coordinates: {
      latitude: 9.030,
      longitude: 38.750,
    },
    serviceTimes: ["Tuesdays: 5:30 PM - 7:30 PM"],
  },
];
