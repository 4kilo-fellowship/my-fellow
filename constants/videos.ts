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
    title: "Living Hope",
    desc: "Because of God’s great mercy, Jesus rose from the dead to give us a new life and a hope that never dies (1 Peter 1:3-4). A powerful Easter reflection on the living hope we have through Christ's resurrection.",
    duration: "1:59",
    thumbnail:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793867306/my-fellow/video-thumbnails/zskekkbkswokugnfveaf.jpg",
    videoUrl:
      "https://res.cloudinary.com/doi9bg69o/video/upload/v1793867387/my-fellow/videos/jglnmemtd46ucpurb4qd.mp4",
  },
  {
    id: "following-the-king",
    title: "ንጉሱን እንዴት እንከተለው",
    desc: "በብሔራዊ የአመራር ሥልጠና (NLS 2024) ላይ በእዮስያስ ፀጋዬ የተሰጠ ጥልቅ ትምህርት — ንጉሱን ክርስቶስን በሕይወታችንና በዩኒቨርሲቲ ቆይታችን በታማኝነት እንዴት እንደምንከተል።",
    duration: "42:42",
    thumbnail:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793871738/my-fellow/video-thumbnails/following-the-king-thumb.jpg",
    videoUrl:
      "https://res.cloudinary.com/doi9bg69o/video/upload/my-fellow/videos/following-the-king-video.mp4",
    speaker: "እዮስያስ ፀጋዬ",
    publishedAt: "NLS 2024",
  },
  {
    id: "amelkewalew-worship",
    title: "አመልከዋለው | መልሕቅ ኳየር",
    desc: "የመልሕቅ ኳየር ድንቅ የአምልኮና የምስጋና ዝማሬ — ልብን ወደ እግዚአብሔር ክብርና ጸጋ የሚያቀርብ መንፈሳዊ ህብረት።",
    duration: "20:20",
    thumbnail:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793874015/my-fellow/video-thumbnails/amelkewalew-thumb.jpg",
    videoUrl:
      "https://res.cloudinary.com/doi9bg69o/video/upload/my-fellow/videos/amelkewalew-video.mp4",
    speaker: "መልሕቅ ኳየር",
    publishedAt: "EvaSUE Worship",
  },
  {
    id: "mere-christianity-review",
    title: "Mere Christianity Book Review — Part 7",
    desc: "A thoughtful and enriching study on C.S. Lewis's classic 'Mere Christianity' (Part 7) exploring the Christian foundation of faith, virtue, and eternity with Ebenezer Tadese.",
    duration: "10:27",
    thumbnail:
      "https://res.cloudinary.com/doi9bg69o/image/upload/v1793873493/my-fellow/video-thumbnails/mere-christianity-thumb.jpg",
    videoUrl:
      "https://res.cloudinary.com/doi9bg69o/video/upload/v1793874491/my-fellow/videos/mere-christianity-video.mp4",
    speaker: "Ebenezer Tadese",
    publishedAt: "Book Review Series",
  },
];

export const VIDEOS = DEFAULT_VIDEOS;
