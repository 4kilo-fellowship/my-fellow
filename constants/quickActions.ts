export type QuickAction = {
  id: string;
  label: string;
  icon: string;
  isNew?: boolean;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "1", label: "Programs", icon: "calendar" },
  { id: "2", label: "Locations", icon: "location" },
  { id: "3", label: "Leaders", icon: "ribbon" },
  { id: "store", label: "Store", icon: "storefront" },
  { id: "4", label: "Teams", icon: "people" },
  { id: "challenges", label: "Challenges", icon: "trophy", isNew: true },
  { id: "alumni", label: "Alumni", icon: "school", isNew: true },
  { id: "pcs", label: "PCS", icon: "shield-checkmark", isNew: true },
  { id: "5", label: "Telegram", icon: "telegram" },
  { id: "6", label: "Tik Tok", icon: "tiktok" },
  { id: "7", label: "Gifts", icon: "gift" },
  { id: "8", label: "Instagram", icon: "instagram" },
];
