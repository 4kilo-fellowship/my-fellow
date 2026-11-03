import { Program } from "@/types";
import api from "./api";

function unwrap<T>(res: any): T {
  if (res == null) return res;
  if (Array.isArray(res)) return res as any;
  if (typeof res === "object") {
    if ("data" in res) return unwrap(res.data);
    if ("programs" in res && Array.isArray(res.programs))
      return res.programs as any;
    if ("items" in res && Array.isArray(res.items)) return res.items as any;
  }
  return res;
}

export const fetchProgramsApi = async (): Promise<Program[]> => {
  const res = await api.get("/programs");
  const payload = unwrap<any>(res.data ?? res);
  return Array.isArray(payload) ? payload : [];
};

export const createProgramApi = async (data: FormData | any): Promise<Program> => {
  const isFormData = data instanceof FormData;
  const res = await api.post("/programs", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return unwrap<Program>(res.data);
};

export const updateProgramApi = async (
  id: string,
  data: FormData | any,
): Promise<Program> => {
  const isFormData = data instanceof FormData;
  const res = await api.put(`/programs/${id}`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return unwrap<Program>(res.data);
};

export const deleteProgramApi = async (id: string): Promise<boolean> => {
  const res = await api.delete(`/programs/${id}`);
  return res.data?.success !== false;
};
