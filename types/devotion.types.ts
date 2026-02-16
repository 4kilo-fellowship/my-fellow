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
  // specific fields
  content?: string;
  audioUrl?: string;
  duration?: string;
  caption?: string;
  pdfUrl?: string;
  pageCount?: number;
  bookUrl?: string;
  bookFormat?: string;
  // helper field
  isLiked?: boolean;
  isSaved?: boolean;
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
