import { Leader } from "@/types/leader.types";
import api from "./api";

function unwrap<T>(res: any): T {
  if (res == null) return res;
  if (Array.isArray(res)) return res as any;
  if (typeof res === "object") {
    if ("data" in res) return unwrap(res.data);
    if ("leaders" in res && Array.isArray(res.leaders))
      return res.leaders as any;
    if ("items" in res && Array.isArray(res.items)) return res.items as any;
  }
  return res;
}

export const fetchLeadersApi = async (): Promise<Leader[]> => {
  const res = await api.get("/leaders");
  const payload = unwrap<any>(res.data ?? res);
  return Array.isArray(payload) ? payload : [];
};
