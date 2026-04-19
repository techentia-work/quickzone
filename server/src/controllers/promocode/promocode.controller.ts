// src/controllers/promocode.controller.ts

import { Response } from "express";
import mongoose from "mongoose";
import { PromoCode, Cart } from "../../models/index";
import { AppError, AuthRequest } from "../../lib/types/index";

export const promoController = {
    // Apply promo code to cart
    applyPromo: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { code } = req.body;

        if (!code) {
            throw new AppError("Promo code is required", 400);
        }

        // Find promo code
        const promo = await PromoCode.findOne({ code: code.toUpperCase() });
        if (!promo) {
            throw new AppError("Invalid promo code", 404);
        }

        // Find user cart
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            throw new AppError("Cart is empty", 400);
        }

        // Check if promo is already applied
        if (cart.appliedPromo && cart.appliedPromo.code === code.toUpperCase()) {
            throw new AppError("Promo code is already applied", 400);
        }

        // Validate promo code
        promo.validatePromoCode(cart.subTotal);

        // Check per-user limit
        const canApply = await PromoCode.canBeAppliedByUser(userId, code);
        if (!canApply) {
            throw new AppError(`You have reached the maximum usage limit for this promo code`, 400);
        }

        // Calculate discount
        const discount = promo.calculatePromoDiscount(cart.subTotal);

        if (discount <= 0) {
            throw new AppError("Promo code provides no discount for current cart", 400);
        }

        // Apply promo to cart
        cart.appliedPromo = {
            code: promo.code,
            discountAmount: discount
        };

        await cart.save();

        await cart.populate({
            path: "items.productId",
            select: "name mainImage slug"
        });

        res.json({
            success: true,
            message: "Promo code applied successfully",
            data: {
                discount,
                promoCode: promo.code,
                cart
            }
        });
    },

    // Remove promo code from cart
    removePromo: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new AppError("Cart not found", 404);
        }

        if (!cart.appliedPromo) {
            throw new AppError("No promo code applied to cart", 400);
        }

        // Remove promo
        cart.appliedPromo = undefined;
        await cart.save();

        await cart.populate({
            path: "items.productId",
            select: "name mainImage slug"
        });

        res.json({
            success: true,
            message: "Promo code removed successfully",
            data: { cart }
        });
    },

    // Validate promo code without applying
    validatePromo: async (req: AuthRequest, res: Response) => {
        const userId = new mongoose.Types.ObjectId(req.user?._id);
        const { code } = req.body;

        if (!code) {
            throw new AppError("Promo code is required", 400);
        }

        // Find promo code
        const promo = await PromoCode.findOne({ code: code.toUpperCase() });
        if (!promo) {
            throw new AppError("Invalid promo code", 404);
        }

        // Find user cart
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            throw new AppError("Cart is empty", 400);
        }

        // Validate promo code
        promo.validatePromoCode(cart.subTotal);

        // Check per-user limit
        const canApply = await PromoCode.canBeAppliedByUser(userId, code);
        if (!canApply) {
            throw new AppError(`You have reached the maximum usage limit for this promo code`, 400);
        }

        // Calculate discount
        const discount = promo.calculatePromoDiscount(cart.subTotal);

        res.json({
            success: true,
            valid: true,
            message: "Promo code is valid",
            data: {
                discount,
                promoCode: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue
            }
        });
    }
};
