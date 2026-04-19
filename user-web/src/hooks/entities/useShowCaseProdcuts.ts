"use client";

import showCaseProductApi from "@/lib/api/showCaseProducts/showCaseProducts.api";
import { PaginationResponse } from "@/lib/types";
import {
  CreateShowcaseProductPayload,
  ShowcaseProductType,
  UpdateShowcaseProductPayload,
} from "@/lib/types/showCaseProducts/showCaseProducts.types";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export const useShowcaseProduct = (queryParams?: string) => {
  const queryClient = useQueryClient();

  const [selectedShowcase, setSelectedShowcase] =
    useState<ShowcaseProductType | null>(null);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);

  const {
    data: showcases = [],
    isLoading: isLoadingShowcases,
    error: showcasesError,
    refetch: refetchShowcases,
  } = useQuery({
    queryKey: ["showcases", queryParams],
    queryFn: async () => {
      const res = await showCaseProductApi.getAll(queryParams);
      setPagination(res?.data?.pagination ?? null);
      return res?.data?.showcases ?? [];
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const getShowcaseById = useCallback(async (id: string) => {
    try {
      const response = await showCaseProductApi.getById(id);
      const data = response?.data;
      if (data) setSelectedShowcase(data);
      return data;
    } catch (error) {
      console.error("Error fetching showcase:", error);
      throw error;
    }
  }, []);

  const createShowcaseMutation = useMutation({
    mutationFn: async (data: CreateShowcaseProductPayload) => {
      const res = await showCaseProductApi.create(data);
      return res;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "showcases"] });
    },
    onError: (error) => {
      console.error("Error creating showcase:", error);
    },
  });

  const updateShowcaseMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateShowcaseProductPayload;
    }) => showCaseProductApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "showcases"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "showcases", variables.id],
      });

      if (response?.data && selectedShowcase?._id === variables.id) {
        setSelectedShowcase(response.data);
      }

      toast.success("Showcase updated successfully");
    },
    onError: (error) => {
      console.error("Error updating showcase:", error);
      toast.error("Failed to update showcase");
    },
  });

  const deleteShowcaseMutation = useMutation({
    mutationFn: (id: string) => showCaseProductApi.delete(id),
    onSuccess: (response, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "showcases"] });

      if (selectedShowcase?._id === deletedId) {
        setSelectedShowcase(null);
      }

      toast.success("Showcase deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting showcase:", error);
      toast.error("Failed to delete showcase");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => showCaseProductApi.toggleStatus(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "showcases"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "showcases", id] });

      if (response?.data && selectedShowcase?._id === id) {
        setSelectedShowcase(response.data);
      }

      toast.success("Showcase status updated");
    },
    onError: (error) => {
      console.error("Error toggling showcase status:", error);
      toast.error("Failed to toggle showcase status");
    },
  });

  const createShowcase = useCallback(
    async (data: CreateShowcaseProductPayload) => {
      const result = await createShowcaseMutation.mutateAsync(data);
      return result;
    },
    [createShowcaseMutation]
  );

  const updateShowcase = useCallback(
    async (id: string, data: UpdateShowcaseProductPayload) => {
      const result = await updateShowcaseMutation.mutateAsync({ id, data });
      return result?.data;
    },
    [updateShowcaseMutation]
  );

  const deleteShowcase = useCallback(
    async (id: string) => {
      const result = await deleteShowcaseMutation.mutateAsync(id);
      return result;
    },
    [deleteShowcaseMutation]
  );

  const toggleShowcaseStatus = useCallback(
    async (id: string) => {
      const result = await toggleStatusMutation.mutateAsync(id);
      return result?.data;
    },
    [toggleStatusMutation]
  );

  // const activeShowcases = useMemo(
  //   () => showcases?.filter((s : any) => s.isActive && !s.isDeleted),
  //   [showcases]
  // );

  // const inactiveShowcases = useMemo(
  //   () => showcases?.filter((s : any) => !s.isActive && !s.isDeleted),
  //   [showcases]
  // );

  // const deletedShowcases = useMemo(
  //   () => showcases?.filter((s : any) => s.isDeleted),
  //   [showcases]
  // );

  const isMutating = useMemo(
    () =>
      createShowcaseMutation.isPending ||
      updateShowcaseMutation.isPending ||
      deleteShowcaseMutation.isPending ||
      toggleStatusMutation.isPending,
    [
      createShowcaseMutation.isPending,
      updateShowcaseMutation.isPending,
      deleteShowcaseMutation.isPending,
      toggleStatusMutation.isPending,
    ]
  );

  return {
    // Data
    showcases,
    pagination,
    selectedShowcase,
    setSelectedShowcase,

    // Loaders
    isLoadingShowcases,
    isMutating,

    // Errors
    showcasesError,

    // CRUD
    getShowcaseById,
    createShowcase,
    updateShowcase,
    deleteShowcase,
    toggleShowcaseStatus,

    // Mutations
    mutations: {
      create: createShowcaseMutation,
      update: updateShowcaseMutation,
      delete: deleteShowcaseMutation,
      toggleStatus: toggleStatusMutation,
    },

    // Helpers
    // activeShowcases,
    // inactiveShowcases,
    // deletedShowcases,

    // Actions
    refetchShowcases,

    // // Counts
    // activeCount: activeShowcases?.length ?? 0,
    // inactiveCount: inactiveShowcases?.length ?? 0,
    // deletedCount: deletedShowcases?.length ?? 0,
  };
};
