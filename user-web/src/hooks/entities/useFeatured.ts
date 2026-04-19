"use client";

import { useQuery } from "@tanstack/react-query";
import { featuredApi } from "@/lib/api/featured/featured.api";
import { FeaturedType } from "@/lib/types/featured/featured.types";

interface UseFeaturedProps {
  enabled?: boolean;
  queryParams?: string; // Optional filter like ?page=1&limit=10
}

export const useFeatured = ({
  enabled = true,
  queryParams,
}: UseFeaturedProps = {}) => {
  const query = useQuery({
    queryKey: ["user", "featured", queryParams],
    queryFn: async (): Promise<FeaturedType[]> => {
      const res = await featuredApi.getAll(queryParams);
      return (res?.data as any).items || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data || [],
    error: query.error,
    refetch: query.refetch,
    isLoading: query.isLoading,
  };
};
