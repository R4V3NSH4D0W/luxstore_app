import type { Product, Variant } from '@/types/api-types';
import { api } from '../lib/api-client';

export interface CartItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  variantId?: string;
  variant?: Variant;
  quantity: number;
  price: number;
  sku?: string;
  displayImage?: string | null;
}

export interface Cart {
  id: string;
  userId?: string;
  status: string;
  total: number;
  discountCode?: string;
  discountAmount?: number;
  tierDiscount?: number;
  tierDiscountRate?: number;
  items: CartItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  totalWithTax?: number;
}

export interface AddToCartParams {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CartResponse {
  cart: Cart;
}

export const cartApi = {
  getCart: () => api.get<CartResponse>('/api/cart'),

  addToCart: (params: AddToCartParams) => 
    api.post<CartResponse & { message: string; item: CartItem }>('/api/cart/items', params),

  updateCartItem: (itemId: string, quantity: number) =>
    api.patch<{ message: string; item: CartItem }>(`/api/cart/items/${itemId}`, { itemId, quantity }),

  removeCartItem: (itemId: string, cartId: string) =>
    api.delete<{ message: string }>(`/api/cart/items/${itemId}`, { itemId, cartId }),
    
  applyDiscount: (code: string, cartId: string, currency?: string) =>
      api.post<{ message: string; discount: any; total: number }>('/api/cart/apply-discount', { code, cartId, currency }),
      
  getShippingQuote: (cartId: string) =>
      api.post<any>('/api/cart/shipping/quote', { cartId }),
  moveFromWishlist: (params: AddToCartParams) =>
      api.post<{ success: true; message: string }>('/api/cart/move-from-wishlist', params),
};

import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useMoveToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.moveFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};

export const useApplyDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, cartId, currency }: { code: string; cartId: string; currency?: string }) => 
      cartApi.applyDiscount(code, cartId, currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
};
