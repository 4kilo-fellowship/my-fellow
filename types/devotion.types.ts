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
  // Type-specific fields
  content?: string;
  audioUrl?: string;
  duration?: string;
  caption?: string;
  pdfUrl?: string;
  pageCount?: number;
  bookUrl?: string;
  bookFormat?: string;
  // UI helper field
  isLiked?: boolean;
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
