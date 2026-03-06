import {
  fetchMyOrdersApi,
  fetchProductByIdApi,
  fetchProductsApi,
  placeOrderApi,
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

  error: string | null;

  // Product actions
  fetchProducts: (reset?: boolean, limit?: number) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  setSelectedCategory: (category: string) => void;

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

      error: null,

      fetchProducts: async (reset = false, limit = 20) => {
        const currentPage = reset ? 1 : get().page;
        set({
          loading: reset ? true : get().loading,
          refreshing: reset,
          error: null,
        });

        try {
          const response = await fetchProductsApi(
            currentPage,
            limit,
            get().selectedCategory,
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

      loadMore: async () => {
        const { hasMore, loading } = get();
        if (!hasMore || loading) return;
        set({ loading: true });
        await get().fetchProducts(false);
      },
      setSelectedCategory: (category: string) => {
        set({
          selectedCategory: category,
          page: 1,
          products: [],
          loading: true,
        });
        get()
          .fetchProducts(true)
          .catch(() => set({ loading: false }));
      },

      addToCart: (product: Product, quantity: number = 1) => {
        const { cartItems } = get();
        const existing = cartItems.find(
          (item) => item.product.id === product.id,
        );

        if (existing) {
          set({
            cartItems: cartItems.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          });
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
        return get().cartItems.reduce(
          (sum, item) => sum + getProductPrice(item.product) * item.quantity,
          0,
        );
      },

      getCartCount: () => {
        return get().cartItems.reduce((sum, item) => sum + item.quantity, 0);
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
          if (response.success) {
            set({ placingOrder: false, cartItems: [], cartVisible: false });
            return response.data;
          } else {
            set({
              error: response.message || "Order failed",
              placingOrder: false,
            });
            return null;
          }
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to place order";
          set({ error: message, placingOrder: false });
          throw err;
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

      setError: (error) => set({ error }),
    }),
    {
      name: "marketplace-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
      }),
    },
  ),
);
