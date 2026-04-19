import { Response } from "express";
import mongoose from "mongoose";
import { AppError, AuthRequest } from "../../lib/types/index";
import {
  User,
  Wallet,
  Order,
  Address,
  PromoCode,
  Cart,
  Transaction,
} from "../../models/index";
import { helperServerUtils } from "../../lib/utils/helpers/helper.utils";

export const userController = {
  async profile(req: AuthRequest, res: Response) {
    const user = await User.findById(req.user?._id).select("-password");
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, user });
  },

  async updateProfile(req: AuthRequest, res: Response) {
    const body = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { ...body },
      { new: true }
    ).select("-password");
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, message: "Profile updated", user });
  },

  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const { filter, pagination, sort } = helperServerUtils.buildQuery(
        req.query,
        ["isActive"],
        "createdAt",
        ["name", "email", "phone"]
      );

      const [users, totalUsers, activeUsers, deletedUsers] = await Promise.all([
        User.find({ role: "USER", isDeleted: false, ...filter })
          .select("-password")
          .sort(sort)
          .skip(pagination.skip)
          .limit(pagination.limit)
          .lean(),
        User.countDocuments({ role: "USER", isDeleted: false }),
        User.countDocuments({ role: "USER", isActive: true }),
        User.countDocuments({ role: "USER", isDeleted: true }),
      ]);

      const totalPages = Math.ceil(totalUsers / pagination.limit);

      const stats = {
        totalUsers,
        activeUsers,
        deletedUsers,
      };

      res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: {
          users,
          stats,
          pagination: {
            currentPage: pagination.page,
            totalPages,
            totalCount: totalUsers,
            limit: pagination.limit,
            hasNextPage: pagination.page < totalPages,
            hasPrevPage: pagination.page > 1,
          },
        },
      });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, message: err.message || "Server error" });
    }
  },

  async getUserDetails(req: AuthRequest, res: Response) {
    try {
      const userId = req.params.id || req.user?._id;
      if (!userId) throw new AppError("User ID is required", 400);
      if (!mongoose.Types.ObjectId.isValid(userId as string)) {
        throw new AppError("Invalid user ID format", 400);
      }
      
      const wallet = await Wallet.findOne({ ownerId: userId });
      const [user, orders, addresses, cart , transactions] = await Promise.all([
        User.findById(userId).select("-password"),
        Order.find({ userId }).sort({ createdAt: -1 }),
        Address.find({ userId }),
        Cart.findOne({ userId }).populate("items.productId"),
        Transaction.find({ walletId : wallet?._id }).sort({ createdAt: -1 })
      ]);

      if (!user) throw new AppError("User not found", 404);

      const promoCash = wallet?.promoCash || 0;
      const balance = wallet?.balance || 0;

      console.log("Transactions" , transactions);
      console.log("Wallet" , wallet);
      

      res.status(200).json({
        success: true,
        message: "User details fetched successfully",
        data: {
          profile: user,
          wallet: { balance, promoCash },
          orders,
          addresses,
          cart,
          transactions
        },
      });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, message: err.message || "Server error" });
    }
  },
  async saveFcmToken(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { token } = req.body;

      if (!token) {
        throw new AppError("FCM token is required", 400);
      }

      await User.updateOne(
        { _id: userId, "fcmTokens.token": { $ne: token } },
        {
          $push: {
            fcmTokens: { token },
          },
        }
      );

      res.json({
        success: true,
        message: "FCM token saved successfully",
      });
    } catch (err: any) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, message: err.message || "Server error" });
    }
  },

};
