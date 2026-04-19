import { Router } from "express";
import { orderController } from "../../controllers/index";
import { withAuth, validate } from "../../lib/middlewares/index";
import { orderSchema } from "../../lib/schema/index";

export const orderRouter = Router();

// Customer routes
orderRouter.post("/create", withAuth(false), validate(orderSchema.createOrderSchema), orderController.createOrder);
orderRouter.get("/", withAuth(false), orderController.getUserOrders);
orderRouter.get("/:orderId", withAuth(false), orderController.getOrderById);
orderRouter.get("/number/:orderNumber", withAuth(false), orderController.getOrderByNumber);
orderRouter.post("/:orderId/cancel", withAuth(false), validate(orderSchema.cancelOrderSchema), orderController.cancelOrder);

// Razorpay payment routes
orderRouter.post("/razorpay/create-order", withAuth(false), validate(orderSchema.createRazorpayOrderSchema), orderController.createRazorpayOrder);
orderRouter.post("/razorpay/verify-payment", withAuth(false), validate(orderSchema.verifyRazorpayPaymentSchema), orderController.verifyRazorpayPayment);
orderRouter.post("/razorpay/webhook", orderController.razorpayWebhook); // Public webhook endpoint

// Admin routes
orderRouter.get("/admin/all", withAuth(true), orderController.getAllOrders);
orderRouter.get("/admin/:orderId", withAuth(true), orderController.getOrderByIdAdmin);
orderRouter.patch("/:orderId/status", withAuth(true), validate(orderSchema.updateOrderStatusSchema), orderController.updateOrderStatus);
orderRouter.patch("/:orderId/payment", withAuth(true), validate(orderSchema.updatePaymentStatusSchema), orderController.updatePaymentStatus);
orderRouter.get("/stats/summary", withAuth(true), orderController.getOrderStats);
orderRouter.post("/:orderId/admin-cancel", withAuth(true), validate(orderSchema.adminCancelOrderSchema), orderController.adminCancelOrder);
orderRouter.post("/:orderId/refund", withAuth(true), validate(orderSchema.refundOrderSchema), orderController.refundOrder);
