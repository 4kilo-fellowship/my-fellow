import { useUserStore } from "@/stores/user.store";

export const useIsAdmin = (): boolean => {
  const user = useUserStore((s) => s.user);
  const role = user?.role?.toLowerCase();
  return role === "super_admin" || role === "admin" || role === "leader";
};
