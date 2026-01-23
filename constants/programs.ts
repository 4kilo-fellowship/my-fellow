import { ImageSourcePropType } from "react-native";

type Program = {
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

export const WEEKLY_PROGRAMS: Program[] = [
  {
    id: "1",
    title: "Monday Service",
    description:
      "Join us for a time of worship, prayer, and God's word.",
    day: "Monday",
    time: "5:30 AM - 2:00 AM",
    category: "General Fellowship",
    location: "Hibret Amba", 
    coordinates: { lat: 9.038952250154978, lng: 38.75831542801892 },
    image: require("@/assets/images/programs/monday1.png"),
  },
  {
    id: "2",
    title: "Bible Study",
    description:
      "Deep dive into the scriptures with our mid-week Bible study group.",
    day: "Wednesday",
    time: "6:00 PM - 7:30 PM",
    category: "Education",
    location: "Fellowship Hall",
    coordinates: { lat: 9.0192, lng: 38.7525 },
    image: require("@/assets/images/programs/monday1.png"),
  },
  {
    id: "3",
    title: "Youth Fellowship",
    description:
      "A vibrant gathering for young people to connect and grow in faith.",
    day: "Friday",
    time: "5:00 PM - 7:00 PM",
    category: "Youth",
    location: "Youth Center",
    coordinates: { lat: 9.0192, lng: 38.7525 },
    image: require("@/assets/images/programs/monday1.png"),
  },
  {
    id: "4",
    title: "Morning Glory",
    description:
      "Start your day with prayer and intercession every Saturday morning.",
    day: "Saturday",
    time: "6:00 AM - 7:00 AM",
    category: "Prayer",
    location: "Prayer Room",
    coordinates: { lat: 9.0192, lng: 38.7525 },
    image: require("@/assets/images/programs/monday1.png"),
  },
  {
    id: "5",
    title: "Choir Practice",
    description:
      "Preparation for Sunday worship. Open to all who love to sing.",
    day: "Saturday",
    time: "2:00 PM - 4:00 PM",
    category: "Music",
    location: "Music Hall",
    coordinates: { lat: 9.0192, lng: 38.7525 },
    image: require("@/assets/images/programs/monday1.png"),
  },
];