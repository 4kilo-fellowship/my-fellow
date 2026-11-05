export type Video = {
  id: string;
  title: string;
  desc: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  speaker?: string;
  views?: string;
  publishedAt?: string;
};

export const DEFAULT_VIDEOS: Video[] = [
  {
    id: "living-hope",
    title: "Living Hope — Because Jesus Lives, We Have Hope",
    desc: "Because of God’s great mercy, Jesus rose from the dead to give us a new life and a hope that never dies (1 Peter 1:3-4). A powerful Easter resurrection reflection by 4 Kilo Fellowship.",
    duration: "1:59",
    thumbnail:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793867306/my-fellow/video-thumbnails/zskekkbkswokugnfveaf.jpg",
    videoUrl:
      "https://res.cloudinary.com/doi9bg69o/video/upload/v1793867387/my-fellow/videos/jglnmemtd46ucpurb4qd.mp4",
    speaker: "4 Kilo Fellowship Media & Ministry",
    views: "1.2k views",
    publishedAt: "Recently",
  },
  {
    id: "sunday-service-highlights",
    title: "Sunday Service Highlights — The Unshakable Kingdom",
    desc: "A powerful recap of Sunday worship, scripture meditation, and practical spiritual guidance for campus life.",
    duration: "10:04",
    thumbnail:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    speaker: "Pastor Dawit & Worship Team",
    views: "1.4k views",
    publishedAt: "2 days ago",
  },
  {
    id: "acoustic-worship-night",
    title: "Live Acoustic Worship Night — 4 Kilo Fellowship",
    desc: "Intimate acoustic worship moments and intercession with the fellowship choir.",
    duration: "10:53",
    thumbnail:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    speaker: "Fellowship Choir",
    views: "2.1k views",
    publishedAt: "5 days ago",
  },
  {
    id: "freshman-orientation",
    title: "Freshman Orientation & Campus Walk of Faith",
    desc: "Encouragement, university tips, and elder student testimonies for new 4 Kilo campus students.",
    duration: "15:00",
    thumbnail:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    speaker: "Elder Committee",
    views: "890 views",
    publishedAt: "1 week ago",
  },
];

export const VIDEOS = DEFAULT_VIDEOS;
