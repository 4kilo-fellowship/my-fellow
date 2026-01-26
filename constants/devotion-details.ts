export type DevotionType = "text" | "voice" | "pdf" | "book";

export type Devotion = {
  id: string;
  title: string;
  author: string;
  date: string;
  views: string;
  likes: string;
  image: string;
  type: DevotionType;
  duration?: string;
};
