"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { CreateSliderPayload } from "@/lib/types/slider/slider.types";
import sliderApi from "@/lib/api/slider/slider.api";

export const useAdminSlider = (queryParams?: string) => {
  const queryClient = useQueryClient();
  const [selectedSlider, setSelectedSlider] = useState<any | null>(null);
  const [pagination, setPagination] = useState<any | null>(null);

  const {
    data: sliderList = [],
    isLoading: isLoadingSlider,
    error: sliderError,
    refetch: refetchSlider,
  } = useQuery({
    queryKey: ["admin", "slider", queryParams],
    queryFn: async () => {
      const res = await sliderApi.getAll(queryParams);
      setPagination(res?.data?.pagination ?? null);
      return (res?.data as any).items || [];
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const getSliderById = useCallback(async (id: string) => {
    try {
      const response = await sliderApi.getById(id);
      const data = response?.data;
      if (data) setSelectedSlider(data);
      return data;
    } catch (error) {
      console.error("Error fetching slider:", error);
      throw error;
    }
  }, []);

  const createSliderMutation = useMutation({
    mutationFn: (data: CreateSliderPayload) => sliderApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "slider"] });
      if (response?.data) setSelectedSlider(response.data);
      if (response.success) toast.success(response.message);
      else toast.error(response.message);
    },
    onError: (error) => {
      console.error("Error creating slider:", error);
      toast.error("Failed to create slider");
    },
  });

  const updateSliderMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateSliderPayload>;
    }) => sliderApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "slider"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "slider", variables.id],
      });
      if (response?.data && selectedSlider?._id === variables.id) {
        setSelectedSlider(response.data);
      }
      if (response.success) toast.success(response.message);
      else toast.error(response.message);
    },
    onError: (error) => {
      console.error("Error updating slider:", error);
      toast.error("Failed to update slider");
    },
  });

  const deleteSliderMutation = useMutation({
    mutationFn: (id: string) => sliderApi.delete(id),
    onSuccess: (response, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "slider"] });
      if (selectedSlider?._id === deletedId) setSelectedSlider(null);
      if (response?.success)
        toast.success(response.message || "Slider deleted");
    },
    onError: (error) => {
      console.error("Error deleting slider:", error);
      toast.error("Failed to delete slider");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => sliderApi.toggleStatus(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "slider"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "slider", id] });
      if (response?.data && selectedSlider?._id === id) {
        setSelectedSlider(response.data);
      }
      if (response?.success)
        toast.success(response.message || "Status updated");
    },
    onError: (error) => {
      console.error("Error toggling status:", error);
      toast.error("Failed to toggle status");
    },
  });

  const isMutating = useMemo(
    () =>
      createSliderMutation.isPending ||
      updateSliderMutation.isPending ||
      deleteSliderMutation.isPending ||
      toggleStatusMutation.isPending,
    [
      createSliderMutation.isPending,
      updateSliderMutation.isPending,
      deleteSliderMutation.isPending,
      toggleStatusMutation.isPending,
    ]
  );

  const createSlider = useCallback(
    async (data: CreateSliderPayload) => createSliderMutation.mutateAsync(data),
    [createSliderMutation]
  );

  const updateSlider = useCallback(
    async (id: string, data: Partial<CreateSliderPayload>) =>
      updateSliderMutation.mutateAsync({ id, data }),
    [updateSliderMutation]
  );

  const deleteSlider = useCallback(
    async (id: string) => deleteSliderMutation.mutateAsync(id),
    [deleteSliderMutation]
  );

  const toggleSliderStatus = useCallback(
    async (id: string) => toggleStatusMutation.mutateAsync(id),
    [toggleStatusMutation]
  );

  // const getActiveSlider = useCallback(
  //   () => sliderList?.filter((item: any) => item.isActive && !item.isDeleted),
  //   [sliderList]
  // );

  // const getDeletedSlider = useCallback(
  //   () => sliderList?.filter((item: any) => item.isDeleted),
  //   [sliderList]
  // );

  const clearSelectedSlider = useCallback(() => setSelectedSlider(null), []);

  return {
    sliderList,
    pagination,
    selectedSlider,
    isLoadingSlider,
    isMutating,
    sliderError,
    refetchSlider,
    createSlider,
    updateSlider,
    deleteSlider,
    toggleSliderStatus,
    mutations: {
      create: createSliderMutation,
      update: updateSliderMutation,
      delete: deleteSliderMutation,
      toggleStatus: toggleStatusMutation,
    },
    setSelectedSlider,
    clearSelectedSlider,
    // getActiveSlider,
    // getDeletedSlider,
    // totalSlider: sliderList?.length,
    // activeSliderCount: getActiveSlider()?.length,
    // deletedSliderCount: getDeletedSlider()?.length,
  };
};
