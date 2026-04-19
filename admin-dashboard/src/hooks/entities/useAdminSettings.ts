"use client";

import adminSettingApi from "@/lib/api/adminSettings/adminSettings.api";
import { AdminSettingType } from "@/lib/types/adminSettings/adminSettings.types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export const useAdminSettings = () => {
  const queryClient = useQueryClient();
  const [selectedSetting, setSelectedSetting] =
    useState<AdminSettingType | null>(null);

  // === Fetch current settings ===
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings,
  } = useQuery<AdminSettingType>({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await adminSettingApi.getSettings();
      return res?.data as AdminSettingType;   // ⭐ FIXED TYPING
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // === Update settings ===
  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<AdminSettingType>) =>
      adminSettingApi.updateSettings(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      setSelectedSetting(res?.data as AdminSettingType);
    },
    onError: (err: any) => {
      console.error("❌ Failed to update settings:", err);
      toast.error("❌ Failed to update settings");
    },
  });

  // === Reset settings ===
  const resetSettingsMutation = useMutation({
    mutationFn: () => adminSettingApi.resetSettings(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      setSelectedSetting(res?.data as AdminSettingType);
      toast.success("🔄 Settings reset to default");
    },
    onError: () => toast.error("❌ Failed to reset settings"),
  });

  // === Get settings summary ===
  const getSummary = useCallback(async () => {
    try {
      const res = await adminSettingApi.getSettingsSummary();
      return res?.data;
    } catch (err) {
      console.error("❌ Failed to fetch summary:", err);
      toast.error("Failed to fetch summary");
      throw err;
    }
  }, []);

  // === Memoized mutation status ===
  const isMutating = useMemo(
    () => updateSettingsMutation.isPending || resetSettingsMutation.isPending,
    [updateSettingsMutation.isPending, resetSettingsMutation.isPending]
  );

  // === Helper Callbacks ===
  const updateSettings = useCallback(
    async (data: Partial<AdminSettingType>) =>
      updateSettingsMutation.mutateAsync(data),
    [updateSettingsMutation]
  );

  const resetSettings = useCallback(
    async () => resetSettingsMutation.mutateAsync(),
    [resetSettingsMutation]
  );

  const clearSelectedSetting = useCallback(() => setSelectedSetting(null), []);

  // === Return Hook API ===
  return {
    settings,
    selectedSetting,
    isLoadingSettings,
    settingsError,
    isMutating,
    refetchSettings,
    getSummary,
    updateSettings,
    resetSettings,
    setSelectedSetting,
    clearSelectedSetting,
    mutations: {
      update: updateSettingsMutation,
      reset: resetSettingsMutation,
    },
  };
};

export default useAdminSettings;
