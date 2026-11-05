import {
  createProductApi,
  deleteProductApi,
  fetchAllOrdersAdminApi,
  fetchMyOrdersApi,
  fetchProductByIdApi,
  fetchProductsApi,
  placeOrderApi,
  updateOrderStatusAdminApi,
  updateProductApi,
} from "@/services/marketplace.api";
import {
  CartItem,
  getProductPrice,
  Order,
  Product,
} from "@/types/marketplace.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type MarketplaceState = {
  // Products
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  page: number;
  hasMore: boolean;
  refreshing: boolean;
  selectedCategory: string;

  // Cart
  cartItems: CartItem[];
  cartVisible: boolean;

  orders: Order[];
  ordersLoading: boolean;
  ordersPage: number;
  ordersHasMore: boolean;
  placingOrder: boolean;

  // Admin orders
  adminOrders: Order[];
  adminOrdersLoading: boolean;

  error: string | null;

  // Product actions
  fetchProducts: (
    reset?: boolean,
    limit?: number,
    categoryOverride?: string,
  ) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  createProduct: (data: FormData | any) => Promise<Product>;
  updateProduct: (id: string, data: FormData | any) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartVisible: (visible: boolean) => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Order actions
  placeOrder: () => Promise<Order | null>;
  fetchMyOrders: (reset?: boolean, limit?: number) => Promise<void>;
  loadMoreOrders: () => Promise<void>;
  fetchAdminOrders: () => Promise<void>;
  updateOrderStatus: (
    id: string,
    status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
  ) => Promise<Order | null>;

  setError: (error: string | null) => void;
};

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      products: [],
      currentProduct: null,
      loading: false,
      page: 1,
      hasMore: true,
      refreshing: false,
      selectedCategory: "All",

      cartItems: [],
      cartVisible: false,

      orders: [],
      ordersLoading: false,
      ordersPage: 1,
      ordersHasMore: true,
      placingOrder: false,

      adminOrders: [],
      adminOrdersLoading: false,

      error: null,

      fetchProducts: async (
        reset = false,
        limit = 20,
        categoryOverride?: string,
      ) => {
        const currentPage = reset ? 1 : get().page;
        set({
          loading: reset ? true : get().loading,
          refreshing: reset,
          error: null,
        });

        try {
          const categoryToFetch =
            categoryOverride !== undefined
              ? categoryOverride
              : get().selectedCategory;
          const response = await fetchProductsApi(
            currentPage,
            limit,
            categoryToFetch,
          );
          const newProducts = response.data?.products || [];
          const pagination = response.data?.pagination;
          const totalPages = pagination?.totalPages || 1;

          set({
            products: reset ? newProducts : [...get().products, ...newProducts],
            page: currentPage + 1,
            hasMore: currentPage < totalPages,
            loading: false,
            refreshing: false,
          });
        } catch (err: any) {
          set({
            error: err?.message || "Failed to fetch products",
            loading: false,
            refreshing: false,
          });
        }
      },

      fetchProductById: async (id: string) => {
        set({ loading: true, error: null, currentProduct: null });
        try {
          const response = await fetchProductByIdApi(id);
          if (response.success) {
            set({ currentProduct: response.data, loading: false });
          } else {
            set({
              error: response.message || "Product not found",
              loading: false,
            });
          }
        } catch (err: any) {
          set({
            error: err?.message || "Failed to fetch product",
            loading: false,
          });
        }
      },

      createProduct: async (data: FormData | any) => {
        const res = await createProductApi(data);
        if (res.data) {
          set((state) => ({
            products: [res.data, ...state.products],
          }));
          return res.data;
        }
        throw new Error(res.message || "Failed to create product");
      },

      updateProduct: async (id: string, data: FormData | any) => {
        const res = await updateProductApi(id, data);
        if (res.data) {
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id || (p as any)._id === id ? res.data : p,
            ),
            currentProduct:
              state.currentProduct?.id === id ||
              (state.currentProduct as any)?._id === id
                ? res.data
                : state.currentProduct,
          }));
          return res.data;
        }
        throw new Error(res.message || "Failed to update product");
      },

      deleteProduct: async (id: string) => {
        const res = await deleteProductApi(id);
        if (res.success !== false) {
          set((state) => ({
            products: state.products.filter(
              (p) => p.id !== id && (p as any)._id !== id,
            ),
          }));
          return true;
        }
        return false;
      },

      loadMore: async () => {
        const { hasMore, loading } = get();
        if (!hasMore || loading) return;
        await get().fetchProducts(false);
      },

      setSelectedCategory: (category: string) => {
        set({ selectedCategory: category });
        get().fetchProducts(true);
      },

      addToCart: (product: Product, quantity = 1) => {
        const { cartItems } = get();
        const existingItemIndex = cartItems.findIndex(
          (item) => item.product.id === product.id,
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ cartItems: updatedItems });
        } else {
          set({ cartItems: [...cartItems, { product, quantity }] });
        }
      },

      removeFromCart: (productId: string) => {
        set({
          cartItems: get().cartItems.filter(
            (item) => item.product.id !== productId,
          ),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set({
          cartItems: get().cartItems.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
        });
      },

      clearCart: () => set({ cartItems: [] }),

      setCartVisible: (visible: boolean) => set({ cartVisible: visible }),

      getCartTotal: () => {
        return get().cartItems.reduce((total, item) => {
          const price = getProductPrice(item.product);
          return total + price * item.quantity;
        }, 0);
      },

      getCartCount: () => {
        return get().cartItems.reduce(
          (count, item) => count + item.quantity,
          0,
        );
      },

      placeOrder: async () => {
        const { cartItems } = get();
        if (cartItems.length === 0) return null;

        set({ placingOrder: true, error: null });

        try {
          const items = cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          }));

          const response = await placeOrderApi(items);

          if (response.success && response.data) {
            get().clearCart();
            set({
              orders: [response.data, ...get().orders],
              placingOrder: false,
              cartVisible: false,
            });
            return response.data;
          } else {
            set({
              error: response.message || "Failed to place order",
              placingOrder: false,
            });
            return null;
          }
        } catch (err: any) {
          set({
            error:
              err?.response?.data?.message ||
              err?.message ||
              "Failed to place order",
            placingOrder: false,
          });
          return null;
        }
      },

      fetchMyOrders: async (reset = false, limit = 10) => {
        const currentPage = reset ? 1 : get().ordersPage;
        set({ ordersLoading: true, error: null });
        try {
          const response = await fetchMyOrdersApi(currentPage, limit);
          const newOrders = response.data?.orders || [];
          const pagination = response.data?.pagination;
          const totalPages = pagination?.totalPages || 1;

          set({
            orders: reset ? newOrders : [...get().orders, ...newOrders],
            ordersPage: currentPage + 1,
            ordersHasMore: currentPage < totalPages,
            ordersLoading: false,
          });
        } catch (err: any) {
          set({
            error: err?.message || "Failed to fetch orders",
            ordersLoading: false,
          });
        }
      },

      loadMoreOrders: async () => {
        const { ordersHasMore, ordersLoading } = get();
        if (!ordersHasMore || ordersLoading) return;
        await get().fetchMyOrders(false);
      },

      fetchAdminOrders: async () => {
        set({ adminOrdersLoading: true });
        try {
          const response = await fetchAllOrdersAdminApi(1, 100);
          set({
            adminOrders: response.data?.orders || [],
            adminOrdersLoading: false,
          });
        } catch (err: any) {
          set({
            error: err?.message || "Failed to fetch admin orders",
            adminOrdersLoading: false,
          });
        }
      },

      updateOrderStatus: async (id, status) => {
        try {
          const res = await updateOrderStatusAdminApi(id, status);
          if (res.data) {
            set((state) => ({
              adminOrders: state.adminOrders.map((o) =>
                o.id === id ? res.data : o,
              ),
              orders: state.orders.map((o) => (o.id === id ? res.data : o)),
            }));
            return res.data;
          }
          return null;
        } catch (err: any) {
          set({ error: err?.message || "Failed to update order status" });
          return null;
        }
      },

      setError: (error) => set({ error }),
    }),
    {
      name: "marketplace-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
        products: state.products,
      }),
    },
  ),
);
