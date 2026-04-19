import { CartType } from "@/lib/types/cart/cart.types";
import axiosClient from "../client/axios";
import {
  AddToCartPayload,
  ClearCartPayload,
  RemoveCartItemPayload,
  UpdateCartQuantityPayload,
} from "@/lib/types/cart/cart.payload";

export const cartApi = {
  // 🔹 Get current user's cart
  getUserCart: () => axiosClient.get<{ cart: CartType }>("/api/cart"),

  // 🔹 Add item to cart or update quantity if it exists
  addItem: (payload: AddToCartPayload) =>
    axiosClient.post<{ cart: CartType }>("/api/cart/add", payload),

  // 🔹 Update item quantity
  updateItemQuantity: (payload: UpdateCartQuantityPayload) =>
    axiosClient.patch<{ cart: CartType }>("/api/cart/update", payload),

  // 🔹 Remove item from cart
  removeItem: (payload: RemoveCartItemPayload) =>
    axiosClient.delete<{ cart: CartType }>(
      `/api/cart/remove/${payload.variantId}`
    ),

  // 🔹 Clear entire cart
  clearCart: (payload: ClearCartPayload) =>
    axiosClient.delete<{ cart: CartType }>("/api/cart/clear", {
      data: payload,
    }),
};

export default cartApi;
