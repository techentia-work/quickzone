"use client";

import walletApi from "@/lib/api/wallet/wallet.api";
import { WalletType } from "@/lib/types/wallet/wallet.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useWallet = () => {
  const queryClient = useQueryClient();

  // ✅ Fetch user wallet
  const {
    data,
    isLoading,
    isError,
    refetch: refetchWallet,
  } = useQuery<WalletType | null>({
    queryKey: ["wallet"],
    queryFn: async () => {
      try {
        const res = await walletApi.getWallet();
        if (res?.data) return res.data;
        return null;
      } catch (error) {
        toast.error("Failed to fetch wallet");
        return null;
      }
    },
    refetchOnWindowFocus: false,
  });

  // ✅ Create wallet for user
  const createMutation = useMutation({
    mutationFn: async (payload: {
      ownerId: string;
      ownerModel: string;
      ownerName: string;
    }) => walletApi.createWallet(payload),
    onSuccess: (res) => {
      if (res?.success) {
        toast.success("Wallet created successfully");
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        toast.error(res?.data?.message || "Failed to create wallet");
      }
    },
    onError: () => toast.error("Failed to create wallet"),
  });

  // ✅ Update wallet balance
  const updateBalanceMutation = useMutation({
    mutationFn: async (payload: { amount: number }) =>
      walletApi.updateWalletBalance(payload.amount),
    onSuccess: (res) => {    
      toast.success("Wallet balance updated");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: () => toast.error("Failed to update balance"),
  });

  // ✅ Deactivate wallet
  const deactivateMutation = useMutation({
    mutationFn: async (walletId: string) =>
      walletApi.deactivateWallet(walletId),
    onSuccess: (res) => {
      if (res?.data?.success) {
        toast.success("Wallet deactivated");
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        toast.error(res?.data?.message || "Failed to deactivate wallet");
      }
    },
    onError: () => toast.error("Failed to deactivate wallet"),
  });

  // ✅ Fetch promo cash info separately
  const promoCashQuery = useQuery({
    queryKey: ["wallet", "promoCash"],
    queryFn: async () => {
      try {
        const res = await walletApi.getPromoCash();
        if (res?.data?.data) return res.data.data;
        return { promoCash: 0, validTill: null };
      } catch {
        toast.error("Failed to fetch promo cash info");
        return { promoCash: 0, validTill: null };
      }
    },
    enabled: !!data, // only fetch if wallet exists
    refetchOnWindowFocus: false,
  });

  return {
    // Data
    wallet: data ?? null,
    promoCash: promoCashQuery.data,
    isLoading,
    isError,

    // Actions
    refetchWallet,
    createWallet: createMutation.mutateAsync,
    updateWalletBalance: updateBalanceMutation.mutateAsync,
    deactivateWallet: deactivateMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdatingBalance: updateBalanceMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
  };
};
