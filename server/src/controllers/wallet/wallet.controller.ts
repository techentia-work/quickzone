import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Transaction, Wallet } from "../../models/index";
 import crypto from "crypto";
import { razorpay } from "../../lib/utils/razorpay/razorpay.utils";
import { AppError, AuthRequest } from "../../lib/types/index";
import { helperServerUtils } from "../../lib/utils/helpers/helper.utils";
import { IWalletDocument } from "../../lib/types/wallet/wallet.types";
import { transactionController } from "../transaction/transaction.controller";
import { sendNotificationServerUtils } from "../../lib/notification/notification.server.utils";

export const walletController = {
  // =============================
  // USER CONTROLLERS
  // =============================
 

async createWalletTopup(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const { amount } = req.body;

    if (!amount || amount <= 0)
      throw new AppError("Invalid amount", 400);

    const wallet = await Wallet.getOrCreateWallet(
      String(userId),
      "USER"
    );

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `wallet_${wallet._id}_${Date.now()}`,
    });

    res.json({
      success: true,
      data: {
        razorpay_order_id: order.id,
        amount: order.amount,
        key: process.env.RAZORPAY_KEY_ID,
        walletId: wallet._id,
      },
    });
  } catch (err) {
    next(err);
  }
},
  async createWallet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ownerId, ownerModel, ownerName } = req.body;
      if (!ownerId || !ownerModel)
        throw new AppError("ownerId and ownerModel are required", 400);

      const existing = await Wallet.findOne({ ownerId });
      if (existing) throw new AppError("Wallet already exists", 400);

      const wallet = await Wallet.create({ ownerId, ownerModel, ownerName });
      res.status(201).json({
        success: true,
        message: "Wallet created successfully",
        data: wallet,
      });
    } catch (err) {
      next(err);
    }
  },

  async getWallet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = new mongoose.Types.ObjectId(req.user?._id);

      const wallet = await Wallet.findOne({
        ownerId,
        isActive: true,
      });
      if (!wallet) throw new AppError("Wallet not found", 404);

      // Auto-expire promo cash
      if (wallet.promoCashExpiresAt && wallet.promoCashExpiresAt < new Date()) {
        wallet.promoCash = 0;
        wallet.promoCashExpiresAt = null;
        await wallet.save();
      }

      res.json({
        success: true,
        message: "Wallet fetched successfully",
        data: wallet,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateWalletBalance(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const ownerId = new mongoose.Types.ObjectId(req.user?._id);
      const { amount } = req.body;

      if (amount == null) throw new AppError("Amount is required", 400);

      console.log("Amount", amount);

      const wallet = await Wallet.findOne(
        { ownerId },
      );
      if (!wallet) throw new AppError("Wallet not found", 404);

      const updatedWallet = await Wallet.findOneAndUpdate(
        { ownerId },
        { balance: amount },
        { new: true }
      );

      res.json({
        success: true,
        message: "Wallet balance updated successfully",
        data: updatedWallet,
      });
    } catch (err) {
      next(err);
    }
  },

  async deactivateWallet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { walletId } = req.params;
      const wallet = await Wallet.findByIdAndUpdate(
        walletId,
        { isActive: false },
        { new: true }
      );
      if (!wallet) throw new AppError("Wallet not found", 404);

      res.json({
        success: true,
        message: "Wallet deactivated successfully",
        data: wallet,
      });
    } catch (err) {
      next(err);
    }
  },

  async getPromoCash(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = new mongoose.Types.ObjectId(req.user?._id);
      const ownerModel = req.user?.role || "User";

      const wallet = await Wallet.findOne({
        ownerId,
        ownerModel,
        isActive: true,
      }).select("promoCash promoCashExpiresAt");

      if (!wallet) throw new AppError("Wallet not found", 404);

      if (wallet.promoCashExpiresAt && wallet.promoCashExpiresAt < new Date()) {
        wallet.promoCash = 0;
        wallet.promoCashExpiresAt = null;
        await wallet.save();
      }

      res.json({
        success: true,
        message: "Promo cash fetched successfully",
        data: {
          promoCash: wallet.promoCash,
          validTill: wallet.promoCashExpiresAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // =============================
  // ADMIN CONTROLLERS
  // =============================
  async getAllWallets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { filter, pagination, sort } =
        helperServerUtils.buildQuery<IWalletDocument>(
          req.query,
          ["ownerId", "ownerModel", "isActive", "createdAt", "balance"],
          "createdAt",
          ["ownerModel"]
        );

      const [wallets, total] = await Promise.all([
        Wallet.find(filter)
          .sort(sort)
          .skip(pagination.skip)
          .limit(pagination.limit),
        Wallet.countDocuments(filter),
      ]);

      // 🧮 Include pagination info in response
      const paginationInfo = {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNextPage: pagination.page * pagination.limit < total,
        hasPrevPage: pagination.page > 1,
      };

      res.json({
        success: true,
        message: "Wallets fetched successfully",
        data: {
          wallets,
          pagination: paginationInfo,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getWalletById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { walletId } = req.params;
      const wallet = await Wallet.findById(walletId);
      if (!wallet) throw new AppError("Wallet not found", 404);

      res.json({
        success: true,
        message: "Wallet fetched successfully",
        data: wallet,
      });
    } catch (err) {
      next(err);
    }
  },

  async setWalletStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { walletId } = req.params;
      const { isActive } = req.body;

      const wallet = await Wallet.findByIdAndUpdate(
        walletId,
        { isActive },
        { new: true }
      );
      if (!wallet) throw new AppError("Wallet not found", 404);

      res.json({
        success: true,
        message: `Wallet ${
          isActive ? "activated" : "deactivated"
        } successfully`,
        data: wallet,
      });
    } catch (err) {
      next(err);
    }
  },

  async adjustWalletBalance(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { walletId, amount } = req.body;
      if (!walletId || amount == null)
        throw new AppError("walletId and amount are required", 400);

      const wallet = await Wallet.findOne(
        { _id: walletId },
      );
      if (!wallet) throw new AppError("Wallet not found", 404);

      const updatedWallet = await Wallet.findOneAndUpdate(
        { _id: walletId },
        { $inc: { balance: amount } },
        { new: true }
      );

      res.json({
        success: true,
        message: "Wallet balance adjusted successfully",
        data: updatedWallet,
      });
    } catch (err) {
      next(err);
    }
  },

  async adjustPromoCash(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { walletId, amount, validDays } = req.body;
      if (!walletId || amount == null)
        throw new AppError("walletId and amount are required", 400);

      const wallet = await Wallet.findById(walletId);
      if (!wallet) throw new AppError("Wallet not found", 404);

      wallet.promoCash += amount;
      wallet.promoCashExpiresAt = validDays
        ? new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
        : wallet.promoCashExpiresAt || null;

      // wallet.balance += amount;

      await wallet.save();

      const transaction = await Transaction.create({
        type: amount >= 0 ? "CREDIT" : "DEBIT",
        amount: Math.abs(amount),
        status: "SUCCESS",
        walletId: wallet._id,
        balanceAfter: wallet.balance + wallet.promoCash,
        description: "Admin adjusted wallet balance",
        source: "PROMO",
      });

      if (!transaction) {
        return res.json({
          success: false,
          message: "Internal Error Occured",
        });
      }

      console.log("Wallet ownerid", String(wallet.ownerId));

      sendNotificationServerUtils.notify("custom", {
        user: String(wallet.ownerId),
        title: "Promo Cash Added",
        body: `You have received ₹${amount} as promo cash.`,
        meta: {
          type: "promo_cash_adjusted",
          walletId: wallet._id,
          amount: amount,
        },
      });

      res.json({
        success: true,
        message: "Promo cash adjusted successfully",
        data: wallet,
      });
    } catch (err) {
      next(err);
    }
  },

  async getPromoCashStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalPromoCash: { $sum: "$promoCash" },
            avgPromoCash: { $avg: "$promoCash" },
            usersWithPromoCash: {
              $sum: { $cond: [{ $gt: ["$promoCash", 0] }, 1, 0] },
            },
          },
        },
      ]);

      res.json({
        success: true,
        message: "Promo cash stats fetched successfully",
        data: stats[0] || {
          totalPromoCash: 0,
          avgPromoCash: 0,
          usersWithPromoCash: 0,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
