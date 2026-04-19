"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { appFeaturedApi } from "@/lib/api/featured/appFeatured.api";

export const useAdminAppFeatured = () => {
  const queryClient = useQueryClient();

  const createAppFeaturedMutation = useMutation({
    mutationFn: (data: any) => appFeaturedApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "app-featured"] });
      if (response.success) toast.success(response.message || "App Featured created!");
      else toast.error(response.message || "Failed to create");
    },
    onError: (error: any) => {
      console.error("Error creating app featured:", error);
      toast.error(error?.response?.data?.message || "Failed to create app featured");
    },
  });

  return {
    createAppFeatured: createAppFeaturedMutation.mutateAsync,
    isCreating: createAppFeaturedMutation.isPending,
  };
};
