"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import transactionApi from "@/lib/api/transaction/transaction.api";
import { TransactionType } from "@/lib/types/transaction/transaction.types";

export const useTransaction = (walletId?: string) => {
  const queryClient = useQueryClient();

  // ✅ Fetch all user transactions (for specific wallet)
  const {
    data: transactions,
    isLoading,
    isError,
    refetch: refetchTransactions,
  } = useQuery<TransactionType[]>({
    queryKey: ["transactions", walletId],
    queryFn: async () => {
      if (!walletId) return [];
      try {
        const res = await transactionApi.getUserTransactions(walletId);
        if ((res?.data as any)?.transactions) return (res.data as any).transactions;
        return [];
      } catch (error) {
        toast.error("Failed to fetch transactions");
        return [];
      }
    },
    enabled: !!walletId, // only run if walletId exists
    refetchOnWindowFocus: false,
  });

  // ✅ Fetch wallet summary (credits, debits, balance)
  const summaryQuery = useQuery({
    queryKey: ["transactionSummary", walletId],
    queryFn: async () => {
      if (!walletId) return null;
      try {
        const res = await transactionApi.getWalletBalanceSummary(walletId);
        if (res?.data) return res.data;
        return { totalCredit: 0, totalDebit: 0, balance: 0 };
      } catch {
        toast.error("Failed to fetch wallet summary");
        return { totalCredit: 0, totalDebit: 0, balance: 0 };
      }
    },
    enabled: !!walletId,
    refetchOnWindowFocus: false,
  });

  // ✅ Fetch a single transaction by ID (utility method)
  const getTransactionById = async (transactionId: string) => {
    try {
      const res = await transactionApi.getTransactionById(transactionId);
      if (res?.data?.data) return res.data.data;
      toast.error("Transaction not found");
      return null;
    } catch {
      toast.error("Failed to fetch transaction details");
      return null;
    }
  };

  return {
    // Data
    transactions: transactions ?? [],
    summary: summaryQuery.data,
    isLoading,
    isError,

    // Actions
    refetchTransactions,
    getTransactionById,

    // States
    isFetchingSummary: summaryQuery.isFetching,
  };
};
