"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  ShopByStoreType,
  CreateShopByStorePayload,
} from "@/lib/types/shopByStore/shopByStore.types";
import shopByStoreApi from "@/lib/api/shopByStore/shopByStore.api";

export const useAdminShopByStore = (queryParams?: string) => {
  const queryClient = useQueryClient();

  const [selectedItem, setSelectedItem] =
    useState<ShopByStoreType | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  /* ================= LIST (🔥 FIXED) ================= */
  const {
    data: list = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "shop-by-store", queryParams],
    queryFn: async () => {
      const res = await shopByStoreApi.getAll(queryParams);

      // ✅ BACKEND RESPONSE MATCH
      const items: ShopByStoreType[] =
        res?.data?.items?? [];

      const pagination =
        res?.data?.pagination ?? null;

      setPagination(pagination);

      // ✅ Table needs `id`
      return items.map((item) => ({
        ...item,
        id: item._id,
      }));
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  /* ================= CREATE ================= */
  const createMutation = useMutation({
    mutationFn: (data: CreateShopByStorePayload) =>
      shopByStoreApi.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "shop-by-store"],
      }),
  });

  /* ================= UPDATE ================= */
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateShopByStorePayload>;
    }) => shopByStoreApi.update(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "shop-by-store"],
      }),
  });

  /* ================= DELETE ================= */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => shopByStoreApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "shop-by-store"],
      }),
  });

  /* ================= TOGGLE ================= */
  const toggleMutation = useMutation({
    mutationFn: (id: string) => shopByStoreApi.toggleStatus(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "shop-by-store"],
      }),
  });

  /* ================= MUTATING ================= */
  const isMutating = useMemo(
    () =>
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      toggleMutation.isPending,
    [
      createMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
      toggleMutation.isPending,
    ]
  );

  return {
    list,
    pagination,
    selectedItem,
    setSelectedItem,

    isLoading,
    isMutating,
    error,
    refetch,

    create: createMutation.mutateAsync,
    update: (id: string, data: Partial<CreateShopByStorePayload>) =>
      updateMutation.mutateAsync({ id, data }),
    remove: deleteMutation.mutateAsync,
    toggleStatus: toggleMutation.mutateAsync,
  };
};
