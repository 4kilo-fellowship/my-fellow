import { useUserStore } from "@/stores/user.store";

export const useIsAdmin = (): boolean => {
  const user = useUserStore((s) => s.user);
  return user?.role === "admin";
};
