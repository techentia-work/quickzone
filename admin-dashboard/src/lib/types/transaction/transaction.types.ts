// src/lib/types/transaction/transaction.types.ts

export type TransactionType = "CREDIT" | "DEBIT";

export type TransactionSourceType =
  | "ORDER"
  | "REFUND"
  | "PROMO"
  | "MANUAL"
  | "WITHDRAWAL"
  | "SYSTEM";

export type TransactionStatusType = "SUCCESS" | "FAILED" | "PENDING";

export interface TransactionTypeFrontend {
  _id: string;
  walletId: string;
  type: TransactionType;
  source: TransactionSourceType;
  amount: number;
  balanceAfter: number;
  status: TransactionStatusType;
  description?: string;
  referenceId?: string | null;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}