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
    title: "Morning Prayer",
    description:
      "Start your day with prayer and intercession every Tuesdays and Thursdays.",
    day: "All days",
    time: "6:00 AM - 7:30 AM",
    category: "Prayer",
    location: "Anglican Church",
    coordinates: { lat:  9.033291325771401, lng: 38.76877997143855 },
    image: require("@/assets/images/programs/wed.png"),
  },
 
  {
    id: "3",
    title: "Fresh Batch",
    description:
      "A vibrant gathering for 1st year student to connect and grow in faith.",
    day: "Wednesday",
    time: "5:30 PM - 2:00 PM",
    category: "Fresh",
   location: "Anglican Church",
    coordinates: { lat:  9.033291325771401, lng: 38.76877997143855 },
    image: require("@/assets/images/programs/fresh.png"),
  },
 {
  id: "4",
  title: "Worship Team",
  description: "A dedicated team leading the church in praise and worship.",
  day: "Wednesday",
  time: "5:30 PM - 7:30 PM",
  category: "Ministry",
  location: "Hibret Amba",
  coordinates: { lat: 9.038952250154978, lng: 38.75831542801892 },
  image: require("@/assets/images/programs/wer.png"),
},
{
  id: "5",
  title: "Bible Study Team",
  description: "Teaching and studying God’s word to strengthen believers.",
  day: "Wednesday",
  time: "5:30 PM - 7:30 PM",
  category: "Teaching",
  location: "6kilo church",
  coordinates: { lat: 9.040462923318069, lng: 38.759740033794586 },
  image: require("@/assets/images/programs/bss.png"),
},
{
  id: "6",
  title: "Media Team",
  description: "Managing sound, visuals, and live streaming for services.",
  day: "Wednesday",
  time: "5:30 PM - 7:30 PM",
  category: "Service",
  location: "6kilo church",
  coordinates: { lat: 9.040462923318069, lng: 38.759740033794586 },
  image: require("@/assets/images/programs/image.png"),
},
{
  id: "7",
  title: "Evangelism Team",
  description: "Reaching out to the community with the message of Christ.",
  day: "Thursday",
  time: "5:30 PM - 7:30 PM",
  category: "Outreach",
  location: "Hibret Amba",
  coordinates: { lat: 9.038952250154978, lng: 38.75831542801892 },
  image: require("@/assets/images/programs/evan.png"),
},
{
  id: "8",
  title: "I4U Team",
  description: "A fellowship focused on identity, faith, and unity in Christ.",
  day: "Wednesday",
  time: "5:30 PM - 7:30 PM",
  category: "Fellowship",
  location: "Emmanuel church",
  coordinates: { lat: 9.03037740148045, lng: 38.77196975055801 },
  image: require("@/assets/images/programs/i4u.png"),
},
{
  id: "9",
  title: "Prayer Team",
  description: "Interceding and praying for the church and the community.",
  day: "Thursday",
  time: "5:30 PM - 7:30 PM",
  category: "Prayer",
  location: "Emmanuel church",
  coordinates: { lat: 9.03037740148045, lng: 38.77196975055801 },
  image: require("@/assets/images/programs/image2.png"),
},

];