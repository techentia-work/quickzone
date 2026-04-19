"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AddToCartPayload,
  RemoveCartItemPayload,
  ClearCartPayload,
  UpdateCartQuantityPayload,
} from "@/lib/types/cart/cart.payload";
import cartApi from "@/lib/api/cart/cart.api";
import { CartType } from "@/lib/types/cart/cart.types";
import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import toast from "react-hot-toast";

export function useCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // 🛒 Fetch user's cart
  const cartQuery = useQuery<{ cart: CartType }>({
    queryKey: ["cart", user?._id],
    queryFn: async () => {
      const res = await cartApi.getUserCart();
      if (!res.data) {
        throw new Error("Failed to fetch cart data");
      }
      return res.data;
    },
    enabled: !!user?._id,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // ➕ Add item
  const addItem = useMutation({
    mutationFn: (payload: AddToCartPayload) => cartApi.addItem(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      if (res.success) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    }
  });

  // 🔄 Update quantity
  const updateQuantity = useMutation({
    mutationFn: (payload: UpdateCartQuantityPayload) =>
      cartApi.updateItemQuantity(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  // ❌ Remove item
  const removeItem = useMutation({
    mutationFn: (payload: RemoveCartItemPayload) => cartApi.removeItem(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  // 🧹 Clear cart
  const clearCart = useMutation({
    mutationFn: (payload: ClearCartPayload) => cartApi.clearCart(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  // 🧠 Return full set of utilities + direct cart
  return {
    cart: cartQuery.data ?? null, // ⬅️ direct cart object
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    refetch: cartQuery.refetch,

    totalItems: cartQuery.data?.cart?.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0,

    addItem: addItem.mutateAsync,
    updateQuantity: updateQuantity.mutateAsync,
    removeItem: removeItem.mutateAsync,
    clearCart: clearCart.mutateAsync,
  };
}
