// ---------- CART ITEM ----------
export interface CartItemType {
  productId: {
    _id: string;
    name: string;
    slug: string;
    mainImage: string;
  };
  variantId: string;
  title?: string;
  price: number;
  quantity: number;
  discountPercent?: number;
  discountedPrice?: number;
  totalPrice?: number;
  product?: {
    _id: string;
    name: string;
    thumbnail?: string;
    price: number;
  };
}

// ---------- CART ----------
export interface CartType {
  _id?: string;
  userId: string;
  items: CartItemType[];
  subTotal: number;
  handlingCharge: number;
  deliveryCharge: number;
  totalAmount: number;
  appliedPromo?: {
    code?: string;
    discountAmount?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}