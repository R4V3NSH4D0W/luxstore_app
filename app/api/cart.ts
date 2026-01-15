import type { Product, Variant } from '@/types/api-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  formattedPrice?: string;
  formattedTotal?: string;
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
  formattedDiscountAmount?: string;
  tierDiscount?: number;
  formattedTierDiscount?: string;
  tierDiscountRate?: number;
  items: CartItem[];
  subtotal?: number;
  formattedSubtotal?: string;
  taxRate?: number;
  taxAmount?: number;
  formattedTaxAmount?: string;
  totalWithTax?: number;
  formattedTotal?: string;
  potentialPoints?: number;
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
  getCart: () => api.get<CartResponse>('/api/v1/cart'),

  addToCart: (params: AddToCartParams) =>
    api.post<CartResponse & { message: string; item: CartItem }>('/api/v1/cart/items', params),

  updateCartItem: (itemId: string, quantity: number) =>
    api.patch<{ message: string; item: CartItem }>(`/api/v1/cart/items/${itemId}`, { itemId, quantity }),

  removeCartItem: (itemId: string, cartId: string) =>
    api.delete<{ message: string }>(`/api/v1/cart/items/${itemId}`, { itemId, cartId }),

  applyDiscount: (code: string, cartId: string) =>
    api.post<{ message: string; discount: any; total: number }>('/api/v1/cart/apply-discount', { code, cartId }),

  getShippingQuote: (cartId: string) =>
    api.post<any>('/api/v1/cart/shipping/quote', { cartId }),
  moveFromWishlist: (params: AddToCartParams) =>
    api.post<{ success: true; message: string }>('/api/v1/cart/move-from-wishlist', params),
};


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
    mutationFn: ({ code, cartId }: { code: string; cartId: string }) =>
      cartApi.applyDiscount(code, cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
};
