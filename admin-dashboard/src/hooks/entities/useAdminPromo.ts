"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { PaginationResponse } from "@/lib/types";
import {
  PromoType,
  PromoUsageHistory,
} from "@/lib/types/promocode/promocode.types";
import promoApi from "@/lib/api/promocode/promocode.api";
import {
  BulkCreatePromoPayload,
  CreatePromoPayload,
  UpdatePromoPayload,
} from "@/lib/types/promocode/promocode.payload";

/**
 * Admin Promo Management Hook
 * Handles fetching, creating, updating, deleting, and managing promos.
 */
export const useAdminPromo = (queryParams?: string) => {
  const queryClient = useQueryClient();

  /** ---------------------------- STATE ---------------------------- **/
  const [selectedPromo, setSelectedPromo] = useState<PromoType | null>(null);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);

  /** ---------------------------- FETCH PROMOS ---------------------------- **/

  // All promos (with pagination)
  const {
    data: promos = [],
    isLoading: isLoadingPromos,
    error: promosError,
    refetch: refetchPromos,
  } = useQuery({
    queryKey: ["admin", "promos", queryParams],
    queryFn: async () => {
      const res = await promoApi.getAll(queryParams);

      setPagination(res.data?.pagination ?? null);
      return res.data?.promocodes || [];
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // Single promo by ID
  const getPromoByIdQuery = useCallback((id?: string) => {
    return useQuery({
      queryKey: ["admin", "promo", id],
      queryFn: async (): Promise<PromoType> => {
        if (!id) throw new Error("Missing promo ID");
        const res = await promoApi.getById(id);
        if (!res.data) throw new Error("Promo not found");
        return res.data;
      },
      enabled: !!id,
      staleTime: 60 * 1000,
    });
  }, []);

  // Promo statistics
  const {
    data: promoStats = { total: 0, active: 0, expired: 0 },
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin", "promos", "stats"],
    queryFn: async () => {
      const res = await promoApi.getStats();
      console.log("Resssssss", res);

      return res.data?.statistics.overview;
    },
    refetchOnWindowFocus: false,
  });

  // Promo usage history (on demand)
  const getPromoUsageHistoryQuery = useCallback((id?: string) => {
    return useQuery({
      queryKey: ["admin", "promo", id, "usage"],
      queryFn: async (): Promise<PromoUsageHistory[]> => {
        if (!id) throw new Error("Missing promo ID");
        const res = await promoApi.getUsageHistory(id);
        return res.data?.usageHistory || [];
      },
      enabled: !!id,
      staleTime: 60 * 1000,
    });
  }, []);

  /** ---------------------------- MUTATIONS ---------------------------- **/

  // Create Promo
  const createPromoMutation = useMutation({
    mutationFn: (data: CreatePromoPayload) => promoApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promos"] });
      if (res?.data) setSelectedPromo(res.data);
    },
    onError: () => toast.error("Failed to create promo"),
  });

  // Bulk Create Promos
  const bulkCreatePromosMutation = useMutation({
    mutationFn: (data: BulkCreatePromoPayload) => promoApi.bulkCreate(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promos"] });
      toast.success("Bulk promos created successfully");
    },
    onError: () => toast.error("Failed to create promos"),
  });

  // Update Promo
  const updatePromoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromoPayload }) =>
      promoApi.update(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promos"] });
      if (res?.data) setSelectedPromo(res.data);
    },
    onError: () => toast.error("Failed to update promo"),
  });

  // Toggle Promo Status
  const togglePromoStatusMutation = useMutation({
    mutationFn: (id: string) => promoApi.toggleStatus(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promos"] });
      toast.success(
        res.data?.active
          ? "Promo activated successfully"
          : "Promo deactivated successfully"
      );
    },
    onError: () => toast.error("Failed to toggle promo status"),
  });

  // Delete Promo
  const deletePromoMutation = useMutation({
    mutationFn: (id: string) => promoApi.delete(id),
    onSuccess: (res, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promos"] });
      if (selectedPromo?._id === id) setSelectedPromo(null);
      toast.success("Promo deleted successfully");
    },
    onError: () => toast.error("Failed to delete promo"),
  });

  /** ---------------------------- STATUS COMPUTATIONS ---------------------------- **/

  const isMutating = useMemo(
    () =>
      createPromoMutation.isPending ||
      updatePromoMutation.isPending ||
      deletePromoMutation.isPending ||
      bulkCreatePromosMutation.isPending ||
      togglePromoStatusMutation.isPending,
    [
      createPromoMutation.isPending,
      updatePromoMutation.isPending,
      deletePromoMutation.isPending,
      bulkCreatePromosMutation.isPending,
      togglePromoStatusMutation.isPending,
    ]
  );

  /** ---------------------------- HELPERS ---------------------------- **/

  const clearSelectedPromo = useCallback(() => setSelectedPromo(null), []);

  const getActivePromos = useCallback(
    () => promos.filter((promo) => promo.active),
    [promos]
  );

  const getInactivePromos = useCallback(
    () => promos.filter((promo) => !promo.active),
    [promos]
  );

  /** ---------------------------- RETURN ---------------------------- **/

  return {
    promos,
    promoStats,
    pagination,
    selectedPromo,

    // Loading states
    isLoadingPromos,
    isLoadingStats,
    isMutating,

    // Errors
    promosError,

    // Refetchers
    refetchPromos,
    refetchStats,

    // CRUD
    getPromoByIdQuery,
    getPromoUsageHistoryQuery,
    createPromo: (data: CreatePromoPayload) =>
      createPromoMutation.mutateAsync(data),
    bulkCreatePromos: (data: BulkCreatePromoPayload) =>
      bulkCreatePromosMutation.mutateAsync(data),
    updatePromo: (id: string, data: UpdatePromoPayload) =>
      updatePromoMutation.mutateAsync({ id, data }),
    togglePromoStatus: (id: string) =>
      togglePromoStatusMutation.mutateAsync(id),
    deletePromo: (id: string) => deletePromoMutation.mutateAsync(id),

    // Helpers
    setSelectedPromo,
    clearSelectedPromo,
    getActivePromos,
    getInactivePromos,

    // Counts
    totalPromos: promos?.length ?? 0,
    activePromosCount: getActivePromos()?.length ?? 0,
    inactivePromosCount: getInactivePromos()?.length ?? 0,
  };
};
