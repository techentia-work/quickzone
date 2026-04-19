"use client";

import showCaseProductApi from "@/lib/api/showCaseProducts/showCaseProdcuts.api";
import { PaginationResponse } from "@/lib/types";
import {
  CreateShowcaseProductPayload,
  ShowcaseProductType,
  UpdateShowcaseProductPayload,
} from "@/lib/types/showCaseProduct/showCaseProduct.types";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export const useAdminShowcaseProduct = (queryParams?: string) => {
  const queryClient = useQueryClient();

  const [selectedShowcase, setSelectedShowcase] =
    useState<ShowcaseProductType | null>(null);

  const [pagination, setPagination] =
    useState<PaginationResponse | null>(null);

  // ===============================
  // GET ALL SHOWCASES (PAGINATED)
  // ===============================
  const {
    data: showcases = [],
    isLoading: isLoadingShowcases,
    error: showcasesError,
    refetch: refetchShowcases,
  } = useQuery({
    queryKey: ["admin", "showcases", queryParams],
    queryFn: async () => {
      const res = await showCaseProductApi.getAll(queryParams);

      setPagination(res?.data?.pagination ?? null);

      return (res?.data?.showcases ?? []) as ShowcaseProductType[];
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // ===============================
  // GET BY ID
  // ===============================
  const getShowcaseById = useCallback(
    async (id: string) => {
      const res = await showCaseProductApi.getById(id);
      const data = res?.data as ShowcaseProductType;

      if (data) {
        setSelectedShowcase(data);

        // 🔥 cache update
        queryClient.setQueryData(
          ["admin", "showcases", id],
          data
        );
      }

      return data;
    },
    [queryClient]
  );

  // ===============================
  // CREATE
  // ===============================
  const createShowcaseMutation = useMutation({
    mutationFn: (data: CreateShowcaseProductPayload) =>
      showCaseProductApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "showcases"],
      });
      toast.success("Showcase created successfully");
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ??
          "Failed to create showcase"
      );
    },
  });

  // ===============================
  // UPDATE
  // ===============================
  const updateShowcaseMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateShowcaseProductPayload;
    }) => showCaseProductApi.update(id, data),

    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "showcases"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "showcases", variables.id],
      });

      if (
        response?.data &&
        selectedShowcase?._id === variables.id
      ) {
        setSelectedShowcase(response.data);
      }

      toast.success("Showcase updated successfully");
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ??
          "Failed to update showcase"
      );
    },
  });

  // ===============================
  // DELETE
  // ===============================
  const deleteShowcaseMutation = useMutation({
    mutationFn: (id: string) =>
      showCaseProductApi.delete(id),

    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "showcases"],
      });

      if (selectedShowcase?._id === deletedId) {
        setSelectedShowcase(null);
      }

      toast.success("Showcase deleted successfully");
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ??
          "Failed to delete showcase"
      );
    },
  });

  // ===============================
  // WRAPPED FUNCTIONS
  // ===============================
  const createShowcase = useCallback(
    (data: CreateShowcaseProductPayload) =>
      createShowcaseMutation.mutateAsync(data),
    [createShowcaseMutation]
  );

  const updateShowcase = useCallback(
    (id: string, data: UpdateShowcaseProductPayload) =>
      updateShowcaseMutation.mutateAsync({ id, data }),
    [updateShowcaseMutation]
  );

  const deleteShowcase = useCallback(
    (id: string) =>
      deleteShowcaseMutation.mutateAsync(id),
    [deleteShowcaseMutation]
  );

  // ===============================
  // MUTATION LOADER
  // ===============================
  const isMutating = useMemo(
    () =>
      createShowcaseMutation.isPending ||
      updateShowcaseMutation.isPending ||
      deleteShowcaseMutation.isPending,
    [
      createShowcaseMutation.isPending,
      updateShowcaseMutation.isPending,
      deleteShowcaseMutation.isPending,
    ]
  );

  return {
    // Data
    showcases,
    pagination,
    selectedShowcase,
    setSelectedShowcase,

    // Loading
    isLoadingShowcases,
    isMutating,

    // Error
    showcasesError,

    // CRUD
    getShowcaseById,
    createShowcase,
    updateShowcase,
    deleteShowcase,

    // Mutations (optional for UI)
    mutations: {
      create: createShowcaseMutation,
      update: updateShowcaseMutation,
      delete: deleteShowcaseMutation,
    },

    // Utils
    refetchShowcases,
  };
};
