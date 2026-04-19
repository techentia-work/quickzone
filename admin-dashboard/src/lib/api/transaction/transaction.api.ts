import { TransactionTypeFrontend } from "@/lib/types/transaction/transaction.types";
import axiosClient from "../client/axios";
import { PaginationResponse } from "@/lib/types";

export const transactionAdminApi = {
  /** 🔹 Get all transactions (paginated) */
  getAllTransactions: () =>
    axiosClient.get<{
      transactions: TransactionTypeFrontend[];
      total: number;
      pagination: PaginationResponse;
    }>("/api/transaction/admin/all"),

  /** 🔹 Get transactions for a specific user */
  getTransactionsByUser: (userId: string) =>
    axiosClient.get<{
      transactions: TransactionTypeFrontend[];
      total: number;
    }>(`/api/transaction/admin/user/${userId}`),

  /** 🔹 Get a single transaction by ID */
  getTransactionById: (transactionId: string) =>
    axiosClient.get<TransactionTypeFrontend>(
      `/api/transaction/admin/${transactionId}`
    ),

  /** 🔹 Manually adjust a transaction (credit/debit by admin) */
  adjustTransaction: (data: {
    walletId: string;
    type: "CREDIT" | "DEBIT";
    amount: number;
    description?: string;
    source?: string;
  }) =>
    axiosClient.post<TransactionTypeFrontend>(
      "/api/transaction/admin/adjust",
      data
    ),

  /** 🔹 Fetch overall transaction statistics */
  getTransactionStats: () =>
    axiosClient.get<{
      totalTransactions: number;
      totalVolume: number;
      avgTransactionValue: number;
      totalCredits: number;
      totalDebits: number;
    }>("/api/transaction/admin/stats"),
};

export default transactionAdminApi;
