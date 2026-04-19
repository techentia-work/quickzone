// @/lib/utils/server/sendNotification.server.utils.ts

import QCNotification from "../../models/notifications/notifications.model";
import { getIO } from "../config/socket/socket";
import { sendPushNotification } from "../../lib/fcm";
import { User } from "../../models/index";


type NotificationAction =
  | "order_placed"
  | "order_cancelled"
  | "order_completed"
  | "admin_new_order"
  | "user_order_status_updated"
  | "user_refund_initiated"
  | "delivery_boy_unassigned"
  | "delivery_boy_created"
  | "order_accepted_by_delivery_boy"
  | "order_rejected_by_delivery_boy"
  | "delivery_partner_assigned"
  | "order_dispatched"
  | "order_delivered_confirmation"
  | "delivery_partner_changed"
  | "order_assignment_confirmation"
  | "payment_success"
  | "custom"; // fallback for custom notifications

export const sendNotificationServerUtils = {
  async notify(action: NotificationAction, data: any): Promise<void> {
    let notificationData: any = {};

    switch (action) {
      // ============================================
      // 🛒 ORDER RELATED NOTIFICATIONS
      // ============================================

      case "order_placed":

        // ✅ USER APP notification
        await this._createNotification({
          user: data.user._id,
          title: "Order Placed Successfully 🎉",
          body: `Your order #${data.orderNumber} has been placed successfully.`,
          type: "ORDER_PLACED",
          order: data._id,
          meta: {
            orderId: data._id,
            orderNumber: data.orderNumber,
            totalAmount: data.totalAmount,
            type: "order_placed_user",
            timestamp: new Date(),
          },
        });

        // ✅ ADMIN notification (as it is)
        notificationData = {
          isForAdmin: true,
          title: "New Order Placed",
          body: `User ${data.user?.firstName} ${data.user?.lastName ?? ""} placed a new order worth ₹${data.totalAmount}.`,
          type: "ORDER_PLACED",
          order: data._id,
          meta: {
            type: "order_new",
            orderId: data._id,
            orderNumber: data.orderNumber,
            userId: data.user._id,
            totalAmount: data.totalAmount,
            timestamp: new Date(),
          },
          read: false,
        };
        break;
      case "order_completed":
        notificationData = {
          isForAdmin: true,
          title: "New Order Placed",
          body: `User ${data.user?.firstName} ${data.user?.lastName ?? ""} placed a new order worth ₹${data.totalAmount}.`,
          type: "ORDER_PLACED",
          order: data._id,
          meta: {
            type: "order_new",
            orderId: data._id,
            orderNumber: data.orderNumber,
            userId: data.user._id,
            totalAmount: data.totalAmount,
            timestamp: new Date(),
          },
          read: false,
        };
        break;

      case "order_cancelled":
        notificationData = {
          isForAdmin: true,
          title: "Order Cancelled",
          body: `User ${data.user?.firstName} ${data.user?.lastName} cancelled order #${data.orderNumber}.`,
          type: "ORDER_CANCELLED",
          order: data._id,
          meta: {
            type: "order_cancelled",
            orderId: data._id,
            orderNumber: data.orderNumber,
            userId: data.user._id,
            cancellationReason: data.cancellationReason,
            timestamp: new Date(),
          },
        };
        break;

      case "user_refund_initiated":
        notificationData = {
          user: data.userId,
          title: "Refund Initiated",
          body: `A refund of ₹${data.amount} has been initiated for your order #${data.orderNumber}.`,
          type: "REFUND_INITIATED",
          order: data._id,
          meta: {
            type: "refund_initiated",
            orderId: data._id,
            orderNumber: data.orderNumber,
            amount: data.amount,
            timestamp: new Date(),
          },
        };
        break;

      case "admin_new_order":
        notificationData = {
          isForAdmin: true,
          title: "Manual Order Created",
          body: `An admin has manually created order #${data.orderNumber} for ${data.user?.firstName} ${data.user?.lastName}.`,
          type: "ORDER_PLACED",
          order: data._id,
          meta: {
            type: "admin_order",
            orderId: data._id,
            orderNumber: data.orderNumber,
            userId: data.user._id,
            timestamp: new Date(),
          },
        };
        break;

      case "payment_success":
        const orderData = data; // alias for clarity

        // Notify User
        await this._createNotification({
          user: orderData.userId,
          title: "Payment Successful",
          body: `Your payment for order #${orderData.orderNumber} was successful.`,
          type: "PAYMENT_CONFIRMED",
          order: orderData._id,
          meta: {
            orderId: orderData._id,
            orderNumber: orderData.orderNumber,
            amount: orderData.totalAmount,
            paymentMethod: orderData.paymentMethod,
            paymentGateway: orderData.paymentGateway,
            transactionId: orderData.gatewayPaymentId || orderData.transactionId,
            type: "payment_success",
            timestamp: new Date(),
          },
        });

        // Notify Admin
        notificationData = {
          isForAdmin: true,
          title: "Payment Successful",
          body: `${orderData.user?.firstName || "User"} ${orderData.user?.lastName || ""} has successfully paid for order #${orderData.orderNumber}.`,
          type: "PAYMENT_CONFIRMED",
          order: orderData._id,
          meta: {
            orderId: orderData._id,
            orderNumber: orderData.orderNumber,
            userId: orderData.userId,
            userName: `${orderData.user?.firstName || ""} ${orderData.user?.lastName || ""}`.trim(),
            amount: orderData.totalAmount,
            paymentMethod: orderData.paymentMethod,
            paymentGateway: orderData.paymentGateway,
            transactionId: orderData.gatewayPaymentId || orderData.transactionId,
            type: "payment_success_admin",
            timestamp: new Date(),
          },
        };
        break;

      // ============================================
      // 🚚 DELIVERY BOY - NEW SPECIFIC ACTIONS
      // ============================================

      case "delivery_boy_created":
        notificationData = {
          isForAdmin: true,
          title: "New Delivery Boy Added",
          body: `${data.name} has been added as a new delivery partner.`,
          type: "SYSTEM_ALERT",
          meta: {
            deliveryBoyId: data.deliveryBoyId,
            deliveryCode: data.deliveryCode,
            type: "delivery_boy_created",
            timestamp: new Date(),
          },
        };
        break;

      case "order_accepted_by_delivery_boy":
        // Notify User
        await this._createNotification({
          user: data.userId,
          title: "Order Accepted by Delivery Partner",
          body: `Your order #${data.orderNumber} has been accepted by ${data.deliveryBoyName}. It will be picked up soon.`,
          type: "ORDER_CONFIRMED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            deliveryBoyName: data.deliveryBoyName,
            deliveryBoyPhone: data.deliveryBoyPhone,
            type: "order_accepted",
            timestamp: new Date(),
          },
        });

        // Notify Admin
        notificationData = {
          isForAdmin: true,
          title: "Order Accepted by Delivery Boy",
          body: `${data.deliveryBoyName} accepted order #${data.orderNumber} from ${data.userFirstName} ${data.userLastName}.`,
          type: "ORDER_CONFIRMED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            deliveryBoyId: data.deliveryBoyId,
            deliveryBoyName: data.deliveryBoyName,
            userId: data.userId,
            type: "order_accepted_by_delivery_boy",
            timestamp: new Date(),
          },
        };
        break;

      case "order_rejected_by_delivery_boy":
        // Notify Admin (Priority)
        await this._createNotification({
          isForAdmin: true,
          title: "⚠️ Order Rejected by Delivery Boy",
          body: `${data.deliveryBoyName} rejected order #${data.orderNumber}. Reason: ${data.rejectionReason || "Not specified"}. Please reassign immediately.`,
          type: "SYSTEM_ALERT",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            deliveryBoyId: data.deliveryBoyId,
            deliveryBoyName: data.deliveryBoyName,
            rejectionReason: data.rejectionReason,
            userId: data.userId,
            type: "order_rejected_by_delivery_boy",
            priority: "high",
            timestamp: new Date(),
          },
        });

        // Notify User
        notificationData = {
          user: data.userId,
          title: "Delivery Partner Change",
          body: `We're assigning a new delivery partner to your order #${data.orderNumber}. You'll be notified once assigned.`,
          type: "ORDER_CONFIRMED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            type: "delivery_partner_changed",
            timestamp: new Date(),
          },
        };
        break;

      case "order_dispatched":
        // Notify User
        await this._createNotification({
          user: data.userId,
          title: "🚚 Order Out for Delivery",
          body: `Your order #${data.orderNumber} is on its way! ${data.deliveryBoyName} will deliver it soon.`,
          type: "ORDER_DISPATCHED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            deliveryBoyName: data.deliveryBoyName,
            deliveryBoyPhone: data.deliveryBoyPhone,
            type: "order_out_for_delivery",
            timestamp: new Date(),
          },
        });

        // Notify Admin
        notificationData = {
          isForAdmin: true,
          title: "Order Out for Delivery",
          body: `Order #${data.orderNumber} is now out for delivery by ${data.deliveryBoyName}.`,
          type: "ORDER_DISPATCHED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            deliveryBoyId: data.deliveryBoyId,
            deliveryBoyName: data.deliveryBoyName,
            type: "order_dispatched",
            timestamp: new Date(),
          },
        };
        break;

      case "order_delivered_confirmation":
        // Notify User
        await this._createNotification({
          user: data.userId,
          title: "✅ Order Delivered Successfully!",
          body: `Your order #${data.orderNumber} has been delivered. Thank you for shopping with us!`,
          type: "ORDER_DELIVERED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            deliveredAt: data.deliveredAt,
            type: "order_delivered",
            timestamp: new Date(),
          },
        });

        // Notify Admin
        notificationData = {
          isForAdmin: true,
          title: "Order Delivered",
          body: `Order #${data.orderNumber} has been successfully delivered by ${data.deliveryBoyName}.`,
          type: "ORDER_DELIVERED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            deliveryBoyId: data.deliveryBoyId,
            deliveryBoyName: data.deliveryBoyName,
            deliveredAt: data.deliveredAt,
            type: "order_delivered_confirmation",
            timestamp: new Date(),
          },
        };
        break;

      case "order_assignment_confirmation":
        // Notify Delivery Boy
        await this._createNotification({
          driver: data.deliveryBoyId,
          title: "🎯 New Order Assigned",
          body: `You have been assigned order #${data.orderNumber}. Total amount: ₹${data.totalAmount}. Please accept or reject within 10 minutes.`,
          type: "ORDER_CONFIRMED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            totalAmount: data.totalAmount,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            shippingAddress: data.shippingAddress,
            type: "order_assigned_to_delivery_boy",
            autoRejectIn: "10 minutes",
            timestamp: new Date(),
          },
        });

        // Notify User
        await this._createNotification({
          user: data.userId,
          title: "Delivery Partner Assigned",
          body: `${data.deliveryBoyName} has been assigned to deliver your order #${data.orderNumber}.`,
          type: "ORDER_CONFIRMED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            deliveryBoyName: data.deliveryBoyName,
            deliveryBoyPhone: data.deliveryBoyPhone,
            type: "delivery_partner_assigned",
            timestamp: new Date(),
          },
        });

        // Notify Admin
        notificationData = {
          isForAdmin: true,
          title: "Order Assigned Successfully",
          body: `Order #${data.orderNumber} has been assigned to ${data.deliveryBoyName}.`,
          type: "ORDER_CONFIRMED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            deliveryBoyId: data.deliveryBoyId,
            deliveryBoyName: data.deliveryBoyName,
            userId: data.userId,
            type: "order_assignment_confirmation",
            timestamp: new Date(),
          },
        };
        break;

      case "delivery_partner_changed":
        // Notify Delivery Boy (Unassignment)
        await this._createNotification({
          driver: data.deliveryBoyId,
          title: "Order Unassigned",
          body: `Order #${data.orderNumber} has been unassigned from you by admin.`,
          type: "SYSTEM_ALERT",
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            type: "order_unassigned",
            timestamp: new Date(),
          },
        });

        // Notify User
        notificationData = {
          user: data.userId,
          title: "Delivery Partner Change",
          body: `We're assigning a new delivery partner to your order #${data.orderNumber}.`,
          type: "ORDER_CONFIRMED",
          order: data.orderId,
          meta: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            type: "delivery_partner_unassigned",
            timestamp: new Date(),
          },
        };
        break;

      case "custom":
        notificationData = data;
        break;

      default:
        throw new Error(`Unknown notification action: ${action}`);
    }

    await this._createNotification(notificationData);
  },

  async _createNotification(notificationData: any): Promise<void> {
    try {
      // 1️⃣ Save DB
      const saved = await new QCNotification(notificationData).save();

      // 2️⃣ Socket (AS IT IS)
      const io = getIO();
      if (io) {
        if (notificationData.isForAdmin) {
          io.to("admins").emit("notification:new", saved);
        }
        else if (notificationData.user) {
          io.to(`user:${notificationData.user}`).emit("notification:new", saved);
        }
        else if (notificationData.driver) {
          io.to(`driver:${notificationData.driver}`).emit("notification:new", saved);
        }
      }

      // 3️⃣ 🔔 FCM — ✅ ONLY USER APP
      if (!notificationData.user) return;

      const user = await User.findById(notificationData.user).select("fcmTokens");

      const tokens = user?.fcmTokens?.map(t => t.token) || [];

      if (!tokens.length) {
        console.log("⚠️ No FCM tokens for user");
        return;
      }

      await sendPushNotification(
        tokens,
        notificationData.title,
        notificationData.body,
        {
          type: notificationData.type || "GENERAL",
          orderId: notificationData.order?.toString() || "",
        }
      );

      console.log("📲 USER FCM sent:", tokens.length);

    } catch (err) {
      console.error("❌ Notification error:", err);
    }
  }


};
