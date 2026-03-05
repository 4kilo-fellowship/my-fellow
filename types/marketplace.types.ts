export interface Product {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: string | number;
  stock?: number;
  imageUrls?: string[];
  image?: string;
  imageUrl?: string;
  category?: string;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price?: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  totalAmount?: number;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsApiResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface OrdersApiResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

/** Helper to get the numeric price from a product */
export const getProductPrice = (product: Product): number => {
  if (product.price === undefined || product.price === null) return 0;
  return typeof product.price === "string"
    ? parseFloat(product.price) || 0
    : product.price;
};

/** Helper to get the first image URL */
export const getProductImage = (product: Product): string => {
  return product.imageUrls?.[0] || "https://via.placeholder.com/300";
};

/** Helper to get all available image URLs */
export const getProductImages = (product: Product): string[] => {
  if (product.imageUrls && product.imageUrls.length > 0) {
    return product.imageUrls;
  }
  return [
    product.image || product.imageUrl || "https://via.placeholder.com/300",
  ];
};
