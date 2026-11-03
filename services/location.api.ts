import api from "./api";

function unwrap<T>(res: any): T {
  if (res == null) return res;
  if (Array.isArray(res)) return res as any;
  if (typeof res === "object") {
    if ("data" in res) return unwrap(res.data);
    if ("locations" in res && Array.isArray(res.locations))
      return res.locations as any;
    if ("results" in res && Array.isArray(res.results))
      return res.results as any;
  }
  return res;
}

export const fetchLocationsApi = async (): Promise<any[]> => {
  const res = await api.get("/locations");
  const payload = unwrap<any>(res.data ?? res);
  return Array.isArray(payload) ? payload : [];
};

export const createLocationApi = async (data: FormData | any): Promise<any> => {
  const isFormData = data instanceof FormData;
  const res = await api.post("/locations", data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return unwrap<any>(res.data);
};

export const updateLocationApi = async (
  id: string,
  data: FormData | any,
): Promise<any> => {
  const isFormData = data instanceof FormData;
  const res = await api.put(`/locations/${id}`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return unwrap<any>(res.data);
};

export const deleteLocationApi = async (id: string): Promise<boolean> => {
  const res = await api.delete(`/locations/${id}`);
  return res.data?.success !== false;
};
