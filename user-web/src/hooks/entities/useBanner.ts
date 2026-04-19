"use client";

import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "@/lib/api/banner/banner.api";
import { BannerType } from "@/lib/types/banner/bannr.types";

interface UseBannerProps {
  enabled?: boolean;
  queryParams?: string;
}

export const useBanner = ({ enabled = true, queryParams }: UseBannerProps = {}) => {
  const query = useQuery({
    queryKey: ["user", "banner", queryParams],
    queryFn: async (): Promise<BannerType[]> => {
      const res = await bannerApi.getAll(queryParams);
      return (res?.data as any).items || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data || [],
    error: query.error,
    refetch: query.refetch,
    isLoading: query.isLoading,
  };
};