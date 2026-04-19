import { z } from "zod";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../types/index";

const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  googleLocation: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  country: z.string().default("India"),
  landmark: z.string().optional(),
});

export const orderSchema = {
  createOrderSchema: z
    .object({
      shippingAddressId: z.string().optional(),
      billingAddressId: z
        .union([z.string(), z.literal(""), z.null(), z.undefined()])
        .optional()
        .transform((val) => {
          if (val === "" || val == null) return undefined;
          return val;
        }),
      useNewAddress: z
        .union([z.boolean(), z.literal(""), z.null(), z.undefined()])
        .optional()
        .transform((val) => {
          if (val === "" || val == null) return undefined;
          return val;
        }),
      shippingAddress: ShippingAddressSchema.optional(),
      billingAddress: ShippingAddressSchema.optional(),
      paymentMethod: z.enum(Object.values(PaymentMethod)),
      walletAmount: z
        .union([z.number(), z.null(), z.undefined()])
        .optional()
        .transform((val) => {
          if (val == null) return undefined;
          return val;
        }),
      notes: z
        .union([z.string(), z.literal(""), z.null(), z.undefined()])
        .optional()
        .transform((val) => {
          if (val === "" || val == null) return undefined;
          return val;
        }),
    })
    .refine(
      (data) =>
        data.shippingAddressId || (data.useNewAddress && data.shippingAddress),
      {
        message:
          "Either shippingAddressId or shippingAddress with useNewAddress flag is required",
        path: ["shippingAddressId"],
      }
    ),

  // Razorpay create order schema
  createRazorpayOrderSchema: z.object({
    orderId: z.string().min(1, "Order ID is required"),
  }),

  // Razorpay verify payment schema
  verifyRazorpayPaymentSchema: z.object({
    orderId: z.string().min(1, "Order ID is required"),
    razorpay_order_id: z.string().min(1, "Razorpay order ID is required"),
    razorpay_payment_id: z.string().min(1, "Razorpay payment ID is required"),
    razorpay_signature: z.string().min(1, "Razorpay signature is required"),
  }),

  cancelOrderSchema: z.object({
    reason: z.string().optional(),
  }),

  updateOrderStatusSchema: z.object({
    status: z.enum(Object.values(OrderStatus) as [string, ...string[]]),
    comment: z.string().optional(),
  }),

  updatePaymentStatusSchema: z.object({
    paymentStatus: z.enum(Object.values(PaymentStatus) as [any, ...any[]]),
    paymentId: z.string().optional(),
    transactionId: z.string().optional(),
  }),

  adminCancelOrderSchema: z.object({
    reason: z.string().min(1, "Cancellation reason is required").max(500),
  }),

  // Refund order schema
  refundOrderSchema: z.object({
    amount: z.number().positive().optional(), // Partial refund amount (optional)
    reason: z.string().min(1, "Refund reason is required").max(500),
  }),
};
