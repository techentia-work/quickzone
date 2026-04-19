"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  CreateFeaturedPayload,
} from "@/lib/types/featured/featured.types";
import { featuredApi } from "@/lib/api";

export const useAdminFeatured = (queryParams?: string) => {
  const queryClient = useQueryClient();
  const [selectedFeatured, setSelectedFeatured] = useState<any | null>(null);
  const [pagination, setPagination] = useState<any | null>(null);

  // Fetch all featured
  const {
    data: featuredList = [],
    isLoading: isLoadingFeatured,
    error: featuredError,
    refetch: refetchFeatured,
  } = useQuery({
    queryKey: ["admin", "featured", queryParams],
    queryFn: async () => {
      const res = await featuredApi.getAll(queryParams);
      setPagination(res?.data?.pagination ?? null);
      return (res?.data as any)?.items || [];
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // Get featured stats
  // const {
  //   data: statsResponse,
  //   isLoading: isLoadingStats,
  //   error: statsError,
  // } = useQuery({
  //   queryKey: ["admin", "featured", "stats"],
  //   queryFn: () => featuredApi.getStats(),
  //   enabled: !!featuredList?.length,
  //   refetchOnWindowFocus: true,
  // });

  // const stats = useMemo(() => statsResponse?.data, [statsResponse]);

  // Get featured by ID
  const getFeaturedById = useCallback(async (id: string) => {
    try {
      const response = await featuredApi.getById(id);
      const data = response?.data;
      if (data) setSelectedFeatured(data);
      return data;
    } catch (error) {
      console.error("Error fetching featured:", error);
      throw error;
    }
  }, []);

  // Create
  const createFeaturedMutation = useMutation({
    mutationFn: (data: CreateFeaturedPayload) =>
  featuredApi.create({
    ...data,
    category: Array.isArray(data.category)
      ? data.category
      : data.category
      ? [data.category]
      : [],

    subcategory: Array.isArray(data.subcategory)
      ? data.subcategory
      : data.subcategory
      ? [data.subcategory]
      : [],
  }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "featured"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "featured", "stats"],
      });

      if (response?.data) setSelectedFeatured(response.data);

      if (response.success) toast.success(response.message);
      else toast.error(response.message);
    },
    onError: (error) => {
      console.error("Error creating featured:", error);
      toast.error("Failed to create featured");
    },
  });

  // Update
const updateFeaturedMutation = useMutation({
  mutationFn: ({
    id,
    data,
  }: {
    id: string;
    data: Partial<CreateFeaturedPayload>;
  }) =>
    featuredApi.update(id, {
      ...data,

      // ✅ normalize category (single → array)
      category: Array.isArray(data.category)
        ? data.category
        : data.category
        ? [data.category]
        : [],

      // ✅ normalize subcategory (single → array)
      subcategory: Array.isArray(data.subcategory)
        ? data.subcategory
        : data.subcategory
        ? [data.subcategory]
        : [],
    }),

  onSuccess: (response, variables) => {
    queryClient.invalidateQueries({ queryKey: ["admin", "featured"] });
    queryClient.invalidateQueries({
      queryKey: ["admin", "featured", variables.id],
    });
    queryClient.invalidateQueries({
      queryKey: ["admin", "featured", "stats"],
    });

    if (response?.data && selectedFeatured?._id === variables.id) {
      setSelectedFeatured(response.data);
    }

    if (response.success) toast.success(response.message);
    else toast.error(response.message);
  },

  onError: (error) => {
    console.error("Error updating featured:", error);
    toast.error("Failed to update featured");
  },
});


  // Delete
  const deleteFeaturedMutation = useMutation({
    mutationFn: (id: string) => featuredApi.delete(id),
    onSuccess: (response, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "featured"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "featured", "stats"],
      });

      if (selectedFeatured?._id === deletedId) setSelectedFeatured(null);

      if (response?.success)
        toast.success(response.message || "Featured deleted");
    },
    onError: (error) => {
      console.error("Error deleting featured:", error);
      toast.error("Failed to delete featured");
    },
  });

  // Toggle active/inactive
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => featuredApi.toggleStatus(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "featured"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "featured", id] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "featured", "stats"],
      });

      if (response?.data && selectedFeatured?._id === id) {
        setSelectedFeatured(response.data);
      }

      if (response?.success)
        toast.success(response.message || "Status updated");
    },
    onError: (error) => {
      console.error("Error toggling status:", error);
      toast.error("Failed to toggle status");
    },
  });

  // Mutations pending check
  const isMutating = useMemo(
    () =>
      createFeaturedMutation.isPending ||
      updateFeaturedMutation.isPending ||
      deleteFeaturedMutation.isPending ||
      toggleStatusMutation.isPending,
    [
      createFeaturedMutation.isPending,
      updateFeaturedMutation.isPending,
      deleteFeaturedMutation.isPending,
      toggleStatusMutation.isPending,
    ]
  );

  // CRUD helpers
  const createFeatured = useCallback(
    async (data: CreateFeaturedPayload) =>
      createFeaturedMutation.mutateAsync(data),
    [createFeaturedMutation]
  );

  const updateFeatured = useCallback(
    async (id: string, data: Partial<CreateFeaturedPayload>) =>
      updateFeaturedMutation.mutateAsync({ id, data }),
    [updateFeaturedMutation]
  );

  const deleteFeatured = useCallback(
    async (id: string) => deleteFeaturedMutation.mutateAsync(id),
    [deleteFeaturedMutation]
  );

  const toggleFeaturedStatus = useCallback(
    async (id: string) => toggleStatusMutation.mutateAsync(id),
    [toggleStatusMutation]
  );

  // Helpers
  const getActiveFeatured = useCallback(
    () => featuredList?.filter((item: any) => item.isActive && !item.isDeleted),
    [featuredList]
  );

  const getDeletedFeatured = useCallback(
    () => featuredList?.filter((item: any) => item.isDeleted),
    [featuredList]
  );

  const clearSelectedFeatured = useCallback(
    () => setSelectedFeatured(null),
    []
  );

  return {
    featuredList,
    pagination,
    selectedFeatured,
    // stats,

    isLoadingFeatured,
    // isLoadingStats,
    isMutating,

    featuredError,
    // statsError,

    refetchFeatured,

    createFeatured,
    updateFeatured,
    deleteFeatured,
    toggleFeaturedStatus,

    mutations: {
      create: createFeaturedMutation,
      update: updateFeaturedMutation,
      delete: deleteFeaturedMutation,
      toggleStatus: toggleStatusMutation,
    },

    setSelectedFeatured,
    clearSelectedFeatured,

    getActiveFeatured,
    getDeletedFeatured,

    totalFeatured: featuredList?.length,
    activeFeaturedCount: getActiveFeatured()?.length,
    deletedFeaturedCount: getDeletedFeatured()?.length,
  };
};
