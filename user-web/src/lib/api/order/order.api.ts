// lib/api/order/order.api.ts

import {
  CreateOrderPayload,
  CancelOrderPayload,
  CreateRazorpayOrderPayload,
  VerifyRazorpayPaymentPayload,
  CreateRazorpayOrderResponse,
} from "@/lib/types";
import { OrderResponse } from "@/lib/types/order/order.types";
import axiosClient from "../client/axios";

const orderApi = {
  // Create order
  createOrder: async (data: CreateOrderPayload) => axiosClient.post<{ order: OrderResponse, requiresPayment: boolean, onlineAmount: number }>("/api/order/create", data),

  // Create Razorpay order
  createRazorpayOrder: async (data: CreateRazorpayOrderPayload) => axiosClient.post<CreateRazorpayOrderResponse>("/api/order/razorpay/create-order", data),

  // Verify Razorpay payment
  verifyRazorpayPayment: async (data: VerifyRazorpayPaymentPayload) => axiosClient.post<OrderResponse>("/api/order/razorpay/verify-payment", data),

  // Get user orders
  getUserOrders: async (): Promise<OrderResponse[]> => {
    const res = await axiosClient.get<OrderResponse[]>("/api/order");
    return res.data ?? [];
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    const res = await axiosClient.get<OrderResponse>(`/api/order/${orderId}`);
    if (!res.data) {
      throw new Error("Order not found");
    }
    return res.data;
  },

  // Get order by number
  getOrderByNumber: async (orderNumber: string): Promise<OrderResponse> => {
    const res = await axiosClient.get(`/api/order/number/${orderNumber}`);
    const data = res.data as { data: OrderResponse };
    return data.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string, payload: CancelOrderPayload) => {
    const res = await axiosClient.post(`/api/order/${orderId}/cancel`, payload);
    return res.data;
  },
};

export default orderApi;