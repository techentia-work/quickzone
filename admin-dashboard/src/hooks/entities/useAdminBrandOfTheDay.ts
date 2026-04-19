"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  BrandOfTheDayType,
  CreateBrandOfTheDayPayload,
} from "@/lib/types/brandOfTheDay/brandOfTheDay.types";
import brandOfTheDayApi from "@/lib/api/brandOfTheDay/brandOfTheDay.api";

export const useAdminBrandOfTheDay = (queryParams?: string) => {
  const queryClient = useQueryClient();

  const [selectedItem, setSelectedItem] =
    useState<BrandOfTheDayType | null>(null);

  /* ================= LIST ================= */
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "brand-of-the-day", queryParams],
    queryFn: async () => {
      const res = await brandOfTheDayApi.getAll(queryParams);

      return {
        items: (res?.data?.items ?? []).map((item) => ({
          ...item,
          id: item._id, // table compatibility
        })),
        pagination: res?.data?.pagination ?? null,
      };
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const list = data?.items ?? [];
  const pagination = data?.pagination ?? null;

  /* ================= INVALIDATE ================= */
  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin", "brand-of-the-day"],
    });

  /* ================= CREATE ================= */
  const createMutation = useMutation({
    mutationFn: (data: CreateBrandOfTheDayPayload) =>
      brandOfTheDayApi.create(data),
    onSuccess: invalidateList,
  });

  /* ================= UPDATE ================= */
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateBrandOfTheDayPayload>;
    }) => brandOfTheDayApi.update(id, data),
    onSuccess: invalidateList,
  });

  /* ================= DELETE ================= */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandOfTheDayApi.delete(id),
    onSuccess: invalidateList,
  });

  /* ================= TOGGLE ================= */
  const toggleMutation = useMutation({
    mutationFn: (id: string) =>
      brandOfTheDayApi.toggleStatus(id),
    onSuccess: invalidateList,
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
    update: (id: string, data: Partial<CreateBrandOfTheDayPayload>) =>
      updateMutation.mutateAsync({ id, data }),
    remove: deleteMutation.mutateAsync,
    toggleStatus: toggleMutation.mutateAsync,
  };
};
