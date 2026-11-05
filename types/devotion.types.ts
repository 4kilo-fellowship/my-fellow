export type DevotionType = "text" | "voice" | "pdf" | "book";

export interface Devotion {
  _id: string;
  title: string;
  author: string;
  date: string;
  type: DevotionType;
  image: string;
  views: number;
  likes: number;
  tags: string[];
  featured: boolean;
  content?: string;
  audioUrl?: string;
  duration?: string;
  caption?: string; // Voice caption / transcript or devotional text snippet
  pageCount?: number;
  bookFormat?: string;
  pdfUrl?: string;
  bookUrl?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  likesFormatted?: string;
  viewsFormatted?: string;
}

export interface DevotionResponse {
  success: boolean;
  data: Devotion[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface SingleDevotionResponse {
  success: boolean;
  data: Devotion;
}
