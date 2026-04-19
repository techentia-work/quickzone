import {
  CancelOrderPayload,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  UpdatePaymentStatusPayload,
} from "@/lib/types/order/order.payload";
import axiosClient from "../client/axios";
import { OrderType } from "@/lib/types/order/order.types";
import { PaginationResponse } from "@/lib/types";

export const orderApi = {
  /** 🧾 USER: Create a new order */
  create: (data: CreateOrderPayload) =>
    axiosClient.post<OrderType>("/api/order/create", data),

  /** 👤 USER: Get all orders of the logged-in user */
  getUserOrders: (query?: string) =>
    axiosClient.get<{ orders: OrderType[]; pagination: PaginationResponse }>(
      `/api/order${query ? `?${query}` : ""}`
    ),

  /** 🔎 USER: Get order details by ID */
  getById: (orderId: string) =>
    axiosClient.get<OrderType>(`/api/order/${orderId}`),

  /** 🔢 USER: Get order by order number */
  getByOrderNumber: (orderNumber: string) =>
    axiosClient.get<OrderType>(`/api/order/number/${orderNumber}`),

  /** ❌ USER: Cancel order */
  cancelOrder: (orderId: string, data: CancelOrderPayload) =>
    axiosClient.post(`/api/order/${orderId}/cancel`, data),

  // ==============================
  // 🔐 ADMIN ROUTES
  // ==============================

  /** 🧠 ADMIN: Get all orders (paginated + filtered) */
  getAllOrders: (query?: string) =>
    axiosClient.get<{ orders: OrderType[]; pagination: PaginationResponse }>(
      `/api/order/admin/all${query ? `?${query}` : ""}`
    ),

  /** 🔍 ADMIN: Get single order details */
  getOrderByIdAdmin: (orderId: string) =>
    axiosClient.get<OrderType>(`/api/order/admin/${orderId}`),

  /** 🔄 ADMIN: Update order status */
  updateOrderStatus: (orderId: string, data: UpdateOrderStatusPayload) =>
    axiosClient.patch<OrderType>(`/api/order/${orderId}/status`, data),

  /** 💳 ADMIN: Update payment status */
  updatePaymentStatus: (orderId: string, data: UpdatePaymentStatusPayload) =>
    axiosClient.patch<OrderType>(`/api/order/${orderId}/payment`, data),

  /** 📊 ADMIN: Get order statistics summary */
  getOrderStats: () =>
    axiosClient.get<{
      totalOrders: number;
      totalRevenue: number;
      statusWise: {
        _id: string;
        count: number;
        totalAmount: number;
      }[];
    }>("/api/order/stats/summary"),

  /** 🚫 ADMIN: Cancel order manually */
  adminCancelOrder: (orderId: string, data: CancelOrderPayload) =>
    axiosClient.post(`/api/order/${orderId}/admin-cancel`, data),
};

export default orderApi;
