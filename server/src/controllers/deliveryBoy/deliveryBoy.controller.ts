// @/controllers/deliveryBoy/deliveryBoy.controller.ts

import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import mongoose, { ObjectId } from "mongoose";
import { AppError, OrderStatus, UserRole, AuthRequest } from "../../lib/types/index";
import { helperServerUtils } from "../../lib/utils/helpers/helper.utils";
import {
  DeliveryBoyModelType,
  DeliveryBoyStatus,
} from "../../lib/types/deliveryboy/deliveryBoy.types";
import { DeliveryBoy } from "../../models/index";
import { jwtUtils } from "../../lib/utils/index";
import { sendNotificationServerUtils } from "../../lib/notification/notification.server.utils";

const generateCredentials = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  const email = `delivery${random}@quickzon.com`;
  const password = Math.random().toString(36).slice(-8);
  const deliveryCode = `DB${Date.now().toString().slice(-6)}`;
  return { email, password, deliveryCode };
};

export const deliveryBoyController = {
  async createDeliveryBoy(req: Request, res: Response, next: NextFunction) {
    const { name, phone } = req.body;

    // Check existing phone
    const existing = await DeliveryBoy.findOne({ phone });
    if (existing) {
      throw new AppError("Delivery boy with this phone already exists", 409);
    }

    const { email, password, deliveryCode } = generateCredentials();

    const deliveryBoy = await DeliveryBoy.create({
      name,
      email,
      phone,
      password,
      deliveryCode,
      status: DeliveryBoyStatus.AVAILABLE,
      isActive: true,
      assignedOrders: [],
      role: UserRole.DELIVERY_BOY,
    });

    // Notify admin about new delivery boy creation
    await sendNotificationServerUtils.notify("delivery_boy_created", { name: deliveryBoy.name, deliveryBoyId: deliveryBoy._id, deliveryCode: deliveryBoy.deliveryCode, });

    res.status(201).json({
      success: true,
      message: "Delivery boy created successfully",
      data: {
        deliveryBoy: {
          id: deliveryBoy._id,
          name: deliveryBoy.name,
          email: deliveryBoy.email,
          phone: deliveryBoy.phone,
          deliveryCode: deliveryBoy.deliveryCode,
          status: deliveryBoy.status,
          isActive: deliveryBoy.isActive,
        },
        credentials: { email, password, deliveryCode },
      },
    });
  },

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Email and password required", 400);
    }

    const deliveryBoy = await DeliveryBoy.findOne({ email });
    if (!deliveryBoy) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!deliveryBoy.isActive) {
      throw new AppError("Your account has been deactivated. Contact admin.", 403);
    }

    const isMatch = await bcrypt.compare(password, deliveryBoy.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    // Update last login
    deliveryBoy.lastLogin = new Date();
    await deliveryBoy.save();

    const token = jwtUtils.generateToken({
      _id: (deliveryBoy._id as mongoose.Types.ObjectId).toString(),
      email: deliveryBoy.email,
      phone: deliveryBoy.phone,
      fullName: deliveryBoy.name,
      role: deliveryBoy.role as UserRole,
      isAdmin: false,
    });

    jwtUtils.setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone,
        status: deliveryBoy.status,
        deliveryCode: deliveryBoy.deliveryCode,
        assignedOrdersCount: deliveryBoy.assignedOrders.length,
      },
    });
  },

  async logout(req: Request, res: Response) {
    jwtUtils.clearAuthCookie(res);
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },

  async getCurrentdeliveryBoy(req: AuthRequest, res: Response) {
    const userData = await DeliveryBoy.findById(req.user?._id);

    if (!userData) {
      throw new AppError("Deliver Boy not found", 404);
    }

    res.status(200).json({ success: true, message: "Deliver Boy data retrieved successfully", data: userData });
  },

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    const deliveryBoyId = req.user?._id;
    if (!deliveryBoyId) throw new AppError("Unauthorized", 401);

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId)
      .select("-password")
      .populate({
        path: "assignedOrders",
        select: "orderNumber status totalAmount shippingAddress createdAt expectedDeliveryDate",
      });

    if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: deliveryBoy,
    });
  },

  async getAssignedOrders(req: AuthRequest, res: Response, next: NextFunction) {
    const deliveryBoyId = req.user?._id;
    if (!deliveryBoyId) throw new AppError("Unauthorized", 401);

    const Order = mongoose.model("Order");

    const orders = await Order.find({
      assignedDeliveryBoy: deliveryBoyId,
      status: {
        $in: [
          OrderStatus.PROCESSING,
          OrderStatus.ACCEPTED,
          OrderStatus.OUT_FOR_DELIVERY,
        ]
      },
    })
      .populate("userId", "firstName lastName phone email")
      .populate("items.productId", "name slug mainImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Assigned orders fetched successfully",
      data: {
        orders,
        count: orders.length,
      },
    });
  },

  async getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
    const deliveryBoyId = req.user?._id;
    if (!deliveryBoyId) throw new AppError("Unauthorized", 401);

    const Order = mongoose.model("Order");

    const orders = await Order.find({ assignedDeliveryBoy: deliveryBoyId, })
      .populate("userId", "firstName lastName phone email")
      .populate("items.productId", "name slug mainImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All orders fetched successfully",
      data: {
        orders,
        count: orders.length,
      },
    });
  },

  async acceptAssignedOrder(req: AuthRequest, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const deliveryBoyId = req.user?._id;
        const { orderId } = req.body;

        if (!deliveryBoyId) throw new AppError("Unauthorized", 401);
        if (!orderId) throw new AppError("Order ID is required", 400);

        const Order = mongoose.model("Order");

        const [deliveryBoy, order] = await Promise.all([
          DeliveryBoy.findById(deliveryBoyId).session(session),
          Order.findById(orderId)
            .session(session)
            .populate("userId", "firstName lastName email"),
        ]);

        if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);
        if (!order) throw new AppError("Order not found", 404);

        if (order.assignedDeliveryBoy?.toString() !== deliveryBoy._id!.toString()) {
          throw new AppError("This order is not assigned to you", 403);
        }

        if ([OrderStatus.ACCEPTED, OrderStatus.OUT_FOR_DELIVERY].includes(order.status)) {
          throw new AppError("Order has already been accepted", 400);
        }

        // Update order + delivery boy
        order.status = OrderStatus.ACCEPTED;
        await order.save({ session });

        deliveryBoy.status = DeliveryBoyStatus.ASSIGNED;
        await deliveryBoy.save({ session });

        await sendNotificationServerUtils.notify("order_accepted_by_delivery_boy", { userId: order.userId._id, orderId: order._id, orderNumber: order.orderNumber, deliveryBoyId: deliveryBoy._id, deliveryBoyName: deliveryBoy.name, deliveryBoyPhone: deliveryBoy.phone, userFirstName: order.userId.firstName, userLastName: order.userId.lastName, });

        res.status(200).json({
          success: true,
          message: "Order accepted successfully",
          data: {
            order: {
              id: order._id,
              orderNumber: order.orderNumber,
              status: order.status,
              deliveredAt: order.deliveredAt,
            },
            deliveryBoy: {
              id: deliveryBoy._id,
              name: deliveryBoy.name,
              status: deliveryBoy.status,
              activeOrders: deliveryBoy.assignedOrders.length,
            },
          },
        });
      });
    } catch (error) {
      next(error);
    } finally {
      session.endSession();
    }
  },

  async rejectAssignedOrder(req: AuthRequest, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const deliveryBoyId = req.user?._id;
        const { orderId, reason } = req.body;

        if (!deliveryBoyId) throw new AppError("Unauthorized", 401);
        if (!orderId) throw new AppError("Order ID is required", 400);

        const Order = mongoose.model("Order");

        const [deliveryBoy, order] = await Promise.all([
          DeliveryBoy.findById(deliveryBoyId).session(session),
          Order.findById(orderId)
            .session(session)
            .populate("userId", "firstName lastName email"),
        ]);

        if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);
        if (!order) throw new AppError("Order not found", 404);

        if (order.assignedDeliveryBoy?.toString() !== deliveryBoy._id!.toString()) {
          throw new AppError("This order is not assigned to you", 403);
        }

        if ([OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED].includes(order.status)) {
          throw new AppError("Cannot reject order after it's out for delivery", 400);
        }

        // Unassign and revert
        order.assignedDeliveryBoy = null;
        order.status = OrderStatus.CONFIRMED;
        order.notes = order.notes
          ? `${order.notes}\n[Rejected by ${deliveryBoy.name}: ${reason || "No reason provided"}]`
          : `[Rejected by ${deliveryBoy.name}: ${reason || "No reason provided"}]`;
        await order.save({ session });

        deliveryBoy.assignedOrders = deliveryBoy.assignedOrders.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== orderId
        );
        if (deliveryBoy.assignedOrders.length === 0) {
          deliveryBoy.status = DeliveryBoyStatus.AVAILABLE;
        }
        await deliveryBoy.save({ session });

        await sendNotificationServerUtils.notify("order_rejected_by_delivery_boy", { userId: order.userId._id, orderId: order._id, orderNumber: order.orderNumber, deliveryBoyId: deliveryBoy._id, deliveryBoyName: deliveryBoy.name, rejectionReason: reason, });
      });

      res.status(200).json({
        success: true,
        message: "Order rejected successfully. Admin has been notified for reassignment.",
      });
    } catch (error) {
      next(error);
    } finally {
      session.endSession();
    }
  },

  async updateDeliveryStatus(req: AuthRequest, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const deliveryBoyId = req.user?._id;
      const { orderId, status } = req.body;

      if (!deliveryBoyId) throw new AppError("Unauthorized", 401);
      if (!orderId || !status) {
        throw new AppError("Order ID and status are required", 400);
      }

      const validStatuses = [
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
      ];

      if (!validStatuses.includes(status)) {
        throw new AppError("Invalid order status for delivery update", 400);
      }

      const Order = mongoose.model("Order");
      const order = await Order.findById(orderId)
        .session(session)
        .populate("userId", "firstName lastName email phone");

      if (!order) throw new AppError("Order not found", 404);

      // Verify assignment
      if (order.assignedDeliveryBoy?.toString() !== deliveryBoyId.toString()) {
        throw new AppError("This order is not assigned to you", 403);
      }

      // Status transition validation
      if (status === OrderStatus.OUT_FOR_DELIVERY && order.status !== OrderStatus.ACCEPTED) {
        throw new AppError("Order must be accepted before marking as out for delivery", 400);
      }

      if (status === OrderStatus.DELIVERED && order.status !== OrderStatus.OUT_FOR_DELIVERY) {
        throw new AppError("Order must be out for delivery before marking as delivered", 400);
      }

      const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).session(session);
      if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);

      // Update order status
      order.status = status;

      if (status === OrderStatus.DELIVERED) {
        order.deliveredAt = new Date();
        order.paymentStatus = "PAID"; // Auto-complete payment on delivery
      }

      await order.save({ session });

      // Update delivery boy status and remove completed orders
      if (status === OrderStatus.DELIVERED) {
        deliveryBoy.assignedOrders = deliveryBoy.assignedOrders.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== order._id.toString()
        );

        if (deliveryBoy.assignedOrders.length === 0) {
          deliveryBoy.status = DeliveryBoyStatus.AVAILABLE;
        }

        await deliveryBoy.save({ session });
      }

      // 📢 Send appropriate notifications
      if (status === OrderStatus.OUT_FOR_DELIVERY) {
        await sendNotificationServerUtils.notify("order_dispatched", { userId: order.userId._id, orderId: order._id, orderNumber: order.orderNumber, deliveryBoyId: deliveryBoy._id, deliveryBoyName: deliveryBoy.name, deliveryBoyPhone: deliveryBoy.phone, });
      } else if (status === OrderStatus.DELIVERED) {
        await sendNotificationServerUtils.notify("order_delivered_confirmation", { userId: order.userId._id, orderId: order._id, orderNumber: order.orderNumber, deliveryBoyId: deliveryBoy._id, deliveryBoyName: deliveryBoy.name, deliveredAt: order.deliveredAt, });
      }

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: `Order status updated to ${status} successfully`,
        data: {
          order: {
            id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            deliveredAt: order.deliveredAt,
          },
          deliveryBoy: {
            id: deliveryBoy._id,
            name: deliveryBoy.name,
            status: deliveryBoy.status,
            activeOrders: deliveryBoy.assignedOrders.length,
          },
        },
      });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  },

  async getDeliveryBoys(req: Request, res: Response, next: NextFunction) {
    const { filter, pagination, sort } = helperServerUtils.buildQuery(
      req.query,
      ["status", "isActive"],
      "createdAt",
      ["name", "phone", "email"]
    );

    if (filter.isActive === undefined)
      filter.isActive = true;

    const [deliveryBoys, total] = await Promise.all([
      DeliveryBoy.find({ ...filter })
        .select("-password")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      DeliveryBoy.countDocuments({ ...filter }),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    res.status(200).json({
      success: true,
      message: "Delivery boys fetched successfully",
      data: {
        deliveryBoys,
        pagination: {
          currentPage: pagination.page,
          totalPages,
          totalCount: total,
          limit: pagination.limit,
          hasNextPage: pagination.page < totalPages,
          hasPrevPage: pagination.page > 1,
        },
      },
    });
  },

  async getDeliveryBoyById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    const deliveryBoy = await DeliveryBoy.findById(id)
      .select("-password")
      .populate({
        path: "assignedOrders",
        select: "orderNumber status totalAmount shippingAddress createdAt expectedDeliveryDate",
        populate: {
          path: "userId",
          select: "firstName lastName phone email",
        },
      });

    if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);

    res.status(200).json({
      success: true,
      message: "Delivery boy fetched successfully",
      data: deliveryBoy,
    });
  },

  async updateDeliveryBoy(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data = req.body;

    // Prevent updating sensitive fields
    delete data.password;
    delete data.role;
    delete data.assignedOrders;

    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    ).select("-password");

    if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);

    res.status(200).json({
      success: true,
      message: "Delivery boy updated successfully",
      data: deliveryBoy,
    });
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(DeliveryBoyStatus).includes(status)) {
      throw new AppError("Invalid status", 400);
    }

    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select("-password");

    if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: deliveryBoy,
    });
  },

  async toggleActiveStatus(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const deliveryBoy = await DeliveryBoy.findById(id);

    if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);

    // Cannot deactivate if they have active deliveries
    if (deliveryBoy.isActive && deliveryBoy.assignedOrders.length > 0) {
      throw new AppError(
        "Cannot deactivate delivery boy with active orders. Please reassign orders first.",
        400
      );
    }

    deliveryBoy.isActive = !deliveryBoy.isActive;

    // Set status to offline if deactivating
    if (!deliveryBoy.isActive) {
      deliveryBoy.status = DeliveryBoyStatus.OFFLINE;
    }

    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: `Delivery boy ${deliveryBoy.isActive ? "activated" : "deactivated"
        } successfully`,
      data: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        isActive: deliveryBoy.isActive,
        status: deliveryBoy.status,
      },
    });
  },

  async assignOrder(req: Request, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const { deliveryBoyId, orderId } = req.body;

        if (!deliveryBoyId || !orderId) {
          throw new AppError("Missing deliveryBoyId or orderId", 400);
        }

        const Order = mongoose.model("Order");

        // Fetch both in parallel inside the same session
        const [deliveryBoy, order] = await Promise.all([
          DeliveryBoy.findById(deliveryBoyId).session(session),
          Order.findById(orderId)
            .session(session)
            .populate("userId", "firstName lastName email phone"),
        ]);

        if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);
        if (!order) throw new AppError("Order not found", 404);

        // Validation
        if (!deliveryBoy.isActive)
          throw new AppError("Cannot assign to inactive delivery boy", 400);

        if (deliveryBoy.status === DeliveryBoyStatus.OFFLINE)
          throw new AppError("Delivery boy is currently offline", 400);

        if (order.assignedDeliveryBoy)
          throw new AppError("Order is already assigned. Unassign first.", 400);

        if (
          [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.RETURNED]
            .includes(order.status)
        ) {
          throw new AppError("Cannot assign completed or cancelled orders", 400);
        }

        // Update order + delivery boy
        order.assignedDeliveryBoy = deliveryBoy._id;
        order.status = OrderStatus.PROCESSING;
        await order.save({ session });

        if (!deliveryBoy.assignedOrders.includes(order._id)) {
          deliveryBoy.assignedOrders.push(order._id);
        }
        deliveryBoy.status = DeliveryBoyStatus.INPROCESSING;
        await deliveryBoy.save({ session });

        await sendNotificationServerUtils.notify("order_assignment_confirmation", { deliveryBoyId: deliveryBoy._id, deliveryBoyName: deliveryBoy.name, deliveryBoyPhone: deliveryBoy.phone, userId: order.userId._id, orderId: order._id, orderNumber: order.orderNumber, totalAmount: order.totalAmount, customerName: `${order.userId.firstName} ${order.userId.lastName}`, customerPhone: order.userId.phone, shippingAddress: order.shippingAddress, });
      });

      // ✅ If the transaction succeeds
      res.status(200).json({
        success: true,
        message: "Order assigned successfully",
      });
    } catch (error) {
      // ❌ If any operation inside withTransaction fails, it auto-aborts
      next(error);
    } finally {
      // Always end the session
      session.endSession();
    }
  },

  async deleteDeliveryBoy(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const deliveryBoy = await DeliveryBoy.findById(id);

    if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);

    // Cannot delete if they have active orders
    if (deliveryBoy.assignedOrders.length > 0) {
      throw new AppError("Cannot delete delivery boy with active orders. Please reassign all orders first.", 400);
    }

    deliveryBoy.isDeleted = true;
    deliveryBoy.isActive = false;
    deliveryBoy.deletedAt = new Date();
    await deliveryBoy.save();

    res.status(200).json({ success: true, message: "Delivery boy deleted successfully", data: { id: deliveryBoy._id }, });
  },

  async getAvailableDeliveryBoys(req: Request, res: Response, next: NextFunction) {
    const availableBoys = await DeliveryBoy.find({
      status: DeliveryBoyStatus.AVAILABLE,
      isActive: true,
    })
      .select("-password")
      .sort({ assignedOrders: 1 });

    res.status(200).json({
      success: true,
      message: "Available delivery boys fetched successfully",
      data: {
        deliveryBoys: availableBoys,
        count: availableBoys.length,
      },
    });
  },

  async unassignOrder(req: Request, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { orderId } = req.body;
      if (!orderId) throw new AppError("Order ID is required", 400);

      const Order = mongoose.model("Order");
      const order = await Order.findById(orderId)
        .session(session)
        .populate("userId", "firstName lastName email")
        .populate("assignedDeliveryBoy", "name email phone");

      if (!order) throw new AppError("Order not found", 404);
      if (!order.assignedDeliveryBoy) {
        throw new AppError("Order is not assigned to any delivery boy", 400);
      }

      const deliveryBoyId = order.assignedDeliveryBoy._id;
      const deliveryBoyName = order.assignedDeliveryBoy.name;

      // Update order
      order.assignedDeliveryBoy = null;
      order.status = OrderStatus.CONFIRMED;
      order.notes = order.notes
        ? `${order.notes}\n[Unassigned by admin from ${deliveryBoyName}]`
        : `[Unassigned by admin from ${deliveryBoyName}]`;
      await order.save({ session });

      // Update delivery boy
      const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId).session(session);
      if (deliveryBoy) {
        deliveryBoy.assignedOrders = deliveryBoy.assignedOrders.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== orderId
        );

        if (deliveryBoy.assignedOrders.length === 0) {
          deliveryBoy.status = DeliveryBoyStatus.AVAILABLE;
        }

        await deliveryBoy.save({ session });

        // 📢 Notify Delivery Boy
        await sendNotificationServerUtils.notify("delivery_partner_changed", {
          deliveryBoyId: deliveryBoyId,
          userId: order.userId._id,
          orderId: order._id,
          orderNumber: order.orderNumber,
        });
      }

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: "Order unassigned successfully",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  },

  async getDeliveryBoyStats(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    const Order = mongoose.model("Order");

    const [deliveryBoy, totalDeliveries, completedDeliveries, activeOrders] = await Promise.all([
      DeliveryBoy.findById(id).select("-password"),
      Order.countDocuments({ assignedDeliveryBoy: id }),
      Order.countDocuments({ assignedDeliveryBoy: id, status: OrderStatus.DELIVERED }),
      Order.find({
        assignedDeliveryBoy: id,
        status: { $in: [OrderStatus.PROCESSING, OrderStatus.ACCEPTED, OrderStatus.OUT_FOR_DELIVERY] }
      }).select("orderNumber status totalAmount createdAt"),
    ]);

    if (!deliveryBoy) throw new AppError("Delivery boy not found", 404);

    res.status(200).json({
      success: true,
      message: "Delivery boy statistics fetched successfully",
      data: {
        deliveryBoy: {
          id: deliveryBoy._id,
          name: deliveryBoy.name,
          email: deliveryBoy.email,
          phone: deliveryBoy.phone,
          status: deliveryBoy.status,
          isActive: deliveryBoy.isActive,
        },
        stats: {
          totalDeliveries,
          completedDeliveries,
          activeOrdersCount: activeOrders.length,
          completionRate: totalDeliveries > 0
            ? ((completedDeliveries / totalDeliveries) * 100).toFixed(2)
            : "0.00",
        },
        activeOrders,
      },
    });
  },
};
