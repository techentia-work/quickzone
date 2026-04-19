"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { CreateBannerPayload } from "@/lib/types/banner/banner.types";
import bannerApi from "@/lib/api/banner/banner.api";

export const useAdminBanner = (queryParams?: string) => {
  const queryClient = useQueryClient();
  const [selectedBanner, setSelectedBanner] = useState<any | null>(null);
  const [pagination, setPagination] = useState<any | null>(null);

  // Fetch all banners
  const {
    data: bannerList = [],
    isLoading: isLoadingBanner,
    error: bannerError,
    refetch: refetchBanner,
  } = useQuery({
    queryKey: ["admin", "banner", queryParams],
    queryFn: async () => {
      const res = await bannerApi.getAll(queryParams);
      console.log("Ress banners", res);

      setPagination(res?.data?.pagination ?? null);
      return (res?.data as any).items || [];
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // Get banner by ID
  const getBannerById = useCallback(async (id: string) => {
    try {
      const response = await bannerApi.getById(id);
      const data = response?.data;
      if (data) setSelectedBanner(data);
      return data;
    } catch (error) {
      console.error("Error fetching banner:", error);
      throw error;
    }
  }, []);

  // Create
  const createBannerMutation = useMutation({
    mutationFn: (data: CreateBannerPayload) => bannerApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banner"] });

      if (response?.data) setSelectedBanner(response.data);
    },
    onError: (error) => {
      console.error("Error creating banner:", error);
    },
  });

  // Update
  const updateBannerMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateBannerPayload>;
    }) => bannerApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banner"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "banner", variables.id],
      });

      if (response?.data && selectedBanner?._id === variables.id) {
        setSelectedBanner(response.data);
      }
    },
    onError: (error) => {
      console.error("Error updating banner:", error);
    },
  });

  // Delete
  const deleteBannerMutation = useMutation({
    mutationFn: (id: string) => bannerApi.delete(id),
    onSuccess: (response, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banner"] });
      if (selectedBanner?._id === deletedId) setSelectedBanner(null);
    },
    onError: (error) => {
      console.error("Error deleting banner:", error);
    },
  });

  // Toggle active/inactive
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => bannerApi.toggleStatus(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banner"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "banner", id] });

      if (response?.data && selectedBanner?._id === id) {
        setSelectedBanner(response.data);
      }

    },
    onError: (error) => {
      console.error("Error toggling status:", error);
    },
  });

  const isMutating = useMemo(
    () =>
      createBannerMutation.isPending ||
      updateBannerMutation.isPending ||
      deleteBannerMutation.isPending ||
      toggleStatusMutation.isPending,
    [
      createBannerMutation.isPending,
      updateBannerMutation.isPending,
      deleteBannerMutation.isPending,
      toggleStatusMutation.isPending,
    ]
  );

  // CRUD helpers
  const createBanner = useCallback(
    async (data: CreateBannerPayload) => createBannerMutation.mutateAsync(data),
    [createBannerMutation]
  );

  const updateBanner = useCallback(
    async (id: string, data: Partial<CreateBannerPayload>) =>
      updateBannerMutation.mutateAsync({ id, data }),
    [updateBannerMutation]
  );

  const deleteBanner = useCallback(
    async (id: string) => deleteBannerMutation.mutateAsync(id),
    [deleteBannerMutation]
  );

  const toggleBannerStatus = useCallback(
    async (id: string) => toggleStatusMutation.mutateAsync(id),
    [toggleStatusMutation]
  );

  // const getActiveBanner = useCallback(
  //   () => bannerList?.filter((item: any) => item.isActive && !item.isDeleted),
  //   [bannerList]
  // );

  // const getDeletedBanner = useCallback(
  //   () => bannerList?.filter((item: any) => item.isDeleted),
  //   [bannerList]
  // );

  const clearSelectedBanner = useCallback(() => setSelectedBanner(null), []);

  return {
    bannerList,
    pagination,
    selectedBanner,
    isLoadingBanner,
    isMutating,
    bannerError,
    refetchBanner,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    mutations: {
      create: createBannerMutation,
      update: updateBannerMutation,
      delete: deleteBannerMutation,
      toggleStatus: toggleStatusMutation,
    },
    setSelectedBanner,
    clearSelectedBanner,
    // getActiveBanner,
    // getDeletedBanner,
    // totalBanner: bannerList?.length,
    // activeBannerCount: getActiveBanner()?.length,
    // deletedBannerCount: getDeletedBanner()?.length,
  };
};
