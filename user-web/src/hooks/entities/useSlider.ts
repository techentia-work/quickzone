"use client";

import { useQuery } from "@tanstack/react-query";
import { sliderApi } from "@/lib/api/slider/slider.api";
import { SliderType } from "@/lib/types/slider/slider.types";

interface UseSliderProps {
  enabled?: boolean;
  queryParams?: string;
}

export const useSlider = ({
  enabled = true,
  queryParams,
}: UseSliderProps = {}) => {
  const query = useQuery({
    queryKey: ["user", "slider", queryParams],
    queryFn: async (): Promise<SliderType[]> => {
      const res = await sliderApi.getAll(queryParams);
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
