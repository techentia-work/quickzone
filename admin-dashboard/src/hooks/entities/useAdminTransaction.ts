"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { TransactionTypeFrontend } from "@/lib/types/transaction/transaction.types";
import transactionAdminApi from "@/lib/api/transaction/transaction.api";

export const useAdminTransaction = (queryParams?: string) => {
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTypeFrontend | null>(null);
  const [pagination, setPagination] = useState<any | null>(null);

  // === Fetch all transactions (paginated) ===
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["admin", "transactions", queryParams],
    queryFn: async () => {
      const res = await transactionAdminApi.getAllTransactions();
      setPagination(res?.data?.pagination ?? null);
      return res?.data?.transactions || [];
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // === Fetch single transaction by ID ===
  const getTransactionById = useCallback(async (transactionId: string) => {
    try {
      const res = await transactionAdminApi.getTransactionById(transactionId);
      if (res?.data) setSelectedTransaction(res.data);
      return res?.data;
    } catch (error) {
      console.error("❌ Error fetching transaction:", error);
      toast.error("Failed to fetch transaction details");
      throw error;
    }
  }, []);

  // === Adjust (manually create) transaction (credit/debit) ===
  const adjustTransactionMutation = useMutation({
    mutationFn: (data: {
      walletId: string;
      type: "CREDIT" | "DEBIT";
      amount: number;
      description?: string;
      source?: string;
    }) => transactionAdminApi.adjustTransaction(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
      toast.success("✅ Transaction recorded successfully");
    },
    onError: () => toast.error("❌ Failed to record transaction"),
  });

  // === Fetch transaction stats ===
  const {
    data: transactionStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin", "transactionStats"],
    queryFn: async () => {
      const res = await transactionAdminApi.getTransactionStats();
      return res?.data;
    },
    refetchOnWindowFocus: false,
  });

  // === Memoized mutation state ===
  const isMutating = useMemo(
    () => adjustTransactionMutation.isPending,
    [adjustTransactionMutation.isPending]
  );

  // === Helper functions ===
  const adjustTransaction = useCallback(
    async (
      walletId: string,
      type: "CREDIT" | "DEBIT",
      amount: number,
      description?: string,
      source?: string
    ) =>
      adjustTransactionMutation.mutateAsync({
        walletId,
        type,
        amount,
        description,
        source,
      }),
    [adjustTransactionMutation]
  );

  const clearSelectedTransaction = useCallback(
    () => setSelectedTransaction(null),
    []
  );

  // === Return API ===
  return {
    transactions,
    pagination,
    transactionStats,
    selectedTransaction,
    isLoadingTransactions,
    isLoadingStats,
    isMutating,
    transactionError,
    refetchTransactions,
    refetchStats,
    getTransactionById,
    adjustTransaction,
    mutations: {
      adjustTransaction: adjustTransactionMutation,
    },
    setSelectedTransaction,
    clearSelectedTransaction,
  };
};

export default useAdminTransaction;