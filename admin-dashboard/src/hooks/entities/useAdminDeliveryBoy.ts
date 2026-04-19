"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { PaginationResponse } from "@/lib/types";
import { DeliveryBoyProfileResponse, DeliveryBoyType } from "@/lib/types/deliveryBoy/deliveryBoy.types";
import deliveryBoyApi from "@/lib/api/deliveryBoy/deliveryBoy.api";
import {
  AssignOrderPayload,
  CreateDeliveryBoyPayload,
  UpdateDeliveryBoyStatusPayload,
  UpdateDeliveryBoyPayload,
} from "@/lib/types/deliveryBoy/deliveryBoypayload";

export const useAdminDeliveryBoy = (queryParams?: string) => {
  const queryClient = useQueryClient();

  const [selectedDeliveryBoy, setSelectedDeliveryBoy] =
    useState<DeliveryBoyType | null>(null);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);

  /** ---------------------------- FETCH DELIVERY BOYS ---------------------------- **/

  const {
    data: deliveryBoyResponse,
    isLoading: isLoadingDeliveryBoys,
    error: deliveryBoysError,
    refetch: refetchDeliveryBoys,
  } = useQuery({
    queryKey: ["admin", "deliveryBoys", queryParams],
    queryFn: async () => {
      const res = await deliveryBoyApi.getAll(queryParams);
      if (!res) throw new Error("Failed to fetch delivery boys");

      const deliveryBoys = res.deliveryBoys ?? [];
      setPagination(res.pagination ?? null);
      return deliveryBoys;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });

  const deliveryBoys: DeliveryBoyType[] = deliveryBoyResponse ?? [];

  const { data: selectedDeliveryBoyData } = useQuery({
    queryKey: ["admin", "deliveryBoy", selectedDeliveryBoy?._id],
    queryFn: async () => {
      if (!selectedDeliveryBoy?._id) return null;
      const res = await deliveryBoyApi.getById(selectedDeliveryBoy._id);
      return res;
    },
    enabled: !!selectedDeliveryBoy?._id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  /** ---------------------------- MUTATIONS ---------------------------- **/

  // ✅ Create Delivery Boy
  const createDeliveryBoyMutation = useMutation({
    mutationFn: async (data: CreateDeliveryBoyPayload)  =>
      await deliveryBoyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "deliveryBoys"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create delivery boy");
    },
  });

  // ✅ Update Delivery Boy (Full)
  const updateDeliveryBoyMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      data: UpdateDeliveryBoyPayload;
    }) => await deliveryBoyApi.update(payload.id, payload.data),
    onSuccess: () => {
      toast.success("Delivery boy updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "deliveryBoys"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update delivery boy");
    },
  });

  // ✅ Update Delivery Boy Status
  const updateStatusMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      data: UpdateDeliveryBoyStatusPayload;
    }) => await deliveryBoyApi.updateStatus(payload.id, payload.data),
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "deliveryBoys"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update status");
    },
  });

  // ✅ Assign Order to Delivery Boy
  const assignOrderMutation = useMutation({
    mutationFn: async (data: AssignOrderPayload) =>
      await deliveryBoyApi.assignOrder(data),
    onSuccess: (res) => {
      console.log(res)
      toast.success("Order assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "deliveryBoys"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to assign order");
    },
  });

  // ✅ Delete Delivery Boy
  const deleteDeliveryBoyMutation = useMutation({
    mutationFn: async (id: string) => await deliveryBoyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "deliveryBoys"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete delivery boy");
    },
  });

  /** ---------------------------- COMPUTED STATES ---------------------------- **/

  const isMutating = useMemo(
    () =>
      createDeliveryBoyMutation.isPending ||
      updateDeliveryBoyMutation.isPending ||
      updateStatusMutation.isPending ||
      assignOrderMutation.isPending ||
      deleteDeliveryBoyMutation.isPending,
    [
      createDeliveryBoyMutation.isPending,
      updateDeliveryBoyMutation.isPending,
      updateStatusMutation.isPending,
      assignOrderMutation.isPending,
      deleteDeliveryBoyMutation.isPending,
    ]
  );

  /** ---------------------------- HELPERS ---------------------------- **/

  // const getAvailableDeliveryBoys = useCallback(
  //   () => deliveryBoys.filter((d) => d.status === "AVAILABLE" && d.isActive),
  //   [deliveryBoys]
  // );

  const clearSelectedDeliveryBoy = useCallback(
    () => setSelectedDeliveryBoy(null),
    []
  );

  /** ---------------------------- RETURN ---------------------------- **/

  return {
    // Data
    deliveryBoys,
    pagination,
    selectedDeliveryBoy,

    // Loading states
    isLoadingDeliveryBoys,
    isMutating,

    // Errors
    deliveryBoysError,

    // CRUD actions
    createDeliveryBoy: (data: CreateDeliveryBoyPayload) =>
      createDeliveryBoyMutation.mutateAsync(data),
    updateDeliveryBoy: (id: string, data: UpdateDeliveryBoyPayload) =>
      updateDeliveryBoyMutation.mutateAsync({ id, data }),
    updateStatus: (id: string, data: UpdateDeliveryBoyStatusPayload) =>
      updateStatusMutation.mutateAsync({ id, data }),
    assignOrder: (data: AssignOrderPayload) =>
      assignOrderMutation.mutateAsync(data),
    deleteDeliveryBoy: (id: string) =>
      deleteDeliveryBoyMutation.mutateAsync(id),
    getDeliveryBoyById: selectedDeliveryBoyData,

    // Helpers
    setSelectedDeliveryBoy,
    clearSelectedDeliveryBoy,

    // Counts
    totalDeliveryBoys: deliveryBoys?.length ?? 0,

    // Refetch
    refetchDeliveryBoys,
  };
};
