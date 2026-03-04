import {
  Order,
  PaginatedResponse,
  Product,
  ProductsApiResponse,
  SingleResponse,
} from "@/types/marketplace.types";
import api from "./api";

export const fetchProductsApi = async (
  page: number = 1,
  limit: number = 20,
): Promise<ProductsApiResponse> => {
  const res = await api.get<ProductsApiResponse>("/marketplace/products", {
    params: { page, limit },
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

export const placeOrderApi = async (
  items: { productId: string; quantity: number }[],
): Promise<SingleResponse<Order>> => {
  const res = await api.post<SingleResponse<Order>>("/marketplace/orders", {
    items,
  });
  return res.data;
};

export const fetchMyOrdersApi = async (): Promise<PaginatedResponse<Order>> => {
  const res = await api.get<PaginatedResponse<Order>>("/marketplace/orders/my");
  return res.data;
};

export const fetchOrderByIdApi = async (
  id: string,
): Promise<SingleResponse<Order>> => {
  const res = await api.get<SingleResponse<Order>>(`/marketplace/orders/${id}`);
  return res.data;
};
