  // ---------- CART PAYLOADS ----------
  export interface AddToCartPayload {
    productId: string;
    variantId: string;
    quantity?: number;
  }

  export interface UpdateCartQuantityPayload {
    productId: string;
    variantId: string;
    quantity: number;
  }

  export interface RemoveCartItemPayload {
    variantId: string;
  }

  export interface ClearCartPayload {
    userId: string;
  }
