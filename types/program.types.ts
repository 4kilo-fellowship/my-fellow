import type { ImageSource } from "expo-image";

export type Program = {
  id: string;
  title: string;
  description: string;
  day: string;
  time: string;
  category: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  image: string | number | ImageSource;
};
