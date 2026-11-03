import { useUserStore } from "@/stores/user.store";

export const useCanPublishVideos = (): boolean => {
  const role = useUserStore((state) => state.user?.role);
  return role === "super_admin" || role === "leader" || role === "admin";
};
