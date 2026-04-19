"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  FeaturedWeekBrandType,
  CreateFeaturedWeekBrandPayload,
} from "@/lib/types/featuredWeekBrand/featuredWeekBrand.types";
import featuredWeekBrandApi from "@/lib/api/featuredWeekBrand/featuredWeekBrand.api";

export const useAdminFeaturedWeekBrand = (queryParams?: string) => {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] =
    useState<FeaturedWeekBrandType | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  // LIST
  const {
    data: list = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "featured-week-brand", queryParams],
    queryFn: async () => {
      const res = await featuredWeekBrandApi.getAll(queryParams);
      setPagination(res?.data?.pagination ?? null);
      return res?.data?.items ?? [];
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // CREATE
  const createMutation = useMutation({
    mutationFn: (data: CreateFeaturedWeekBrandPayload) =>
      featuredWeekBrandApi.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "featured-week-brand"],
      }),
  });

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateFeaturedWeekBrandPayload>;
    }) => featuredWeekBrandApi.update(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "featured-week-brand"],
      }),
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: (id: string) => featuredWeekBrandApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "featured-week-brand"],
      }),
  });

  // TOGGLE
  const toggleMutation = useMutation({
    mutationFn: (id: string) => featuredWeekBrandApi.toggleStatus(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "featured-week-brand"],
      }),
  });

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
    update: (id: string, data: Partial<CreateFeaturedWeekBrandPayload>) =>
      updateMutation.mutateAsync({ id, data }),
    remove: deleteMutation.mutateAsync,
    toggleStatus: toggleMutation.mutateAsync,
  };
};
