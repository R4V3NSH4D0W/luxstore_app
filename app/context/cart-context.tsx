import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext } from "react";
import { AddToCartParams, Cart, cartApi } from "../api/cart";
import { useAuth } from "./auth-context";
import { useToast } from "./toast-context";

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  totalItems: number;
  addToCart: (params: AddToCartParams) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  refreshCart: () => void;
  isAddingToCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { userToken } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch Cart
  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.cart;
    },
    enabled: !!userToken, // Only fetch if authenticated
    retry: false,
  });

  const cart = data || null;

  const refreshCart = () => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  // Mutations
  const addToCartMutation = useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      showToast("Added to bag", "success");
    },
    onError: (error: any) => {
      console.error("Add to cart error", error);
      showToast("Failed to add to bag", "error");
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ itemId, cartId }: { itemId: string; cartId: string }) =>
      cartApi.removeCartItem(itemId, cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      showToast("Item removed from bag", "info");
    },
  });

  // Calculate total items
  const totalItems =
    cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const addToCart = (params: AddToCartParams) => {
    if (!userToken) {
      showToast("Please sign in to add items", "info");
      router.push("/(auth)/login");
      return;
    }
    addToCartMutation.mutate(params);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    updateItemMutation.mutate({ itemId, quantity });
  };

  const removeFromCart = (itemId: string) => {
    if (!cart?.id) return;
    removeItemMutation.mutate({ itemId, cartId: cart.id });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        totalItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        isAddingToCart: addToCartMutation.isPending,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
