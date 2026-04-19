// @/lib/schema/deliveryBoy/deliveryBoy.schema.ts

import { z } from "zod";
import { DeliveryBoyStatus } from "../../types/deliveryboy/deliveryBoy.types";
import { OrderStatus } from "../../types/index";

const DeliveryBoyStatusEnum = z.nativeEnum(DeliveryBoyStatus);

export const deliveryBoySchema = {
  createDeliveryBoySchema: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters").trim(),
    phone: z.string().min(10, "Phone number must be 10 digits").trim(),
    address: z.string().optional(),
  }),

  updateDeliveryBoySchema: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters").trim().optional(),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number cannot exceed 15 digits").regex(/^\+?[0-9\s-()]+$/, "Invalid phone number format").trim().optional(),
    email: z.string().email("Valid email is required").toLowerCase().trim().optional(),
    address: z.string().optional(),
  }),

  loginSchema: z.object({
    email: z.string().email("Valid email is required").toLowerCase().trim(),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
  }),

  updateStatusSchema: z.object({
    status: DeliveryBoyStatusEnum,
  }),

  assignOrderSchema: z.object({
    orderId: z.string().min(1, "Order ID is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid Order ID format"),
    deliveryBoyId: z.string().min(1, "Delivery Boy ID is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid Delivery Boy ID format"),
  }),

  unassignOrderSchema: z.object({
    orderId: z.string().min(1, "Order ID is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid Order ID format"),
  }),

  acceptRejectOrderSchema: z.object({
    orderId: z.string().min(1, "Order ID is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid Order ID format"),
    reason:  z.union([z.string().max(500, "Reason cannot exceed 500 characters"), z.literal(""), z.null(), z.undefined(),]).optional().transform((val) => { if (val === "" || val == null) return undefined; return val; }), // Optional for accept, but good to have for reject
  }),

  updateDeliveryStatusSchema: z.object({
    orderId: z.string().min(1, "Order ID is required").regex(/^[0-9a-fA-F]{24}$/, "Invalid Order ID format"),
    status: z.enum(Object.values(OrderStatus), "Status must be either OUT_FOR_DELIVERY or DELIVERED"),
    deliveryNotes: z.union([z.string().max(500, "Delivery notes cannot exceed 500 characters"), z.literal(""), z.null(), z.undefined(),]).optional().transform((val) => { if (val === "" || val == null) return undefined; return val; }),
    deliveryProof: z.union([z.string().url("Invalid URL format"), z.literal(""), z.null(), z.undefined(),]).optional().transform((val) => { if (val === "" || val == null) return undefined; return val; }),
  }),

  bulkStatusUpdateSchema: z.object({
    deliveryBoyIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Delivery Boy ID format")).min(1, "At least one delivery boy ID is required").max(50, "Cannot update more than 50 delivery boys at once"),
    status: DeliveryBoyStatusEnum,
  }),

  searchDeliveryBoysSchema: z.object({
    query: z.string().min(1, "Search query is required").optional(),
    status: DeliveryBoyStatusEnum.optional(),
    isActive: z.string().transform((val) => val === "true").optional(),
    page: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive().max(100)).optional(),
  }),
};
