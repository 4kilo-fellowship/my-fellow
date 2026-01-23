import { ImageSourcePropType } from "react-native";

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
        lng: number
    };
    image: ImageSourcePropType
}