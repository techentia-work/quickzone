// src/controllers/wishlist.controller.ts
import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Wishlist, Product } from "../../models/index";
import { AppError, AuthRequest } from "../../lib/types/index";

export const wishlistController = {
  // Get wishlist by user
  getWishlist: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: "items.productId",
      select: "name mainImage slug variants",
    });

    if (!wishlist) {
      return res.json({
        success: true,
        message: "Wishlist fetched successfully",
        data: { items: [] },
      });
    }

    res.json({
      success: true,
      message: "Wishlist fetched successfully",
      data: wishlist,
    });
  },

  // Add an item to wishlist
  addItem: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const { productId, variantId } = req.body;

    if (!productId || !variantId) {
      throw new AppError("Product ID and Variant ID are required", 400);
    }

    if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(variantId)) {
      throw new AppError("Invalid Product/Variant ID", 400);
    }

    const product = await Product.findById(productId);
    if (!product) throw new AppError("Product not found", 404);
    if (!product.isActive || product.isDeleted) throw new AppError("Product is not available", 400);

    const variant = product.variants.find((v) => (v._id as Types.ObjectId).toString() === variantId);
    if (!variant) throw new AppError("Variant not found", 404);

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) wishlist = new Wishlist({ userId, items: [] });

    const exists = wishlist.items.some((item) => item.variantId.equals(variantId));
    if (exists) throw new AppError("Item already exists in wishlist", 400);

    wishlist.items.push({
      productId: product._id as Types.ObjectId,
      variantId: variant._id as Types.ObjectId,
      title: variant.title || product.name,
    });

    await wishlist.save();

    await wishlist.populate({
      path: "items.productId",
      select: "name mainImage slug variants",
    });

    res.json({ success: true, message: "Item added to wishlist successfully", data: wishlist });
  },

  // Remove an item from wishlist
  removeItem: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const { variantId } = req.params;

    if (!variantId) throw new AppError("Variant ID is required", 400);

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) throw new AppError("Wishlist not found", 404);

    const exists = wishlist.items.some((item) => item.variantId.equals(variantId as string));
    if (!exists) throw new AppError("Item not found in wishlist", 404);

    wishlist.items = wishlist.items.filter((item) => !item.variantId.equals(variantId as string));

    await wishlist.save();

    await wishlist.populate({
      path: "items.productId",
      select: "name mainImage slug variants",
    });

    res.json({ success: true, message: "Item removed from wishlist successfully", data: wishlist });
  },

  // Clear wishlist
  clearWishlist: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) throw new AppError("Wishlist not found", 404);

    wishlist.items = [];
    await wishlist.save();

    res.json({ success: true, message: "Wishlist cleared successfully", data: wishlist });
  },
};
