import { Request, Response } from "express";
import {
    User,
    Order,
    Product,
    Category,
    FeaturedSection,
    BrandOfTheDay,
    ShopByStore,
    DeliveryBoy,
    Slider,
    Banner,
    PromoCode,
    ShowcaseProduct
} from "../../models/index";

export const adminController = {
    async dashboard(req: Request, res: Response) {
        // 1. Fetch Counts
        const [
            ordersCount,
            productsCount,
            usersCount,
            categoriesCount,
            featuredCount,
            brandOfTheDayCount,
            shopByStoreCount,
            deliveryBoysCount,
            slidersCount,
            bannersCount,
            promocodesCount,
            showcaseProductsCount
        ] = await Promise.all([
            Order.countDocuments(),
            Product.countDocuments({ isDeleted: false }),
            User.countDocuments({ role: "USER", isDeleted: false }),
            Category.countDocuments({ isDeleted: false }),
            FeaturedSection.countDocuments({ isActive: true }),
            BrandOfTheDay.countDocuments({ isActive: true }),
            ShopByStore.countDocuments({ isActive: true }),
            DeliveryBoy.countDocuments({ isDeleted: false }),
            Slider.countDocuments({ isActive: true }),
            Banner.countDocuments({ isActive: true }),
            PromoCode.countDocuments({ isActive: true }),
            ShowcaseProduct.countDocuments({ isActive: true, isDeleted: false })
        ]);

        // 2. Category Wise Product Count (Master Category Distribution)
        const categoryWiseProductRaw = await Product.aggregate([
            { $match: { isDeleted: false } },
            {
                $addFields: {
                    rootCategoryId: {
                        $cond: {
                            if: { $and: [{ $isArray: "$categoryPath" }, { $gt: [{ $size: "$categoryPath" }, 0] }] },
                            then: { $arrayElemAt: ["$categoryPath", 0] },
                            else: "$categoryId"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$rootCategoryId",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Populate category names
        const categoryWiseProduct = await Category.populate(categoryWiseProductRaw, { path: "_id", select: "name" });
        const formattedCategoryData = categoryWiseProduct.map((item: any) => ({
            name: item._id?.name || "Unknown",
            value: item.count
        }));

        // 3. Monthly Sales (Current Month - Day wise)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(startOfMonth.getMonth() + 1);

        const monthlySalesRaw = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
                    // status: { $in: ["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] } // Count all valid orders
                    // Or just count all? User said "total sales". Usually implies valid orders.
                    // Let's exclude Cancelled/Failed.
                    status: { $nin: ["CANCELLED", "FAILED", "REFUNDED", "PENDING"] }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$createdAt" },
                    sales: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format for graph (1-30/31)
        const monthlySales = [];
        const daysInMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const found = monthlySalesRaw.find((s) => s._id === i);
            monthlySales.push({
                day: i,
                sales: found ? found.sales : 0,
                orders: found ? found.count : 0
            });
        }

        // 4. Top Selling Products
        const topProductsRaw = await Order.aggregate([
            { $match: { status: { $nin: ["CANCELLED", "FAILED", "PENDING", "REJECTED"] } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productName",
                    price: { $first: "$items.price" },
                    count: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 5. Order Status Distribution
        const orderStatusRaw = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const formattedOrderStatus = orderStatusRaw.map((item) => ({
            name: item._id,
            value: item.count
        }));


        // 6. Recent Orders
        const recentOrders = await Order.find()
            .select("orderNumber totalAmount paymentStatus status createdAt items userId shippingAddress")
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "name phone");

        res.json({
            success: true,
            data: {
                counts: {
                    orders: ordersCount,
                    products: productsCount,
                    users: usersCount,
                    categories: categoriesCount,
                    featured: featuredCount,
                    brandOfTheDay: brandOfTheDayCount,
                    shopByStore: shopByStoreCount,
                    deliveryBoys: deliveryBoysCount,
                    sliders: slidersCount,
                    banners: bannersCount,
                    promocodes: promocodesCount,
                    showcaseProducts: showcaseProductsCount
                },
                charts: {
                    categoryWiseProduct: formattedCategoryData,
                    monthlySales: monthlySales,
                    topProducts: topProductsRaw,
                    orderStatus: formattedOrderStatus,
                    recentOrders: recentOrders
                }
            }
        });
    },

    async listUsers(req: Request, res: Response) {
        const users = await User.find({ role: "USER", isDeleted: false }).select("-password");
        res.json({ success: true, users });
    },

    async deactivateUser(req: Request, res: Response) {
        await User.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: "User deactivated" });
    },
};
