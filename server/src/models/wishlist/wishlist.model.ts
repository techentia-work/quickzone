// src/models/wishlist.model.ts
import mongoose from "mongoose";
import { IWishlistDocument, IWishlistItem, WishlistModelType } from "../../lib/types/index";

const WishlistItemSchema = new mongoose.Schema<IWishlistItem>(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String },
  },
  { _id: false }
);

const WishlistSchema = new mongoose.Schema<IWishlistDocument, WishlistModelType>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [WishlistItemSchema],
  },
  { timestamps: true }
);

// Index for efficient lookups
WishlistSchema.index({ userId: 1 });

export const Wishlist = mongoose.model<IWishlistDocument, WishlistModelType>("Wishlist", WishlistSchema);
