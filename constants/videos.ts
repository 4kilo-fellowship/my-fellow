export type Video = {
  id: string;
  title: string;
  desc: string;
  duration: string;
  thumbnail: string;
};

export const VIDEOS: Video[] = [
  {
    id: "1",
    title: "Sunday Service Highlights",
    desc: "A recap of this Sunday's powerful message.",
    duration: "12 min",
    thumbnail:
      "https://images.unsplash.com/photo-1516280440614-6697288d5d38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    title: "Worship Session Live",
    desc: "Intimate worship moments from the team.",
    duration: "8 min",
    thumbnail:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    title: "Pastor's Message",
    desc: "Weekly wisdom for your walk.",
    duration: "15 min",
    thumbnail:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
];
