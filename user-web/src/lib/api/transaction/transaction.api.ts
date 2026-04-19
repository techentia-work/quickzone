import { TransactionType } from "@/lib/types/transaction/transaction.types";
import axiosClient from "../client/axios";

const transactionApi = {
  // ✅ Get all transactions for a wallet
  getUserTransactions: (walletId: string) =>
    axiosClient.get<{ data: TransactionType[] }>(
      `/api/transaction/wallet/${walletId}`
    ),

  // ✅ Get single transaction details
  getTransactionById: (transactionId: string) =>
    axiosClient.get<{ data: TransactionType }>(
      `/api/transaction/detail/${transactionId}`
    ),

  // ✅ Get wallet balance summary (credit/debit totals)
  getWalletBalanceSummary: (walletId: string) =>
    axiosClient.get<{
      data: { totalCredit: number; totalDebit: number; balance: number };
    }>(`/api/transaction/wallet/${walletId}/summary`),
};

export default transactionApi;
