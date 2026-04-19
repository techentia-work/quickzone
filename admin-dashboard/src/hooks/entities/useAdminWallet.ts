"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { WalletType } from "@/lib/types/wallet/wallet.types";
import walletAdminApi from "@/lib/api/wallet/wallet.api";

export const useAdminWallet = (queryParams?: string) => {
  const queryClient = useQueryClient();
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [pagination, setPagination] = useState<any | null>(null);

  // === Fetch all wallets ===
  const {
    data: wallets = [],
    isLoading: isLoadingWallet,
    error: walletError,
    refetch: refetchWallets,
  } = useQuery({
    queryKey: ["admin", "wallets", queryParams],
    queryFn: async () => {
      const res = await walletAdminApi.getAllWallets();
      setPagination(res?.data?.pagination ?? null);
      return res?.data?.wallets || [];
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // === Get single wallet by ID ===
  const getWalletById = useCallback(async (walletId: string) => {
    try {
      const res = await walletAdminApi.getWalletById(walletId);
      if (res?.data) setSelectedWallet(res.data);
      return res?.data;
    } catch (error) {
      console.error("❌ Error fetching wallet:", error);
      toast.error("Failed to fetch wallet details");
      throw error;
    }
  }, []);

  // === Adjust Wallet Balance ===
  const adjustBalanceMutation = useMutation({
    mutationFn: (data: { walletId: string; amount: number }) =>
      walletAdminApi.adjustWalletBalance(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "wallets"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "wallets", variables.walletId],
      });
      if (selectedWallet?._id === variables.walletId) {
        setSelectedWallet((res as any).data);
      }
      toast.success("✅ Wallet balance updated successfully");
    },
    onError: () => toast.error("❌ Failed to update wallet balance"),
  });

  // === Adjust Promo Cash ===
  const adjustPromoCashMutation = useMutation({
    mutationFn: (data: {
      walletId: string;
      amount: number;
      validDays?: number;
    }) => walletAdminApi.adjustPromoCash(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "wallets"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "wallets", variables.walletId],
      });
      if (selectedWallet?._id === variables.walletId) {
        setSelectedWallet((res as any).data);
      }
    },
    onError: () => toast.error("❌ Failed to update promo cash"),
  });

  // === Set Wallet Status (Activate/Deactivate) ===
  const setWalletStatusMutation = useMutation({
    mutationFn: (params: { walletId: string; isActive: boolean }) =>
      walletAdminApi.setWalletStatus(params.walletId, params.isActive),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "wallets"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "wallets", variables.walletId],
      });
      if (selectedWallet?._id === variables.walletId) {
        setSelectedWallet((res as any).data);
      }
      toast.success("🔄 Wallet status updated");
    },
    onError: () => toast.error("❌ Failed to update wallet status"),
  });

  // === Memoized Mutation Status ===
  const isMutating = useMemo(
    () =>
      adjustBalanceMutation.isPending ||
      setWalletStatusMutation.isPending ||
      adjustPromoCashMutation.isPending,
    [
      adjustBalanceMutation.isPending,
      setWalletStatusMutation.isPending,
      adjustPromoCashMutation.isPending,
    ]
  );

  // === Helper Callbacks ===
  const adjustBalance = useCallback(
    async (walletId: string, amount: number) =>
      adjustBalanceMutation.mutateAsync({ walletId, amount }),
    [adjustBalanceMutation]
  );

  const adjustPromoCash = useCallback(
    async (walletId: string, amount: number, validDays?: number) =>
      adjustPromoCashMutation.mutateAsync({ walletId, amount, validDays }),
    [adjustPromoCashMutation]
  );

  const setWalletStatus = useCallback(
    async (walletId: string, isActive: boolean) =>
      setWalletStatusMutation.mutateAsync({ walletId, isActive }),
    [setWalletStatusMutation]
  );

  const clearSelectedWallet = useCallback(() => setSelectedWallet(null), []);

  // === Return Hook API ===
  return {
    wallets,
    pagination,
    selectedWallet,
    isLoadingWallet,
    isMutating,
    walletError,
    refetchWallets,
    getWalletById,
    adjustBalance,
    adjustPromoCash,
    setWalletStatus,
    mutations: {
      adjustBalance: adjustBalanceMutation,
      setStatus: setWalletStatusMutation,
      adjustPromoCash: adjustPromoCashMutation,
    },
    setSelectedWallet,
    clearSelectedWallet,
  };
};

export default useAdminWallet;
