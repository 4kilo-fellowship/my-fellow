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
    name: "Hibret Amba",
    address: "Arat Kilo, Addis Ababa",
    image: require("@/assets/images/locations/hibret.jpg"),
    coordinates: {
      latitude: 9.034,
      longitude: 38.762,
    },
    serviceTimes: ["Monday: 9:00 AM - 12:00 PM", "Tuesday: 5:30 PM - 7:30 PM"],
    googleMapsUrl: "https://maps.google.com/?q=joy+worship+chapel",
  },
  {
    id: "2",
    name: "Emmanuel Church",
    address: "Arat Kilo, Addis Ababa",
    image: require("@/assets/images/locations/image.jpg"),
    coordinates: {
      latitude: 9.04,
      longitude: 38.765,
    },
    serviceTimes: ["Fridays: 5:30 PM - 7:30 PM"],
  },
  {
    id: "3",
    name: "Anglican",
    address: "Arat Kilo, Addis Ababa",
    image: require("@/assets/images/programs/fresh.jpg"),
    coordinates: {
      latitude: 9.03,
      longitude: 38.75,
    },
    serviceTimes: ["Tuesdays: 5:30 PM - 7:30 PM"],
  },
];
