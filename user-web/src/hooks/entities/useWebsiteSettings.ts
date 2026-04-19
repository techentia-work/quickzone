"use client";

import websiteSettingsApi from "@/lib/api/websiteSettings/websiteSettings.api";
import { WebsiteSettingsType } from "@/lib/types/websiteSettings/websiteSettings.types";
import { useQuery } from "@tanstack/react-query";

export const useWebsiteSettings = () => {
  // ✅ Fetch public website settings
  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["websiteSettings"],
    queryFn: async () => {
      const res = await websiteSettingsApi.getPublicSettings();
      if (!res?.success || !res.data) {
        throw new Error(res?.message || "Failed to fetch website settings");
      }
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  return {
    settings,
    isLoading,
    isError,
    error,
    refetch,
  };
};
