export type NotificationType =
  | "event"
  | "product"
  | "announcement"
  | "devotion"
  | "general";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl?: string;
  targetRoute?: string;
  targetParams?: Record<string, string>;
  read: boolean;
  createdAt: string;
}
