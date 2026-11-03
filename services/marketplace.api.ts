import {
  Order,
  OrdersApiResponse,
  Product,
  ProductsApiResponse,
  SingleResponse,
} from "@/types/marketplace.types";
import api from "./api";

export const fetchProductsApi = async (
  page: number = 1,
  limit: number = 20,
  category?: string,
): Promise<ProductsApiResponse> => {
  const params: any = { page, limit };
  if (category && category !== "All") params.category = category;

  const res = await api.get<ProductsApiResponse>("/marketplace/products", {
    params,
  });
  return res.data;
};

export const fetchProductByIdApi = async (
  id: string,
): Promise<SingleResponse<Product>> => {
  const res = await api.get<SingleResponse<Product>>(
    `/marketplace/products/${id}`,
  );
  return res.data;
};

export const createProductApi = async (
  data: FormData | any,
): Promise<SingleResponse<Product>> => {
  const isFormData = data instanceof FormData;
  const res = await api.post<SingleResponse<Product>>(
    "/marketplace/products",
    data,
    {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    },
  );
  return res.data;
};

export const updateProductApi = async (
  id: string,
  data: FormData | any,
): Promise<SingleResponse<Product>> => {
  const isFormData = data instanceof FormData;
  const res = await api.put<SingleResponse<Product>>(
    `/marketplace/products/${id}`,
    data,
    {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    },
  );
  return res.data;
};

export const deleteProductApi = async (
  id: string,
): Promise<SingleResponse<{ message: string }>> => {
  const res = await api.delete<SingleResponse<{ message: string }>>(
    `/marketplace/products/${id}`,
  );
  return res.data;
};

export const placeOrderApi = async (
  items: { productId: string; quantity: number }[],
): Promise<SingleResponse<Order>> => {
  const res = await api.post<SingleResponse<Order>>("/marketplace/orders", {
    items,
  });
  return res.data;
};

export const fetchMyOrdersApi = async (
  page: number = 1,
  limit: number = 20,
): Promise<OrdersApiResponse> => {
  const res = await api.get<OrdersApiResponse>("/marketplace/orders/my", {
    params: { page, limit },
  });
  return res.data;
};

export const fetchAllOrdersAdminApi = async (
  page: number = 1,
  limit: number = 50,
): Promise<OrdersApiResponse> => {
  const res = await api.get<OrdersApiResponse>("/marketplace/orders", {
    params: { page, limit },
  });
  return res.data;
};

export const updateOrderStatusAdminApi = async (
  id: string,
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
): Promise<SingleResponse<Order>> => {
  const res = await api.patch<SingleResponse<Order>>(
    `/marketplace/orders/${id}/status`,
    { status },
  );
  return res.data;
};

export const fetchOrderByIdApi = async (
  id: string,
): Promise<SingleResponse<Order>> => {
  const res = await api.get<SingleResponse<Order>>(`/marketplace/orders/${id}`);
  return res.data;
};
