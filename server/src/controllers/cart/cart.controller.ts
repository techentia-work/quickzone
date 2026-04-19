// src/controllers/cart.controller.ts

import { Request, Response } from "express";
import mongoose, { isValidObjectId, Types } from "mongoose";
import { Cart, Product } from "../../models/index";
import { AppError, AuthRequest } from "../../lib/types/index";

export const cartController = {
    // Get user cart by userId
    getCart: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);

        const cart = await Cart.findOne({ userId }).populate({
            path: "items.productId",
            select: "name mainImage slug categoryId"
        });

        if (!cart) {
            return res.json({
                success: true,
                message: "Cart fetched successfully",
                data: {
                    items: [],
                    subTotal: 0,
                    totalTax: 0,
                    totalAmount: 0,
                    appliedPromo: null,
                    handlingCharge: 0,
                    deliveryCharge: 0,
                }
            });
        }

        res.json({ success: true, message: "Cart fetched successfully", data: { cart } });
    },

    // Add item to cart or update quantity if exists
    addItem: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { productId, variantId, quantity = 1 } = req.body;

        if (!productId || !variantId) {
            throw new AppError("Product ID and Variant ID are required", 400);
        }

        if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(variantId)) {
            throw new AppError("Invalid Product/Variant ID", 400);
        }

        if (quantity < 1) {
            throw new AppError("Quantity must be at least 1", 400);
        }

        // Fetch product and variant details
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError("Product not found", 404);
        }

        if (!product.isActive || product.isDeleted) {
            throw new AppError("Product is not available", 400);
        }

        const variant = product.variants.find((v) => (v._id as Types.ObjectId).toString() === variantId);

        if (!variant) {
            throw new AppError("Variant not found", 404);
        }

        // Check stock availability
        if (variant.inventoryType === "LIMITED") {
            if (!variant.stock || variant.stock < quantity) {
                throw new AppError(`Only ${variant.stock || 0} units available in stock`, 400);
            }
        }

        // Check variant status
        if (variant.status !== "AVAILABLE") {
            throw new AppError("Variant is not available", 400);
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex((item) => item.variantId.equals(variantId));

        if (existingItemIndex > -1) {
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;

            // Check max quantity per user
            if (product.maxQtyPerUser && newQuantity > product.maxQtyPerUser) {
                throw new AppError(`Maximum ${product.maxQtyPerUser} units allowed per user`, 400);
            }

            // Check stock for updated quantity
            if (variant.inventoryType === "LIMITED") {
                if (!variant.stock || variant.stock < newQuantity) {
                    throw new AppError(`Only ${variant.stock || 0} units available in stock`, 400);
                }
            }

            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].price = variant.price;
            cart.items[existingItemIndex].discountPercent = variant.discountPercent || 0;
            cart.items[existingItemIndex].taxRate = product.taxRate;
            cart.items[existingItemIndex].title = variant.title || product.name;
        } else {
            // Check max quantity per user for new item
            if (product.maxQtyPerUser && quantity > product.maxQtyPerUser) {
                throw new AppError(`Maximum ${product.maxQtyPerUser} units allowed per user`, 400);
            }

            // Add new item to cart
            cart.items.push({
                productId: product._id as Types.ObjectId,
                variantId: variant._id as Types.ObjectId,
                title: variant.title || product.name,
                price: variant.price,
                quantity,
                discountPercent: variant.discountPercent || 0,
                taxRate: product.taxRate
            });
        }

        // Remove applied promo when cart items change
        if (cart.appliedPromo) {
            cart.appliedPromo = undefined;
        }

        await cart.save();

        await cart.populate({
            path: "items.productId",
            select: "name mainImage slug categoryId"
        });

        res.json({ success: true, message: "Item added to cart successfully", data: { cart } });
    },

    // Update item quantity (increase/decrease)
    updateItemQuantity: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { variantId, quantity } = req.body;

        if (!variantId) {
            throw new AppError("Variant ID is required", 400);
        }

        if (!quantity || quantity < 1) {
            throw new AppError("Quantity must be at least 1", 400);
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new AppError("Cart not found", 404);
        }

        const itemIndex = cart.items.findIndex((item) => item.variantId.equals(variantId));
        if (itemIndex === -1) {
            throw new AppError("Item not found in cart", 404);
        }

        const item = cart.items[itemIndex];

        // Fetch product and variant to check stock
        const product = await Product.findById(item.productId);
        if (!product) {
            throw new AppError("Product not found", 404);
        }

        if (!product.isActive || product.isDeleted) {
            throw new AppError("Product is no longer available", 400);
        }

        const variant = product.variants.find((v) => (v._id as Types.ObjectId).toString() === variantId);
        if (!variant) {
            throw new AppError("Variant not found", 404);
        }

        if (variant.status !== "AVAILABLE") {
            throw new AppError("Variant is not available", 400);
        }

        // Check stock availability
        if (variant.inventoryType === "LIMITED") {
            if (!variant.stock || variant.stock < quantity) {
                throw new AppError(`Only ${variant.stock || 0} units available in stock`, 400);
            }
        }

        // Check max quantity per user
        if (product.maxQtyPerUser && quantity > product.maxQtyPerUser) {
            throw new AppError(`Maximum ${product.maxQtyPerUser} units allowed per user`, 400);
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].price = variant.price;
        cart.items[itemIndex].discountPercent = variant.discountPercent || 0;
        cart.items[itemIndex].taxRate = product.taxRate;

        // Remove applied promo when cart items change
        // if (cart.appliedPromo) {
        //     cart.appliedPromo = undefined;
        // }

        await cart.save();

        await cart.populate({
            path: "items.productId",
            select: "name mainImage slug categoryId"
        });

        res.json({ success: true, message: "Cart updated successfully", data: { cart } });
    },

    // Remove item from cart
    removeItem: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { variantId } = req.params;

        if (!variantId) {
            throw new AppError("Variant ID is required", 400);
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new AppError("Cart not found", 404);
        }

        const itemExists = cart.items.some((item) => item.variantId.equals(variantId as string));
        if (!itemExists) {
            throw new AppError("Item not found in cart", 404);
        }

        cart.items = cart.items.filter((item) => !item.variantId.equals(variantId as string));

        // Remove applied promo when cart items change
        if (cart.appliedPromo) {
            cart.appliedPromo = undefined;
        }

        await cart.save();

        await cart.populate({
            path: "items.productId",
            select: "name mainImage slug categoryId"
        });

        res.json({ success: true, message: "Item removed from cart successfully", data: { cart } });
    },

    // Clear entire cart
    clearCart: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new AppError("Cart not found", 404);
        }

        cart.items = [];
        cart.appliedPromo = undefined;
        await cart.save();

        res.json({ success: true, message: "Cart cleared successfully", data: { cart } });
    },
};
