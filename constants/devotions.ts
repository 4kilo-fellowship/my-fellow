export type Devotion = {
  id: string;
  title: string;
  date: string;
  views: string;
  likes: string;
  image: string;
};
export const DEVOTIONS: Devotion[] = [
  {
    id: "1",
    title: "Finding Peace",
    date: "Jan 12",
    views: "1.2k",
    likes: "340",
    image:
      "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    title: "Morning Prayer",
    date: "Jan 10",
    views: "900",
    likes: "210",
    image:
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
];
