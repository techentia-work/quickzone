// src/controllers/admin/adminPromocode.controller.ts

import { Response } from "express";
import mongoose from "mongoose";
import { PromoCode, Order } from "../../models/index";
import { AppError, AuthRequest } from "../../lib/types/index";

export const adminPromocodeController = {
    // Create new promo code
    createPromo: async (req: AuthRequest, res: Response) => {
        const adminId = new mongoose.Types.ObjectId(req.user?._id);
        const promoData = req.body;

        const existingPromo = await PromoCode.findOne({
            code: promoData.code.toUpperCase()
        });

        if (existingPromo) {
            throw new AppError("Promo code already exists", 400);
        }

        if (promoData.discountType === "PERCENTAGE" && promoData.discountValue > 100) {
            throw new AppError("Percentage discount cannot exceed 100%", 400);
        }

        if (promoData.startDate && promoData.endDate) {
            const start = new Date(promoData.startDate);
            const end = new Date(promoData.endDate);
            if (end <= start) {
                throw new AppError("End date must be after start date", 400);
            }
        }

        const promo = await PromoCode.create({
            ...promoData,
            code: promoData.code.toUpperCase(),
            createdBy: adminId,
            usedCount: 0
        });

        res.status(201).json({
            success: true,
            message: "Promo code created successfully",
            data: {
                promocode: promo
            }
        });
    },

    // Get all promo codes with filters
    getAllPromos: async (req: AuthRequest, res: Response) => {
        const {
            page = 1,
            limit = 10,
            isActive,
            discountType,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query: any = {};

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (discountType) {
            query.discountType = discountType;
        }

        if (search) {
            query.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sort: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

        const [promos, total] = await Promise.all([
            PromoCode.find(query)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate('createdBy', 'name email')
                .lean(),
            PromoCode.countDocuments(query)
        ]);

        const promosWithStats = promos.map(promo => {
            const promoDoc = promo as any;
            const now = new Date();
            let status = 'active';

            if (!promoDoc.isActive) {
                status = 'inactive';
            } else if (promoDoc.startDate && promoDoc.startDate > now) {
                status = 'scheduled';
            } else if (promoDoc.endDate && promoDoc.endDate < now) {
                status = 'expired';
            } else if (promoDoc.usageLimit && promoDoc.usedCount >= promoDoc.usageLimit) {
                status = 'limit_reached';
            }

            return {
                ...promoDoc,
                status,
                remainingUsage: promoDoc.usageLimit
                    ? promoDoc.usageLimit - promoDoc.usedCount
                    : null
            };
        });

        res.json({
            success: true,
            message: "Promo codes retrieved successfully",
            data: {
                promocodes: promosWithStats,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    totalCount: total,
                    limit: Number(limit),
                    hasNextPage: Number(page) < (Math.ceil(total / Number(limit))),
                    hasPrevPage: Number(page) > 1,
                }
            }
        });
    },

    // Get promo code by ID
    getPromoById: async (req: AuthRequest, res: Response) => {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id as string)) {
            throw new AppError("Invalid promo code ID", 400);
        }

        const promo = await PromoCode.findById(id)
            .populate('createdBy', 'name email')
            .lean();

        if (!promo) {
            throw new AppError("Promo code not found", 404);
        }

        const Order = mongoose.model('Order');
        const usageStats = await Order.aggregate([
            {
                $match: {
                    "appliedPromo.code": promo.code,
                    status: { $nin: ["CANCELLED", "FAILED"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalDiscount: { $sum: "$appliedPromo.discountAmount" },
                    totalRevenue: { $sum: "$totalAmount" },
                    uniqueUsers: { $addToSet: "$userId" }
                }
            }
        ]);

        const stats = usageStats[0] || {
            totalOrders: 0,
            totalDiscount: 0,
            totalRevenue: 0,
            uniqueUsers: []
        };

        const topUsers = await Order.aggregate([
            {
                $match: {
                    "appliedPromo.code": promo.code,
                    status: { $nin: ["CANCELLED", "FAILED"] }
                }
            },
            {
                $group: {
                    _id: "$userId",
                    usageCount: { $sum: 1 },
                    totalDiscount: { $sum: "$appliedPromo.discountAmount" }
                }
            },
            { $sort: { usageCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    userId: "$_id",
                    name: "$user.name",
                    email: "$user.email",
                    usageCount: 1,
                    totalDiscount: 1
                }
            }
        ]);

        res.json({
            success: true,
            message: "Promo code details retrieved successfully",
            data: {
                promocode: {
                    ...promo,
                    statistics: {
                        totalOrders: stats.totalOrders,
                        totalDiscountGiven: stats.totalDiscount,
                        totalRevenueGenerated: stats.totalRevenue,
                        uniqueUsersCount: stats.uniqueUsers.length,
                        topUsers
                    }
                }
            }
        });
    },

    // Update promo code
    updatePromo: async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id as string)) {
            throw new AppError("Invalid promo code ID", 400);
        }

        const promo = await PromoCode.findById(id);
        if (!promo) {
            throw new AppError("Promo code not found", 404);
        }

        if (updateData.code !== promo.code && (promo.usedCount && promo.usedCount > 0)) {
            throw new AppError("Cannot change code of a promo that has been used", 400);
        }

        const discountType = updateData.discountType || promo.discountType;
        const discountValue = updateData.discountValue || promo.discountValue;

        if (discountType === "PERCENTAGE" && discountValue > 100) {
            throw new AppError("Percentage discount cannot exceed 100%", 400);
        }

        const startDate = updateData.startDate ? new Date(updateData.startDate) : promo.startDate;
        const endDate = updateData.endDate ? new Date(updateData.endDate) : promo.endDate;

        if (startDate && endDate && endDate <= startDate) {
            throw new AppError("End date must be after start date", 400);
        }

        Object.assign(promo, {
            ...updateData,
            code: updateData.code ? updateData.code.toUpperCase() : promo.code
        });

        await promo.save();

        res.json({
            success: true,
            message: "Promo code updated successfully",
            data: {
                promocode: promo
            }
        });
    },

    // Delete promo code
    deletePromo: async (req: AuthRequest, res: Response) => {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id as string)) {
            throw new AppError("Invalid promo code ID", 400);
        }

        const promo = await PromoCode.findById(id);
        if (!promo) {
            throw new AppError("Promo code not found", 404);
        }

        if (promo.usedCount && (promo.usedCount > 0)) {
            promo.isActive = false;
            await promo.save();

            res.json({
                success: true,
                message: "Promo code deactivated (has usage history)",
                data: {
                    promocode: promo
                }
            });
        } else {
            await PromoCode.findByIdAndDelete(id);

            res.json({
                success: true,
                message: "Promo code deleted successfully"
            });
        }
    },

    // Toggle promo active status
    togglePromoStatus: async (req: AuthRequest, res: Response) => {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id as string)) {
            throw new AppError("Invalid promo code ID", 400);
        }

        const promo = await PromoCode.findById(id);
        if (!promo) {
            throw new AppError("Promo code not found", 404);
        }

        promo.isActive = !promo.isActive;
        await promo.save();

        res.json({
            success: true,
            message: `Promo code ${promo.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                promocode: promo
            }
        });
    },

    // Get promo usage history
    getPromoUsageHistory: async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id as string)) {
            throw new AppError("Invalid promo code ID", 400);
        }

        const promo = await PromoCode.findById(id);
        if (!promo) {
            throw new AppError("Promo code not found", 404);
        }

        const skip = (Number(page) - 1) * Number(limit);

        const Order = mongoose.model('Order');
        const [orders, total] = await Promise.all([
            Order.find({
                "appliedPromo.code": promo.code,
                status: { $nin: ["FAILED"] }
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('userId', 'name email')
                .select('orderNumber userId appliedPromo totalAmount status createdAt')
                .lean(),
            Order.countDocuments({
                "appliedPromo.code": promo.code,
                status: { $nin: ["FAILED"] }
            })
        ]);

        res.json({
            success: true,
            message: "Promo code usage history retrieved successfully",
            data: {
                usage: orders,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    totalCount: total,
                    limit: Number(limit),
                    hasNextPage: Number(page) < (Math.ceil(total / Number(limit))),
                    hasPrevPage: Number(page) > 1,
                }
            }
        });
    },

    // Bulk create promo codes
    bulkCreatePromos: async (req: AuthRequest, res: Response) => {
        const adminId = new mongoose.Types.ObjectId(req.user?._id);
        const { prefix, count, ...promoTemplate } = req.body;

        if (!prefix || !count || count < 1 || count > 100) {
            throw new AppError("Invalid bulk creation parameters (max 100)", 400);
        }

        const promos = [];
        const errors = [];

        for (let i = 1; i <= count; i++) {
            const code = `${prefix}${String(i).padStart(4, '0')}`.toUpperCase();

            try {
                const existingPromo = await PromoCode.findOne({ code });
                if (existingPromo) {
                    errors.push(`Code ${code} already exists`);
                    continue;
                }

                const promo = await PromoCode.create({
                    ...promoTemplate,
                    code,
                    createdBy: adminId,
                    usedCount: 0
                });

                promos.push(promo);
            } catch (error: any) {
                errors.push(`Failed to create ${code}: ${error.message}`);
            }
        }

        res.status(201).json({
            success: true,
            message: `Created ${promos.length} promo code${promos.length !== 1 ? 's' : ''}${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
            data: {
                promocodes: promos,
                summary: {
                    created: promos.length,
                    failed: errors.length,
                    errors: errors.length > 0 ? errors : undefined
                }
            }
        });
    },

    // Get promo statistics
    getPromoStats: async (req: AuthRequest, res: Response) => {
        const now = new Date();

        const [
            totalPromos,
            activePromos,
            expiredPromos,
            usageStats
        ] = await Promise.all([
            PromoCode.countDocuments(),
            PromoCode.countDocuments({
                isActive: true,
                $or: [
                    { endDate: { $exists: false } },
                    { endDate: { $gte: now } }
                ]
            }),
            PromoCode.countDocuments({
                endDate: { $lt: now }
            }),
            PromoCode.aggregate([
                {
                    $group: {
                        _id: null,
                        totalUsage: { $sum: "$usedCount" },
                        avgUsagePerPromo: { $avg: "$usedCount" }
                    }
                }
            ])
        ]);

        const Order = mongoose.model('Order');
        const revenueStats = await Order.aggregate([
            {
                $match: {
                    "appliedPromo.code": { $exists: true },
                    status: { $nin: ["CANCELLED", "FAILED"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDiscount: { $sum: "$appliedPromo.discountAmount" },
                    totalRevenue: { $sum: "$totalAmount" },
                    ordersWithPromo: { $sum: 1 }
                }
            }
        ]);

        const topPromos = await Order.aggregate([
            {
                $match: {
                    "appliedPromo.code": { $exists: true },
                    status: { $nin: ["CANCELLED", "FAILED"] }
                }
            },
            {
                $group: {
                    _id: "$appliedPromo.code",
                    usageCount: { $sum: 1 },
                    totalDiscount: { $sum: "$appliedPromo.discountAmount" },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { usageCount: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            message: "Promo code statistics retrieved successfully",
            data: {
                statistics: {
                    overview: {
                        totalPromos,
                        activePromos,
                        expiredPromos,
                        totalUsage: usageStats[0]?.totalUsage || 0,
                        avgUsagePerPromo: Math.round(usageStats[0]?.avgUsagePerPromo || 0)
                    },
                    revenue: revenueStats[0] || {
                        totalDiscount: 0,
                        totalRevenue: 0,
                        ordersWithPromo: 0
                    },
                    topPerformingPromos: topPromos
                }
            }
        });
    }
};
