import mongoose from "mongoose";

// src/lib/types/index.ts (additions)
export interface IWishlistItem {
  productId: mongoose.Types.ObjectId;
  variantId: mongoose.Types.ObjectId;
  title?: string;
}

export interface IWishlistDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  items: IWishlistItem[];
}

export type WishlistModelType = mongoose.Model<IWishlistDocument>;
