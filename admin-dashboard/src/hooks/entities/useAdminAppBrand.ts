"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import appBrandApi from "@/lib/api/appBrand/appBrand.api";
import toast from "react-hot-toast";

export const useAdminAppBrand = (query = "") => {
  const queryClient = useQueryClient();

  const { data: appBrands = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "app-brand", query],
    queryFn: async () => {
      const res = await appBrandApi.getAll(query);
      return (res.data as any)?.items || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => appBrandApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "app-brand"] });
      toast.success("App brand added successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Error adding brand");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => appBrandApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "app-brand"] });
      toast.success("App brand removed successfully!");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => appBrandApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "app-brand"] });
    },
  });

  const createAppBrand = useCallback((data: any) => createMutation.mutateAsync(data), [createMutation]);
  const deleteAppBrand = useCallback((id: string) => deleteMutation.mutateAsync(id), [deleteMutation]);
  const toggleAppBrandStatus = useCallback((id: string) => toggleStatusMutation.mutateAsync(id), [toggleStatusMutation]);

  return {
    appBrands,
    isLoading,
    refetch,
    createAppBrand,
    deleteAppBrand,
    toggleAppBrandStatus,
    isCreating: createMutation.isPending,
  };
};
