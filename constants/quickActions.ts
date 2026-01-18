export type QuickAction = {
  id: string;
  label: string;
  icon: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "1", label: "Programs", icon: "calendar" },
  { id: "2", label: "Locations", icon: "location" },
  { id: "3", label: "Leaders", icon: "ribbon" },
  { id: "4", label: "Teams", icon: "people" },
  { id: "5", label: "Events", icon: "easel" },
  { id: "6", label: "Gifts", icon: "gift" },
];
