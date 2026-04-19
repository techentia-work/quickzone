"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import orderApi from "@/lib/api/order/order.api";
import {
  CancelOrderPayload,
  OrderType,
  UpdateOrderStatusPayload,
  UpdatePaymentStatusPayload,
} from "@/lib/types/order/order.types";
import { PaginationResponse } from "@/lib/types";

export const useAdminOrder = (queryParams?: string) => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);

  /** ---------------------------- FETCH ORDERS ---------------------------- **/

  // Paginated orders
  const {
    data: orders = [],
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["admin", "orders", queryParams],
    queryFn: async () => {
      const res = await orderApi.getAllOrders(queryParams); // Update your API to accept pagination/filter params
      const data = res?.data as any;
      setPagination(data?.pagination ?? null);
      return data?.orders || data || [];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  // Fetch single order by ID
  const getOrderByIdQuery = useCallback((id?: string) => {
    return useQuery({
      queryKey: ["admin", "order", id],
      queryFn: async (): Promise<any> => {
        if (!id) throw new Error("Missing order ID");
        const res = await orderApi.getOrderByIdAdmin(id);
        console.log( "Res data 11",res.data);

        if (!res) throw new Error("Order not found");
        return res.data;
      },
      enabled: !!id,
      staleTime: 60 * 1000,
    });
  }, []);

  // Fetch stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin", "orders", "stats"],
    queryFn: async () => {
      const res = await orderApi.getOrderStats();
      console.log("RES", res);

      return res ?? {};
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  /** ---------------------------- MUTATIONS ---------------------------- **/

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateOrderStatusPayload;
    }) => orderApi.updateOrderStatus(orderId, data),
    onSuccess: (res) => {
      toast.success(res?.message || "Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "stats"] });
    },
    onError: () => toast.error("Failed to update order status"),
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdatePaymentStatusPayload;
    }) => orderApi.updatePaymentStatus(orderId, data),
    onSuccess: (res) => {
      toast.success(res?.message || "Payment status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: () => toast.error("Failed to update payment status"),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: CancelOrderPayload;
    }) => orderApi.adminCancelOrder(orderId, data),
    onSuccess: (res) => {
      toast.success(res?.message || "Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "stats"] });
    },
    onError: () => toast.error("Failed to cancel order"),
  });

  /** ---------------------------- COMPUTED STATES ---------------------------- **/

  const isMutating = useMemo(
    () =>
      updateOrderStatusMutation.isPending ||
      updatePaymentStatusMutation.isPending ||
      cancelOrderMutation.isPending,
    [
      updateOrderStatusMutation.isPending,
      updatePaymentStatusMutation.isPending,
      cancelOrderMutation.isPending,
    ]
  );

  /** ---------------------------- HELPERS ---------------------------- **/

  const getPendingOrders = useCallback(
    () => orders.filter((o: OrderType) => o.status === "PROCESSING"),
    [orders]
  );

  const getDeliveredOrders = useCallback(
    () => orders.filter((o: any) => o.status === "DELIVERED"),
    [orders]
  );

  const getCancelledOrders = useCallback(
    () => orders.filter((o: any) => o.status === "CANCELLED"),
    [orders]
  );

  const clearSelectedOrder = useCallback(() => setSelectedOrder(null), []);

  /** ---------------------------- RETURN ---------------------------- **/

  return {
    orders,
    pagination,
    stats,
    selectedOrder,

    // Loading
    isLoadingOrders,
    isLoadingStats,
    isMutating,

    // Errors
    ordersError,
    statsError,

    // CRUD
    getOrderByIdQuery,
    updateOrderStatus: (orderId: string, data: UpdateOrderStatusPayload) =>
      updateOrderStatusMutation.mutateAsync({ orderId, data }),
    updatePaymentStatus: (orderId: string, data: UpdatePaymentStatusPayload) =>
      updatePaymentStatusMutation.mutateAsync({ orderId, data }),
    cancelOrder: (orderId: string, data: CancelOrderPayload) =>
      cancelOrderMutation.mutateAsync({ orderId, data }),

    // Helpers
    setSelectedOrder,
    clearSelectedOrder,
    getPendingOrders,
    getDeliveredOrders,
    getCancelledOrders,

    // Stats
    totalOrders: orders?.length,
    pendingOrdersCount: getPendingOrders()?.length,
    deliveredOrdersCount: getDeliveredOrders()?.length,
    cancelledOrdersCount: getCancelledOrders()?.length,

    // Refetch
    refetchOrders,
    refetchStats,
  };
};
