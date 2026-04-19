// hooks/entities/useOrder.ts

"use client";

import orderApi from "@/lib/api/order/order.api";
import {
  CreateOrderPayload,
  CancelOrderPayload,
  CreateRazorpayOrderPayload,
  VerifyRazorpayPaymentPayload,
} from "@/lib/types/order/order.payload";
import { OrderResponse } from "@/lib/types/order/order.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../auth/useAuth";

export const useOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // ✅ Fetch all user orders
  const { data, isLoading, isError, refetch } = useQuery<OrderResponse[]>({
    queryKey: ["orders", user?._id],
    queryFn: async () => {
      const res = await orderApi.getUserOrders();

      if (!res) {
        toast.error("Failed to fetch orders");
        return [];
      }

      // In case API response is nested
      const orders = (res as any)?.orders || res;
      return orders;
    },
    enabled: !!user?._id,
  });

  // ✅ Create Order
  const createMutation = useMutation({
    mutationFn: async (payload: CreateOrderPayload) =>
      orderApi.createOrder(payload),
    onSuccess: async (res) => {
      if (!res.success) {
        toast.error("Failed to place order");
        return;
      };
      // Don't show success toast here - will be shown after payment verification
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to place order";
      toast.error(errorMessage);
    },
  });

  // ✅ Create Razorpay Order
  const createRazorpayOrderMutation = useMutation({
    mutationFn: async (payload: CreateRazorpayOrderPayload) =>
      orderApi.createRazorpayOrder(payload),
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to initialize payment";
      toast.error(errorMessage);
    },
  });

  // ✅ Verify Razorpay Payment
  const verifyRazorpayPaymentMutation = useMutation({
    mutationFn: async (payload: VerifyRazorpayPaymentPayload) =>
      orderApi.verifyRazorpayPayment(payload),
    onSuccess: async (res) => {
      if (res.success) {
        toast.success("Payment verified successfully!");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Payment verification failed";
      toast.error(errorMessage);
    },
  });

  // ✅ Cancel Order
  const cancelMutation = useMutation({
    mutationFn: async ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: CancelOrderPayload;
    }) =>
      orderApi.cancelOrder(
        orderId,
        payload.reason ? { reason: payload.reason } : {}
      ),
    onSuccess: (res) => {
      if (!res) toast.error("Failed to cancel order");
      else toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] }); // Refetch wallet if refund was processed
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to cancel order";
      toast.error(errorMessage);
    },
  });

  // ✅ Get single order by ID
  const getOrderById = async (orderId: string) => {
    try {
      const res = await orderApi.getOrderById(orderId);
      if (!res) throw new Error();
      return res;
    } catch {
      toast.error("Failed to fetch order");
      return null;
    }
  };

  // ✅ Get single order by Order Number
  const getOrderByNumber = async (orderNumber: string) => {
    try {
      const res = await orderApi.getOrderByNumber(orderNumber);
      if (!res) throw new Error();
      return res;
    } catch {
      toast.error("Failed to fetch order");
      return null;
    }
  };

  return {
    orders: data ?? [],
    isLoading,
    isError,
    refetch,

    // Mutations
    createOrder: createMutation.mutateAsync,
    createRazorpayOrder: createRazorpayOrderMutation.mutateAsync,
    verifyRazorpayPayment: verifyRazorpayPaymentMutation.mutateAsync,
    cancelOrder: cancelMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isCreatingRazorpayOrder: createRazorpayOrderMutation.isPending,
    isVerifyingPayment: verifyRazorpayPaymentMutation.isPending,
    isCancelling: cancelMutation.isPending,

    // Fetch single
    getOrderById,
    getOrderByNumber,
  };
};