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

export const placeOrderApi = async (
  items: { productId: string; quantity: number }[],
): Promise<SingleResponse<Order>> => {
  const res = await api.post<SingleResponse<Order>>("/marketplace/orders", {
    items,
  });
  return res.data;
};

export const fetchMyOrdersApi = async (): Promise<OrdersApiResponse> => {
  const res = await api.get<OrdersApiResponse>("/marketplace/orders/my");
  return res.data;
};

export const fetchOrderByIdApi = async (
  id: string,
): Promise<SingleResponse<Order>> => {
  const res = await api.get<SingleResponse<Order>>(`/marketplace/orders/${id}`);
  return res.data;
};
