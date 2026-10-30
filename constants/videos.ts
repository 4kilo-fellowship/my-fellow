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

export const VIDEOS: Video[] = [
  {
    id: "1",
    title: "Sunday Service Highlights — The Unshakable Kingdom",
    desc: "A powerful recap of Sunday worship, scripture meditation, and practical spiritual guidance for campus life.",
    duration: "10:04",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    speaker: "Pastor Dawit & Worship Team",
    views: "1.4k views",
    publishedAt: "2 days ago",
  },
  {
    id: "2",
    title: "Live Acoustic Worship Night — 4 Kilo Fellowship",
    desc: "Intimate acoustic worship moments and intercession with the fellowship choir.",
    duration: "10:53",
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    speaker: "Fellowship Choir",
    views: "2.1k views",
    publishedAt: "5 days ago",
  },
  {
    id: "3",
    title: "Freshman Orientation & Campus Walk of Faith",
    desc: "Encouragement, university tips, and elder student testimonies for new 4 Kilo campus students.",
    duration: "15:00",
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    speaker: "Elder Committee",
    views: "890 views",
    publishedAt: "1 week ago",
  },
  {
    id: "4",
    title: "Bible Study: Foundations in the Gospel of John",
    desc: "Deep inductive study through John chapter 1 focusing on the deity of Christ and discipleship.",
    duration: "12:30",
    thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    speaker: "Dr. Samuel Kebede",
    views: "1.1k views",
    publishedAt: "2 weeks ago",
  },
  {
    id: "5",
    title: "Prayer Night Exhortation — Standing in the Gap",
    desc: "Exhortation on persistent prayer, university evangelism, and national intercession.",
    duration: "08:45",
    thumbnail: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    speaker: "Prayer Ministry",
    views: "760 views",
    publishedAt: "3 weeks ago",
  },
  {
    id: "6",
    title: "Annual Fellowship Conference Recap & Testimonies",
    desc: "Highlights and testimonies from the 2026 Annual AAU Christian Students Fellowship Conference.",
    duration: "12:14",
    thumbnail: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    speaker: "ECSF Media & Guest Speakers",
    views: "3.5k views",
    publishedAt: "1 month ago",
  },
];
